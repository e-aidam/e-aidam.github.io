(() => {
  const viewers = Array.from(document.querySelectorAll(".presentation-viewer"));

  const slideNumberFromHref = (href, fallback) => {
    const match = href.match(/(?:slide|page)-(\d+)\.png$/);
    return match ? Number(match[1]) : fallback + 1;
  };

  const countFromToolbar = (viewer, fallback) => {
    const text = viewer.querySelector(".presentation-toolbar span")?.textContent ?? "";
    const match = text.match(/\d+/);
    return match ? Number(match[0]) : fallback;
  };

  const makeButton = (label, className) => {
    const button = document.createElement("button");
    button.className = `presentation-nav-button ${className}`;
    button.type = "button";
    button.textContent = label;
    return button;
  };

  viewers.forEach((viewer) => {
    const stage = viewer.querySelector(".presentation-stage");
    const figure = stage?.querySelector("figure");
    const image = figure?.querySelector("img");
    const caption = figure?.querySelector("figcaption");
    const scrubber = viewer.querySelector(".presentation-scrubber");
    let thumbnails = Array.from(scrubber?.querySelectorAll("a[href$='.png']") ?? []);

    if (!stage || !figure || !image || !caption || thumbnails.length === 0) {
      return;
    }

    const firstHref = thumbnails[0].getAttribute("href") ?? "";
    const unitLabel = firstHref.includes("/page-") ? "Page" : "Slide";
    const unitName = unitLabel.toLowerCase();
    const totalCount = countFromToolbar(viewer, thumbnails.length);
    const hrefPattern = firstHref.match(/^(.*(?:slide|page)-)\d+(\.png)$/);

    if (hrefPattern && totalCount > thumbnails.length) {
      for (let number = thumbnails.length + 1; number <= totalCount; number += 1) {
        const href = `${hrefPattern[1]}${number}${hrefPattern[2]}`;
        const thumbnail = document.createElement("a");
        const img = document.createElement("img");
        const label = document.createElement("span");

        thumbnail.href = href;
        thumbnail.setAttribute("aria-label", `Open ${unitName} ${number}`);
        img.src = href;
        img.alt = "";
        label.textContent = String(number);
        thumbnail.append(img, label);
        scrubber.appendChild(thumbnail);
      }

      thumbnails = Array.from(scrubber.querySelectorAll("a[href$='.png']"));
    }

    const slides = thumbnails.map((thumbnail, index) => {
      const img = thumbnail.querySelector("img");
      const number = slideNumberFromHref(thumbnail.getAttribute("href") ?? "", index);
      return {
        href: thumbnail.getAttribute("href"),
        label: thumbnail.getAttribute("aria-label") ?? `Show slide ${number}`,
        number,
        thumbnail,
        thumbSrc: img?.getAttribute("src") ?? thumbnail.getAttribute("href"),
      };
    });

    const initialIndex = Math.max(
      0,
      slides.findIndex((slide) => slide.href === image.getAttribute("src")),
    );
    let activeIndex = initialIndex;

    const previousButton = makeButton("Previous slide", "presentation-prev");
    const nextButton = makeButton("Next slide", "presentation-next");

    stage.classList.remove("static-presentation-stage");
    stage.classList.add("interactive-presentation-stage");
    stage.tabIndex = -1;
    stage.insertBefore(previousButton, figure);
    stage.appendChild(nextButton);

    const showSlide = (index, shouldFocusStage = false) => {
      const nextIndex = Math.min(Math.max(index, 0), slides.length - 1);
      const slide = slides[nextIndex];

      activeIndex = nextIndex;
      image.src = slide.href;
      image.alt = `${unitLabel} ${slide.number} of ${slides.length}`;
      caption.textContent = `${unitLabel} ${slide.number} of ${slides.length}`;

      thumbnails.forEach((thumbnail, thumbnailIndex) => {
        const isActive = thumbnailIndex === activeIndex;
        thumbnail.classList.toggle("active", isActive);
        thumbnail.setAttribute("aria-current", isActive ? "true" : "false");
      });

      previousButton.disabled = activeIndex === 0;
      nextButton.disabled = activeIndex === slides.length - 1;

      if (shouldFocusStage) {
        slides[activeIndex].thumbnail.scrollIntoView({
          block: "nearest",
          inline: "nearest",
        });
        stage.focus({ preventScroll: true });
      }
    };

    thumbnails.forEach((thumbnail, index) => {
      thumbnail.setAttribute("role", "button");
      thumbnail.setAttribute("aria-current", index === activeIndex ? "true" : "false");

      thumbnail.addEventListener("click", (event) => {
        event.preventDefault();
        showSlide(index, true);
      });

      thumbnail.addEventListener("keydown", (event) => {
        if (event.key === " ") {
          event.preventDefault();
          showSlide(index, true);
        }
      });
    });

    previousButton.addEventListener("click", () => showSlide(activeIndex - 1, true));
    nextButton.addEventListener("click", () => showSlide(activeIndex + 1, true));

    showSlide(activeIndex);
  });
})();
