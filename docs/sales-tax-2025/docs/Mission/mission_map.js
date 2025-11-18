// mission-map.js — Mission sales tax choropleth from local GeoJSON
document.addEventListener("DOMContentLoaded", () => {
  // Optional Pym (safe no-op if not present)
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
    style: "mapbox://styles/mapbox/light-v11", // or your newsroom style
    center: [-122.4183, 37.7599], // Mission
    zoom: 12.5,
  });

  // ==== CONFIG ====
  const VALUE_FIELD = "amount"; // <-- change to your actual column name
  const UID_FIELD = "group_id"; // unique ID field in mission.geojson

  // breaks + colors for version index (adjust as needed)
  const BIN_BREAKS = [80, 90, 100, 110, 120]; // example: 2019=100 baseline
  const COLORS = [
    "#FFF1FA",
    "#FFD9F6",
    "#FFBFF3",
    "#FF9AEE",
    "#F67CF6",
    "#E95AD7",
  ];

  const key = (v) => (v == null ? "" : String(v).trim());
  const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const fmtNum = (v, d = 1) => (v == null ? "—" : v.toFixed(d));

  function buildLegend(el, breaks, colors, titleText) {
    if (!el) return;

    const labels = [];
    for (let i = 0; i <= breaks.length; i++) {
      if (i === 0) {
        labels.push(`≤ ${breaks[0]}`);
      } else if (i === breaks.length) {
        labels.push(`≥ ${breaks[breaks.length - 1]}`);
      } else {
        labels.push(`${breaks[i - 1]}–${breaks[i]}`);
      }
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

  function tplInfo(props = {}) {
    const id = key(props[UID_FIELD]);
    const vRaw = num(props[VALUE_FIELD]);
    const qtr = key(props.quarter);
    const amount = num(props.amount);

    return `
      <div class="info-title-row">
        <div class="event"><strong>Group ${id || "—"}</strong></div>
        <div class="when">${qtr || ""}</div>
      </div>
      <div class="info-desc">
        Version index: <strong>${fmtNum(vRaw, 1)}</strong><br/>
        Sales tax: ${amount == null ? "—" : amount.toLocaleString("en-US")}
      </div>
    `;
  }

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
    // Source: local GeoJSON with Mission polygons
    map.addSource("mission", {
      type: "geojson",
      data: "mission_trial.geojson", // make sure this file is in the same folder
    });

    const VALUE_EXPR = ["to-number", ["coalesce", ["get", VALUE_FIELD], 0]];
    const colorExpr = buildStepColor(VALUE_EXPR, BIN_BREAKS, COLORS);

    // Fill layer
    map.addLayer({
      id: "mission-fill",
      type: "fill",
      source: "mission",
      paint: {
        "fill-color": colorExpr,
        "fill-opacity": 0.88,
      },
    });

    // Outline layer
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

    // Hover outline
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

    // Hover behavior
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

    // Click → info box
    map.on("click", "mission-fill", (e) => {
      if (!e.features?.length) return;
      const props = e.features[0].properties || {};
      infoBox.innerHTML = tplInfo(props);
      showInfoBox();
    });

    // Click background → clear info
    map.on("click", (e) => {
      const hit = map.queryRenderedFeatures(e.point, {
        layers: ["mission-fill"],
      });
      if (!hit.length) {
        hideInfoBox();
        map.setFilter("mission-hover", ["==", ["get", UID_FIELD], ""]);
      }
    });

    // Legend
    buildLegend(legendEl, BIN_BREAKS, COLORS, "Sales tax version");

    // Pym sync after idle
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
