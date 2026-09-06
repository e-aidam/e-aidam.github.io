(function () {
  const widget = document.querySelector("[data-antibody-widget]");
  if (!widget) return;

  const trigger = widget.querySelector("[data-profile-trigger]");
  const canvas = widget.querySelector("[data-antibody-canvas]");
  const degradeButton = widget.querySelector("[data-degrade-antibody]");
  const ctx = canvas.getContext("2d", { alpha: true });
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const FORMATION_MS = reducedMotion ? 650 : 2300;
  const DEGRADATION_MS = reducedMotion ? 520 : 980;
  const IDLE_FRAME_MS = reducedMotion ? 140 : 36;
  const POINTER_RADIUS = 112;
  const POINTER_RADIUS_SQ = POINTER_RADIUS * POINTER_RADIUS;
  const LINK_DISTANCE_SQ = 34 * 34;

  let state = "profile";
  let frameId = 0;
  let timeoutId = 0;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let particles = [];
  let pointer = null;
  let startedAt = 0;
  let degradedAt = 0;
  let lastFrameAt = 0;
  let isInView = true;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);

  function updateState(nextState) {
    state = nextState;
    widget.dataset.antibodyState = nextState;
    const active = nextState !== "profile";
    trigger.setAttribute("aria-expanded", String(active));
    trigger.setAttribute(
      "aria-label",
      active ? "Antibody simulation active" : "Show antibody particle simulation"
    );
  }

  function canAnimate() {
    return state !== "profile" && isInView && !document.hidden;
  }

  function stopLoop() {
    if (frameId) {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
    }
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutId = 0;
    }
  }

  function scheduleFrame(delay = 0) {
    if (!canAnimate() || frameId || timeoutId) return;
    if (delay > 0) {
      timeoutId = window.setTimeout(() => {
        timeoutId = 0;
        if (canAnimate()) {
          frameId = window.requestAnimationFrame(draw);
        }
      }, delay);
      return;
    }
    frameId = window.requestAnimationFrame(draw);
  }

  function resizeCanvas() {
    const rect = widget.getBoundingClientRect();
    width = Math.max(260, rect.width);
    height = Math.max(260, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createTargets(count) {
    const targets = [];
    const cx = width / 2;
    const cy = height * 0.49;
    const scale = Math.min(width, height) * 0.37;

    const addLine = (x1, y1, x2, y2, points, spread) => {
      const normalX = y1 - y2;
      const normalY = x2 - x1;
      const normalLength = Math.sqrt(normalX * normalX + normalY * normalY) || 1;
      for (let i = 0; i < points; i += 1) {
        const t = points === 1 ? 0 : i / (points - 1);
        const jitter = (Math.random() - 0.5) * spread;
        targets.push({
          x: cx + (x1 + (x2 - x1) * t) * scale + (normalX / normalLength) * jitter,
          y: cy + (y1 + (y2 - y1) * t) * scale + (normalY / normalLength) * jitter,
        });
      }
    };

    const addArc = (centerX, centerY, radiusX, radiusY, from, to, points) => {
      for (let i = 0; i < points; i += 1) {
        const t = points === 1 ? 0 : i / (points - 1);
        const angle = from + (to - from) * t;
        targets.push({
          x: cx + (centerX + Math.cos(angle) * radiusX) * scale,
          y: cy + (centerY + Math.sin(angle) * radiusY) * scale,
        });
      }
    };

    addLine(0, 0.02, 0, 0.88, Math.floor(count * 0.2), 14);
    addLine(-0.04, 0.07, -0.58, -0.68, Math.floor(count * 0.18), 13);
    addLine(0.04, 0.07, 0.58, -0.68, Math.floor(count * 0.18), 13);
    addLine(-0.16, 0.18, -0.73, -0.52, Math.floor(count * 0.11), 9);
    addLine(0.16, 0.18, 0.73, -0.52, Math.floor(count * 0.11), 9);
    addLine(-0.09, 0.2, -0.2, 0.76, Math.floor(count * 0.07), 8);
    addLine(0.09, 0.2, 0.2, 0.76, Math.floor(count * 0.07), 8);
    addArc(-0.58, -0.67, 0.22, 0.24, Math.PI * 0.87, Math.PI * 1.92, Math.floor(count * 0.04));
    addArc(0.58, -0.67, 0.22, 0.24, Math.PI * 1.08, Math.PI * 2.13, Math.floor(count * 0.04));

    while (targets.length < count) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * scale * 0.13;
      targets.push({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      });
    }

    return targets.slice(0, count);
  }

  function offscreenPoint() {
    const side = Math.floor(Math.random() * 4);
    const margin = Math.max(width, height) * (0.35 + Math.random() * 0.35);
    if (side === 0) return { x: -margin, y: Math.random() * height };
    if (side === 1) return { x: width + margin, y: Math.random() * height };
    if (side === 2) return { x: Math.random() * width, y: -margin };
    return { x: Math.random() * width, y: height + margin };
  }

  function particleCount() {
    if (reducedMotion) return 80;
    if (width < 360) return 140;
    if (width < 480) return 170;
    return 240;
  }

  function buildParticles() {
    resizeCanvas();
    const count = particleCount();
    const targets = createTargets(count);
    particles = targets.map((target, index) => {
      const start = offscreenPoint();
      const hue = 166 + Math.random() * 22;
      const lightness = 66 + Math.random() * 8;
      return {
        x: start.x,
        y: start.y,
        vx: 0,
        vy: 0,
        targetX: target.x,
        targetY: target.y,
        outX: start.x,
        outY: start.y,
        delay: reducedMotion ? 0 : (index / count) * 520 + Math.random() * 180,
        phase: Math.random() * Math.PI * 2,
        size: 1.1 + Math.random() * 1.35,
        glowSize: 3.6 + Math.random() * 3.2,
        alpha: 0.55 + Math.random() * 0.42,
        coreColor: `hsl(${hue}, 88%, ${lightness + 8}%)`,
        glowColor: `hsl(${hue}, 84%, ${lightness}%)`,
        linkIndex: index % 10 === 0 && index + 1 < count ? index + 1 : -1,
      };
    });
  }

  function drawParticle(particle, alpha) {
    if (alpha <= 0.01) return;

    ctx.globalAlpha = alpha * 0.18;
    ctx.fillStyle = particle.glowColor;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.glowSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = alpha;
    ctx.fillStyle = particle.coreColor;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  }

  function draw(now) {
    frameId = 0;
    if (!canAnimate()) return;

    const idleDelay = state === "formed" ? IDLE_FRAME_MS : 0;
    if (idleDelay && now - lastFrameAt < idleDelay) {
      scheduleFrame(idleDelay - (now - lastFrameAt));
      return;
    }

    lastFrameAt = now;

    const elapsed = now - startedAt;
    const rawProgress = clamp(elapsed / FORMATION_MS, 0, 1);
    const progress = easeOutCubic(rawProgress);
    const degradationProgress = state === "degrading" ? clamp((now - degradedAt) / DEGRADATION_MS, 0, 1) : 0;
    const visibleAlpha = state === "degrading" ? 1 - degradationProgress : clamp(rawProgress * 1.35, 0, 1);

    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";

    for (let i = 0; i < particles.length; i += 1) {
      const particle = particles[i];
      const delayProgress = clamp((elapsed - particle.delay) / FORMATION_MS, 0, 1);
      const localProgress = state === "degrading" ? 1 : easeOutCubic(delayProgress);
      const drift = reducedMotion ? 0 : Math.sin(now * 0.0014 + particle.phase) * 4.2;
      const orbit = reducedMotion ? 0 : Math.cos(now * 0.0009 + particle.phase) * 2.4;
      let targetX = particle.targetX + orbit * (0.35 + progress);
      let targetY = particle.targetY + drift * (0.35 + progress);

      if (state === "degrading") {
        targetX = particle.outX;
        targetY = particle.outY;
      }

      if (pointer && state !== "degrading") {
        const dx = particle.x - pointer.x;
        const dy = particle.y - pointer.y;
        const distSq = dx * dx + dy * dy;
        if (distSq > 0.01 && distSq < POINTER_RADIUS_SQ) {
          const dist = Math.sqrt(distSq);
          const force = (1 - distSq / POINTER_RADIUS_SQ) * 52;
          targetX += (dx / dist) * force;
          targetY += (dy / dist) * force;
        }
      }

      const stiffness = state === "degrading" ? 0.018 : 0.012 + localProgress * 0.018;
      particle.vx += (targetX - particle.x) * stiffness;
      particle.vy += (targetY - particle.y) * stiffness;
      particle.vx *= state === "degrading" ? 0.91 : 0.885;
      particle.vy *= state === "degrading" ? 0.91 : 0.885;
      particle.x += particle.vx;
      particle.y += particle.vy;

      const twinkle = reducedMotion ? 1 : 0.84 + Math.sin(now * 0.0035 + particle.phase) * 0.16;
      const alpha = particle.alpha * visibleAlpha * clamp(localProgress * 1.35, 0, 1) * twinkle;
      drawParticle(particle, alpha);

      if (!reducedMotion && particle.linkIndex > -1 && localProgress > 0.78 && state !== "degrading") {
        const next = particles[particle.linkIndex];
        const dx = particle.x - next.x;
        const dy = particle.y - next.y;
        if (dx * dx + dy * dy < LINK_DISTANCE_SQ) {
          ctx.globalAlpha = 0.1 * visibleAlpha;
          ctx.strokeStyle = particle.glowColor;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(next.x, next.y);
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    if (state === "forming" && rawProgress >= 1) {
      updateState("formed");
    }

    if (state === "degrading" && degradationProgress >= 1) {
      ctx.clearRect(0, 0, width, height);
      updateState("profile");
      stopLoop();
      return;
    }

    scheduleFrame(state === "formed" ? IDLE_FRAME_MS : 0);
  }

  function startAntibody() {
    if (state !== "profile") return;
    updateState("forming");
    buildParticles();
    startedAt = performance.now();
    lastFrameAt = 0;
    scheduleFrame();
  }

  function degradeAntibody() {
    if (state !== "formed" && state !== "forming") return;
    for (let i = 0; i < particles.length; i += 1) {
      const target = offscreenPoint();
      particles[i].outX = target.x;
      particles[i].outY = target.y;
    }
    degradedAt = performance.now();
    updateState("degrading");
    stopLoop();
    scheduleFrame();
  }

  function setPointer(event) {
    const rect = canvas.getBoundingClientRect();
    pointer = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    if (state === "formed") {
      stopLoop();
      scheduleFrame();
    }
  }

  trigger.addEventListener("click", startAntibody);
  degradeButton.addEventListener("click", degradeAntibody);
  widget.addEventListener("pointermove", setPointer, { passive: true });
  widget.addEventListener("pointerleave", () => {
    pointer = null;
  });
  window.addEventListener("resize", () => {
    if (state === "profile") return;
    buildParticles();
    startedAt = performance.now() - (state === "formed" ? FORMATION_MS : 0);
    lastFrameAt = 0;
    stopLoop();
    scheduleFrame();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopLoop();
      return;
    }
    scheduleFrame();
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      isInView = entries[0].isIntersecting;
      if (isInView) {
        scheduleFrame();
      } else {
        stopLoop();
      }
    }, { threshold: 0.08 });
    observer.observe(widget);
  }

  resizeCanvas();
  updateState("profile");
})();
