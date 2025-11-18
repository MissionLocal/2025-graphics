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
  const UID_FIELD = "group_id"; // optional (may be missing)

  // continuous gradient color scale
  const COLOR_STOPS = [
    -40,
    "#FF6B35",
    -20,
    "#F7B801",
    0,
    "#FAF9F6",
    20,
    "#6A4C93",
    40,
    "#3D2C52",
  ];

  const fmtMoney = (v) => {
    if (v == null || isNaN(v)) return "—";
    if (v >= 1_000_000) return "$" + (v / 1_000_000).toFixed(1) + "M";
    if (v >= 1_000) return "$" + (v / 1_000).toFixed(0) + "K";
    return "$" + v.toLocaleString("en-US");
  };

  const fmtPct = (v) => (v == null || isNaN(v) ? "—" : v.toFixed(1) + "%");

  // Tooltip HTML
  function tplInfo(props = {}) {
    const pct = props.pct_change;
    const v2019 = props["2019Q2"];
    const v2025 = props["2025Q2"];
    const vAdj = props["CPI_adjusted_2025"];

    return `
      <div class="info-title-row">
        <div><strong>Group ${props.group_id || "—"}</strong></div>
      </div>
      <div class="info-desc">
        <strong>% Change (real):</strong> ${fmtPct(pct)}<br/>
        <strong>2019 Q2:</strong> ${fmtMoney(v2019)}<br/>
        <strong>2025 Q2:</strong> ${fmtMoney(v2025)}<br/>
        <strong>2025 Q2 (→ 2019$):</strong> ${fmtMoney(vAdj)}
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

    // Outline
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

    // Hover outline
    map.addLayer({
      id: "mission-hover",
      type: "line",
      source: "mission",
      filter: ["==", ["get", UID_FIELD], ""],
      paint: {
        "line-color": "#000",
        "line-width": ["interpolate", ["linear"], ["zoom"], 11, 1.0, 14, 2.0],
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

    // Click → tooltip box
    map.on("click", "mission-fill", (e) => {
      if (!e.features?.length) return;
      const props = e.features[0].properties;
      infoBox.innerHTML = tplInfo(props);
      showInfoBox();
    });

    // Background click hides box
    map.on("click", (e) => {
      const hit = map.queryRenderedFeatures(e.point, {
        layers: ["mission-fill"],
      });
      if (!hit.length) {
        hideInfoBox();
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
