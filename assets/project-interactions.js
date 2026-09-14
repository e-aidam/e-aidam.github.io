(() => {
  const projects = [
    {
      id: "last-mile-health-ai-assistant",
      title: "Last Mile Health KPI Agent",
      domain: "Global health analytics",
      summary:
        "LangGraph multi-agent text-to-SQL system for querying global health KPI data in natural language.",
      problem:
        "Program teams needed a faster way to retrieve community health worker training and operations metrics without hand-writing Redshift SQL for each analytical question.",
      approach:
        "Built a LangGraph and LangChain workflow with schema-aware retrieval, bounded retry logic, AWS Bedrock generation, and PostgreSQL query caching.",
      stack: ["Python", "SQL", "LangGraph / LangChain", "AWS Bedrock"],
      methods: ["Text-to-SQL", "Schema retrieval", "Retry logic", "Query caching"],
      result:
        "Reduced repeated response latency from 1-2 minutes to seconds while improving reliability for KPI questions.",
      route: "/projects/last-mile-health-ai-assistant/",
      thumbnail: "/home/thumbnails/last-mile-health-ai-assistant.jpg",
      thumbnailAlt:
        "A community health worker vaccinates an infant held by their mother at a village clinic.",
      sourceLabel: "Closed Source",
    },
    {
      id: "hyperthermia-gsea",
      title: "Hyperthermia Gene Set Enrichment Analysis",
      domain: "RNA-seq bioinformatics",
      summary:
        "End-to-end RNA-seq and GSEA workflow for whole-blood samples exposed to temperature stress.",
      problem:
        "Researchers were interested in whether heat exposure therapy enriches expression of hormonal gene pathways that could help to treat depression.",
      approach:
        "Built a Bash and R pipeline with STAR, DESeq2, edgeR, and a from-scratch GSEA implementation including permutation testing, empirical p-values, and FDR correction.",
      stack: ["R", "Bioinformatics", "RNA-seq", "GSEA", "DESeq2 / edgeR", "STAR", "Bash"],
      methods: ["RNA-seq", "GSEA", "Permutation testing", "FDR correction"],
      result:
        "Validated enrichment scores against GSEA Software and identified heat shock and proteostasis pathway enrichment.",
      route: "/projects/hyperthermia-gsea/",
      thumbnail: "/home/thumbnails/hyperthermia-gsea.jpg",
      thumbnailAlt:
        "Diagram of three human body figures color-coded by skin and core temperature during heat exposure.",
      thumbnailFit: "contain",
      githubUrl: "https://github.com/e-aidam/stat114_gsea_proj",
    },
    {
      id: "blood-lactate-prediction",
      title: "Blood Lactate Estimation",
      domain: "Physiological machine learning",
      summary:
        "Ensemble and Bayesian models estimating blood lactate from wearable physiological signals.",
      problem:
        "Endurance athletes and clinicians need a less invasive way to accurately assess fatigue during exercise than taking blood lactate samples.",
      approach:
        "Compared Random Forest, Gradient Boosting, and Mixture of Experts models, then built a PyMC hierarchical model with day-varying intercepts and oxygen-saturation slopes.",
      stack: ["Python", "Pandas", "NumPy", "Machine Learning", "Scikit-Learn", "Bayesian Modeling"],
      methods: ["Random forest", "Gradient boosting", "Bayesian modeling", "Uncertainty estimation"],
      result:
        "Achieved 0.92 R2 in blood lactate prediction using ensemble machine learning models",
      route: "/projects/blood-lactate-prediction/",
      thumbnail: "/home/thumbnails/blood-lactate-prediction.jpg",
      thumbnailAlt:
        "A cyclist wearing a metabolic gas-exchange mask rides a stationary bike while a technician monitors the test.",
      githubUrl: "https://github.com/DavidStryder/CS109A---Final-Project-Blood-Lactate-Analysis",
    },
    {
      id: "sports-prediction-mispricing",
      title: "Sports Prediction Mispricing",
      domain: "Sports market machine learning",
      summary:
        "Machine learning and time-series models analyzing how NBA prediction markets respond to major in-game win-probability shocks.",
      problem:
        "NBA prediction markets can move quickly after major in-game win-probability swings, but it is unclear whether those moves systematically overreact to new information or update too slowly.",
      approach:
        "Joined Kalshi one-minute OHLCV market candles with ESPN NBA play-by-play win-probability shocks, built leakage-safe game-grouped train/test splits, and compared traditional ML baselines against LSTM and Transformer sequence models.",
      stack: ["Python", "Pandas", "NumPy", "Machine Learning", "Scikit-Learn"],
      methods: ["Sequence modeling", "Time-series classification", "Market mispricing analysis", "Cross-validation"],
      result:
        "Found that true one-minute overreactions were rare, while sequence models tracked immediate market responses substantially better than traditional ML baselines.",
      route: "/projects/sports-prediction-mispricing/",
      thumbnail: "/home/thumbnails/sports-prediction-mispricing.jpg",
      thumbnailAlt:
        "A packed NBA arena during pre-game player introductions.",
      githubUrl: "https://github.com/e-aidam/cs1090b_sports_prediction_mispricing",
    },
    {
      id: "heatmaps",
      title: "Heatmaps",
      domain: "Geospatial activity analytics",
      summary:
        "Flask and Leaflet.js web app for exploring Strava activities as interactive routes with map themes, geosearch, and activity details.",
      problem:
        "Heatmaps makes Strava activity history explorable on an interactive map instead of a static list of workouts.",
      approach:
        "Built a Flask backend with HTML, CSS, and JavaScript frontend code to render Strava activities on a Leaflet.js map, including route polylines, clickable activity details, map themes, geosearch, and athlete-location zooming.",
      stack: ["Python", "Strava API", "Flask", "Geospatial Analytics"],
      methods: ["API integration", "Geospatial analytics", "Interactive mapping", "Web app development"],
      result:
        "Developed a web interface for viewing past Strava activities with route details, activity statistics, customizable map themes, and location search.",
      route: "/projects/heatmaps/",
      thumbnail: "/home/thumbnails/heatmaps.jpg",
      thumbnailAlt:
        "Topographic map overlaid with orange GPS activity tracks and clustered photo pins.",
      githubUrl: "https://github.com/e-aidam/Heatmaps",
    },
    {
      id: "canine-snp-proj",
      title: "Canine SNP Project",
      domain: "NGS bioinformatics",
      summary:
        "Bioinformatics pipeline for identifying SNPs associated with canine degenerative myelopathy from low-coverage whole-genome sequencing data.",
      problem:
        "Researchers need to identify genetic variants associated with canine degenerative myelopathy from whole-genome sequencing data.",
      approach:
        "Built a bioinformatics pipeline to process raw canine sequencing data, align SRA reads to a reference genome, identify candidate SNPs, and map variants to genes.",
      stack: ["Bioinformatics", "Bash", "Variant Analysis"],
      methods: ["Raw read acquisition", "Reference alignment", "Variant discovery", "Gene lookup"],
      result:
        "Created a reproducible workflow for investigating disease-associated genetic variants in canine genomic data.",
      route: "/projects/canine-snp-proj/",
      thumbnail: "/home/thumbnails/canine-snp-proj.png",
      thumbnailAlt:
        "Diagram of three dog silhouettes beside DNA double helices with a single highlighted SNP base.",
      thumbnailFit: "contain",
      githubUrl: "https://github.com/e-aidam/canine-snp-proj",
    },
    {
      id: "musi-to-spotify",
      title: "Musi to Spotify",
      domain: "Playlist automation",
      summary:
        "Python playlist converter that scrapes dynamically generated Musi playlist URLs and recreates them as Spotify playlists.",
      problem:
        "Musi playlist links are not directly portable to Spotify, making it tedious to preserve a playlist across music platforms.",
      approach:
        "Built a Python workflow to extract tracks from dynamically generated Musi playlist pages and convert them into Spotify playlists.",
      stack: ["Python", "Spotify API", "Web Scraping"],
      methods: ["Dynamic content scraping", "Playlist conversion", "API workflow", "Data cleanup"],
      result:
        "Created a converter for moving playlist content from Musi iOS playlist URLs into Spotify.",
      route: "/projects/musi-to-spotify/",
      thumbnail: "/home/thumbnails/musi-to-spotify.webp",
      thumbnailAlt:
        "Two Spotify logos, one white and one black, on a bright green field.",
      githubUrl: "https://github.com/e-aidam/musi-to-spotify",
    },
  ];

  const projectMap = new Map(projects.map((project) => [project.id, project]));
  const cards = Array.from(document.querySelectorAll(".project-card[data-project-id]"));
  const cardButtons = Array.from(document.querySelectorAll(".project-card-button[data-project-id]"));
  const filterButtons = Array.from(document.querySelectorAll(".filter-row button[data-filter]"));
  const searchInput = document.querySelector("#project-search");
  const detailPanel = document.querySelector("#project-detail");
  const emptyState = document.querySelector(".empty-state");
  const resetButton = document.querySelector("[data-reset-filters]");
  const mobileQuery = window.matchMedia("(max-width: 760px)");

  if (!cards.length || !filterButtons.length || !searchInput || !detailPanel) {
    return;
  }

  let activeFilter = "All";
  let selectedProjectId = cards[0].dataset.projectId;

  const escapeHtml = (value) =>
    String(value).replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return entities[character];
    });

  const searchableText = (project) =>
    [
      project.title,
      project.domain,
      project.summary,
      project.problem,
      project.approach,
      project.result,
      ...project.stack,
      ...project.methods,
    ]
      .join(" ")
      .toLowerCase();

  const matchesFilters = (project) => {
    const normalizedQuery = searchInput.value.trim().toLowerCase();
    const matchesStack = activeFilter === "All" || project.stack.includes(activeFilter);
    const matchesQuery = searchableText(project).includes(normalizedQuery);

    return matchesStack && matchesQuery;
  };

  const renderPills = (items) =>
    items.map((item) => `<span>${escapeHtml(item)}</span>`).join("");

  const renderThumb = (project) => {
    if (!project.thumbnail) {
      return "";
    }

    const fitClass = project.thumbnailFit === "contain" ? " detail-thumb-contain" : "";

    return `<div class="detail-thumb${fitClass}"><img src="${escapeHtml(project.thumbnail)}" alt="${escapeHtml(project.thumbnailAlt || "")}" decoding="async"></div>`;
  };

  const renderDetail = (project) => {
    detailPanel.hidden = false;
    detailPanel.innerHTML = `
      ${renderThumb(project)}
      <span class="detail-domain">${escapeHtml(project.domain)}</span>
      <h3>${escapeHtml(project.title)}</h3>
      <dl>
        <div><dt>Problem</dt><dd>${escapeHtml(project.problem)}</dd></div>
        <div><dt>Approach</dt><dd>${escapeHtml(project.approach)}</dd></div>
        <div><dt>Result</dt><dd>${escapeHtml(project.result)}</dd></div>
      </dl>
      <div class="tag-group" aria-label="Project stack">${renderPills(project.stack)}</div>
      <div class="detail-actions">
        <a href="${escapeHtml(project.route)}">View project</a>
        ${project.githubUrl ? `<a href="${escapeHtml(project.githubUrl)}">GitHub</a>` : `<span>${escapeHtml(project.sourceLabel || "Closed Source")}</span>`}
      </div>
    `;
  };

  const updateSelectedCard = () => {
    cards.forEach((card) => {
      card.classList.toggle("selected", card.dataset.projectId === selectedProjectId);
    });

    cardButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.projectId === selectedProjectId));
    });
  };

  const selectProject = (projectId, shouldFocusDetail = false) => {
    const project = projectMap.get(projectId);
    if (!project) {
      return;
    }

    selectedProjectId = projectId;
    renderDetail(project);
    updateSelectedCard();

    if (shouldFocusDetail) {
      if (mobileQuery.matches) {
        detailPanel.scrollIntoView({ block: "start", behavior: "smooth" });
      }
      detailPanel.focus({ preventScroll: true });
    }
  };

  const applyFilters = () => {
    const visibleProjects = [];

    cards.forEach((card) => {
      const project = projectMap.get(card.dataset.projectId);
      const isVisible = project ? matchesFilters(project) : false;
      card.hidden = !isVisible;

      if (isVisible) {
        visibleProjects.push(project);
      }
    });

    if (emptyState) {
      emptyState.hidden = visibleProjects.length > 0;
    }

    if (!visibleProjects.length) {
      detailPanel.hidden = true;
      return;
    }

    const selectedIsVisible = visibleProjects.some((project) => project.id === selectedProjectId);
    selectProject(selectedIsVisible ? selectedProjectId : visibleProjects[0].id);
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;

      filterButtons.forEach((filterButton) => {
        const isActive = filterButton === button;
        filterButton.classList.toggle("active", isActive);
        filterButton.setAttribute("aria-pressed", String(isActive));
      });

      applyFilters();
    });
  });

  cardButtons.forEach((button) => {
    button.addEventListener("click", () => selectProject(button.dataset.projectId, true));
  });

  searchInput.addEventListener("input", applyFilters);

  resetButton?.addEventListener("click", () => {
    searchInput.value = "";
    activeFilter = "All";

    filterButtons.forEach((button) => {
      const isActive = button.dataset.filter === "All";
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    applyFilters();
    searchInput.focus();
  });

  applyFilters();
})();
