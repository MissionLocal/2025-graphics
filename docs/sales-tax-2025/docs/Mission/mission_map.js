// mission-map.js — Mission sales tax choropleth from local GeoJSON
document.addEventListener("DOMContentLoaded", () => {
  let pymChild = null;
  try {
    if (window.pym) pymChild = new window.pym.Child();
  } catch {}

  mapboxgl.accessToken =
    "pk.eyJ1IjoibWxub3ciLCJhIjoiY21ncjMxM2QwMnhjajJvb3ZobnllcDdmOSJ9.dskkEmEIuRIhKPkTh5o_Iw";

  const infoBox = document.getElementById("info-box");
  const legendEl = document.getElementById("legend");
  if (legendEl) legendEl.style.display = "block";

  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/light-v11",
    center: [-122.4183, 37.7599],
    zoom: 12.5,
  });

  // === CONFIG ===
  const VALUE_FIELD = "pct_change";
  const UID_FIELD = "group_id";

  const BIN_BREAKS = [-40, -20, 0, 20, 40];

  const COLORS = ["#FF6B35", "#F7B801", "#FAF9F6", "#6A4C93", "#3D2C52"];

  const key = (v) => (v == null ? "" : String(v).trim());
  const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  // formatter like "$666K", "$2.7M", "$84,000"
  const fmtMoney = (v) => {
    if (v == null || isNaN(v)) return "—";
    if (v >= 1_000_000) return "$" + (v / 1_000_000).toFixed(1) + "M";
    if (v >= 1_000) return "$" + (v / 1_000).toFixed(0) + "K";
    return "$" + v.toLocaleString("en-US");
  };

  const fmtPct = (v) => (v == null ? "—" : v.toFixed(1) + "%");

  function buildLegend(el, breaks, colors, titleText) {
    if (!el) return;

    const labels = [];
    for (let i = 0; i <= breaks.length; i++) {
      if (i === 0) labels.push(`≤ ${breaks[0]}%`);
      else if (i === breaks.length)
        labels.push(`≥ ${breaks[breaks.length - 1]}%`);
      else labels.push(`${breaks[i - 1]}–${breaks[i]}%`);
    }

    el.innerHTML = `
      ${titleText ? `<div class="title">${titleText}</div>` : ``}
      ${colors
        .map(
          (c, i) => `
        <div class="row">
          <span class="swatch" style="background:${c}"></span>
          <span>${labels[i]}</span>
        </div>
      `
        )
        .join("")}
    `;
  }

  function buildStepColor(valueExpr, breaks, colors) {
    const step = ["step", valueExpr, colors[0]];
    for (let i = 0; i < breaks.length; i++) {
      step.push(breaks[i], colors[i + 1]);
    }
    return step;
  }

  // === UPDATED TOOLTIP (this is the part you asked to enhance) ===
  function tplInfo(props = {}) {
    const pct = num(props.pct_change);
    const v2019 = num(props["2019Q2"]);
    const v2025 = num(props["2025Q2"]);
    const vAdj = num(props["2025Q2_adj_2019"]);

    return `
      <div class="info-title-row">
        <div class="event"><strong>Group ${props.group_id || "—"}</strong></div>
      </div>

      <div class="info-desc">

        <strong>% Change (real):</strong> ${fmtPct(pct)}<br/>

        <strong>2019 Q2:</strong> ${fmtMoney(v2019)}<br/>
        <strong>2025 Q2:</strong> ${fmtMoney(v2025)}<br/>

        <strong>2025 Q2 (→ 2019$):</strong> ${fmtMoney(vAdj)}
      </div>
    `;
  }
  // ===============================================================

  const showInfoBox = () => {
    infoBox.style.display = "block";
    try {
      pymChild && pymChild.sendHeight();
    } catch {}
  };
  const hideInfoBox = () => {
    infoBox.style.display = "none";
    try {
      pymChild && pymChild.sendHeight();
    } catch {}
  };

  map.on("load", () => {
    map.addSource("mission", {
      type: "geojson",
      data: "mission_recovery.geojson",
    });

    const VALUE_EXPR = ["to-number", ["coalesce", ["get", VALUE_FIELD], 0]];
    const colorExpr = buildStepColor(VALUE_EXPR, BIN_BREAKS, COLORS);

    map.addLayer({
      id: "mission-fill",
      type: "fill",
      source: "mission",
      paint: {
        "fill-color": colorExpr,
        "fill-opacity": 0.88,
      },
    });

    map.addLayer({
      id: "mission-outline",
      type: "line",
      source: "mission",
      paint: {
        "line-color": "#ffffff",
        "line-width": ["interpolate", ["linear"], ["zoom"], 11, 0.3, 14, 0.8],
        "line-opacity": 0.9,
      },
    });

    map.addLayer({
      id: "mission-hover",
      type: "line",
      source: "mission",
      filter: ["==", ["get", UID_FIELD], ""],
      paint: {
        "line-color": "#000000",
        "line-width": ["interpolate", ["linear"], ["zoom"], 11, 1.0, 14, 2.0],
        "line-opacity": 0.9,
      },
    });

    map.on("mousemove", "mission-fill", (e) => {
      if (!e.features?.length) return;
      const f = e.features[0];
      const uid = f.properties?.[UID_FIELD] ?? "";
      map.setFilter("mission-hover", ["==", ["get", UID_FIELD], uid]);
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "mission-fill", () => {
      map.setFilter("mission-hover", ["==", ["get", UID_FIELD], ""]);
      map.getCanvas().style.cursor = "";
    });

    map.on("click", "mission-fill", (e) => {
      if (!e.features?.length) return;
      const props = e.features[0].properties || {};
      infoBox.innerHTML = tplInfo(props);
      showInfoBox();
    });

    map.on("click", (e) => {
      const hit = map.queryRenderedFeatures(e.point, {
        layers: ["mission-fill"],
      });
      if (!hit.length) {
        hideInfoBox();
        map.setFilter("mission-hover", ["==", ["get", UID_FIELD], ""]);
      }
    });

    buildLegend(legendEl, BIN_BREAKS, COLORS, "% change (real dollars)");

    Promise.all([
      new Promise((r) => map.once("idle", r)),
      document.fonts?.ready ?? Promise.resolve(),
    ]).then(() => {
      try {
        pymChild && pymChild.sendHeight();
      } catch {}
    });
  });

  window.addEventListener("resize", () => map.resize());
});
