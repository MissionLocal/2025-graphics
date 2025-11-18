// mission-map.js — Mission sales tax choropleth with gradient legend
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
  const VALUE_FIELD = "pct_change"; // real $ % change
  const UID_FIELD = "area"; // use 'area' as ID for highlight

  // continuous gradient color scale with your palette
  const COLOR_STOPS = [
    -40,
    "#BC4749",
    -20,
    "#C97C5D",
    0,
    "#F5F3F0",
    20,
    "#386641",
    40,
    "#1B4332",
  ];

  const fmtMoney = (v) => {
    if (v == null || isNaN(v)) return "—";
    const n = Number(v);
    if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return "$" + (n / 1_000).toFixed(0) + "K";
    return "$" + n.toLocaleString("en-US");
  };

  const fmtPct = (v) =>
    v == null || isNaN(v) ? "—" : (v > 0 ? "+" : "") + v.toFixed(1) + "%";

  // Compact tooltip: only the two lines you requested
  function tplInfo(props = {}) {
    const pct = props.pct_change;
    const v2025 = props["2025Q2"];

    return `
      <div class="info-desc">
        <div><strong>Percent change in sales tax revenue:</strong> ${fmtPct(
          pct
        )}</div>
        <div><strong>Sales tax revenue in 2025 Q2:</strong> ${fmtMoney(
          v2025
        )}</div>
      </div>
    `;
  }

  const showInfoBox = () => {
    infoBox.style.display = "block";
    pymChild && pymChild.sendHeight();
  };

  const hideInfoBox = () => {
    infoBox.style.display = "none";
    pymChild && pymChild.sendHeight();
  };

  map.on("load", () => {
    // Load the GeoJSON (same folder)
    map.addSource("mission", {
      type: "geojson",
      data: "mission_recovery.geojson",
    });

    // continuous gradient color expression
    const colorExpr = [
      "interpolate",
      ["linear"],
      ["to-number", ["get", VALUE_FIELD]],
    ].concat(COLOR_STOPS);

    // Fill layer
    map.addLayer({
      id: "mission-fill",
      type: "fill",
      source: "mission",
      paint: {
        "fill-color": colorExpr,
        "fill-opacity": 0.85,
      },
    });

    // Base outline
    map.addLayer({
      id: "mission-outline",
      type: "line",
      source: "mission",
      paint: {
        "line-color": "#ffffff",
        "line-width": ["interpolate", ["linear"], ["zoom"], 11, 0.3, 14, 1.2],
        "line-opacity": 0.8,
      },
    });

    // Click-selected outline (thicker highlight)
    map.addLayer({
      id: "mission-selected",
      type: "line",
      source: "mission",
      filter: ["==", ["get", UID_FIELD], ""],
      paint: {
        "line-color": "#000000",
        "line-width": ["interpolate", ["linear"], ["zoom"], 11, 2.0, 14, 3.0],
        "line-opacity": 0.9,
      },
    });

    // Subtle hover outline
    map.addLayer({
      id: "mission-hover",
      type: "line",
      source: "mission",
      filter: ["==", ["get", UID_FIELD], ""],
      paint: {
        "line-color": "#000000",
        "line-width": ["interpolate", ["linear"], ["zoom"], 11, 0.8, 14, 1.5],
        "line-opacity": 0.6,
      },
    });

    // Hover behavior (light outline)
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

    // Click → show tooltip + strong highlight
    map.on("click", "mission-fill", (e) => {
      if (!e.features?.length) return;
      const f = e.features[0];
      const props = f.properties || {};
      const uid = props[UID_FIELD] ?? "";

      // highlight the clicked tract
      map.setFilter("mission-selected", ["==", ["get", UID_FIELD], uid]);

      infoBox.innerHTML = tplInfo(props);
      showInfoBox();
    });

    // Click background → clear selection + hide box
    map.on("click", (e) => {
      const hit = map.queryRenderedFeatures(e.point, {
        layers: ["mission-fill"],
      });
      if (!hit.length) {
        hideInfoBox();
        map.setFilter("mission-selected", ["==", ["get", UID_FIELD], ""]);
        map.setFilter("mission-hover", ["==", ["get", UID_FIELD], ""]);
      }
    });

    // Pym resize
    Promise.all([
      new Promise((r) => map.once("idle", r)),
      document.fonts?.ready ?? Promise.resolve(),
    ]).then(() => {
      pymChild && pymChild.sendHeight();
    });
  });

  window.addEventListener("resize", () => map.resize());
});
