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
    center: [-122.4183, 37.7625],
    zoom: 13,
  });

  const VALUE_FIELD = "pct_change";
  const UID_FIELD = "area";

  const PALETTES = {
    amber_indigo: ["#FF6B35", "#F7B801", "#FAF9F6", "#6A4C93", "#3D2C52"],
    magenta_lime: ["#D81159", "#FF6B9D", "#FFFEF2", "#8AC926", "#52A614"],
    gold_white_teal: ["#f9a825", "#fdd835", "#fffef7", "#4db6ac", "#00695c"],
    purple_lavender_green: [
      "#6a1b9a",
      "#ab47bc",
      "#f8f5fa",
      "#9ccc65",
      "#558b2f",
    ],
    burnt_orange_linen_pine: [
      "#e85d04",
      "#ffba08",
      "#faf9f0",
      "#7caa8e",
      "#2d5f4a",
    ],
    coral_purple: ["#FF6B35", "#FFA94D", "#FAF9F6", "#7E57C2", "#4527A0"],
    crimson_emerald: ["#D32F2F", "#FF6659", "#FAFAFA", "#43A047", "#2E7D32"],
  };

  let currentRange = 40;
  let currentPalette = PALETTES.magenta_lime;

  function computeSymmetricRange(features) {
    const vals = (features || [])
      .map((f) => Number(f.properties?.pct_change))
      .filter((v) => !isNaN(v))
      .sort((a, b) => a - b);

    if (!vals.length) return 40;

    const q = (p) => {
      const i = (vals.length - 1) * p;
      const lo = Math.floor(i),
        hi = Math.ceil(i);
      if (lo === hi) return vals[lo];
      const t = i - lo;
      return vals[lo] * (1 - t) + vals[hi] * t;
    };

    const q05 = q(0.05);
    const q95 = q(0.95);

    const maxAbs = Math.max(Math.abs(q05), Math.abs(q95));
    const raw = Math.ceil(maxAbs / 20) * 20;

    return Math.min(raw, 200);
  }

  function buildColorStops(colors, range) {
    const r = range || 40;
    return [
      -r,
      colors[0],
      -r / 2,
      colors[1],
      0,
      colors[2],
      r / 2,
      colors[3],
      r,
      colors[4],
    ];
  }

  function updateLegendGradient(colors) {
    const bar = document.querySelector("#legend .legend-bar");
    if (!bar) return;
    bar.style.background = `linear-gradient(to right, ${colors.join(",")})`;
  }

  function updateLegendLabelsSym(range) {
    const labels = document.querySelectorAll(".legend-labels span");
    if (labels.length < 3) return;
    labels[0].textContent = `≤ -${range}%`;
    labels[1].textContent = "0%";
    labels[2].textContent = `≥ +${range}%`;
  }

  function hexToRgba(hex, alpha) {
    const h = hex.replace("#", "");
    if (h.length !== 6) return `rgba(0,0,0,${alpha})`;
    const r = parseInt(h.slice(0, 2), 16),
      g = parseInt(h.slice(2, 4), 16),
      b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function interpolateColor(color1, color2, factor) {
    const c1 = color1.replace("#", "");
    const c2 = color2.replace("#", "");

    const r1 = parseInt(c1.slice(0, 2), 16);
    const g1 = parseInt(c1.slice(2, 4), 16);
    const b1 = parseInt(c1.slice(4, 6), 16);

    const r2 = parseInt(c2.slice(0, 2), 16);
    const g2 = parseInt(c2.slice(2, 4), 16);
    const b2 = parseInt(c2.slice(4, 6), 16);

    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);

    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  function getColorForValue(v, range, colors) {
    if (v == null || isNaN(v)) return null;
    const r = range;
    const [c0, c1, c2, c3, c4] = colors;

    if (v <= -r) return c0;
    if (v >= r) return c4;

    if (v < -r / 2) {
      const factor = (v - -r) / (-r / 2 - -r);
      return interpolateColor(c0, c1, factor);
    } else if (v < 0) {
      const factor = (v - -r / 2) / (0 - -r / 2);
      return interpolateColor(c1, c2, factor);
    } else if (v < r / 2) {
      const factor = (v - 0) / (r / 2 - 0);
      return interpolateColor(c2, c3, factor);
    } else {
      const factor = (v - r / 2) / (r - r / 2);
      return interpolateColor(c3, c4, factor);
    }
  }

  function getTextColorForBackground(hexColor) {
    if (!hexColor || hexColor === "#ccc") return "#000";

    const h = hexColor.replace("#", "");
    if (h.length !== 6) return "#000";

    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? "#000" : "#fff";
  }

  const fmtMoney = (v) => {
    if (v == null || isNaN(v)) return "—";
    const n = Number(v);
    if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return "$" + (n / 1_000).toFixed(0) + "K";
    return "$" + n.toLocaleString("en-US");
  };

  const fmtPct = (v) =>
    v == null || isNaN(v) ? "—" : (v > 0 ? "+" : "") + v.toFixed(1) + "%";

  function tplInfo(props = {}) {
    const pct = Number(props.pct_change);
    const v2025 = props["2025Q2"];

    const col = getColorForValue(pct, currentRange, currentPalette);
    const chipBg = col || "#ccc";
    const chipBorder = col || "#999";
    const textColor = getTextColorForBackground(chipBg);

    return `
      <div class="info-desc">
        <div>
          Percent change in sales tax revenue:
          <span style="
            background:${chipBg};
            color:${textColor};
            padding:2px 6px;
            border-radius:3px;
            margin-left:2px;
            font-weight:600;
            white-space:nowrap;
            border:1px solid ${chipBorder};
          ">${fmtPct(pct)}</span>
        </div>
        <div>Sales tax revenue in 2025 Q2: <strong>${fmtMoney(
          v2025
        )}</strong></div>
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
    fetch("mission_corridor_rectangles.geojson")
      .then((r) => r.json())
      .then((data) => {
        map.addSource("mission", { type: "geojson", data });

        const features = data.features || [];
        currentRange = computeSymmetricRange(features);

        const paletteSelect = document.getElementById("palette-toggle");
        const initialName =
          (paletteSelect && paletteSelect.value) || "magenta_lime";
        currentPalette = PALETTES[initialName];

        const stops = buildColorStops(currentPalette, currentRange);
        const expr = [
          "interpolate",
          ["linear"],
          ["to-number", ["get", VALUE_FIELD]],
          ...stops,
        ];

        const labelLayer = map
          .getStyle()
          .layers.find((l) => l.type === "symbol");

        const fillLayer = {
          id: "mission-fill",
          type: "fill",
          source: "mission",
          paint: { "fill-color": expr, "fill-opacity": 0.85 },
        };

        if (labelLayer) {
          map.addLayer(fillLayer, labelLayer.id);
        } else {
          map.addLayer(fillLayer);
        }

        map.addLayer({
          id: "mission-outline",
          type: "line",
          source: "mission",
          paint: {
            "line-color": "#fff",
            "line-width": [
              "interpolate",
              ["linear"],
              ["zoom"],
              11,
              0.3,
              14,
              1.2,
            ],
            "line-opacity": 0.8,
          },
        });

        map.addLayer({
          id: "mission-selected",
          type: "line",
          source: "mission",
          filter: ["==", ["get", UID_FIELD], ""],
          paint: {
            "line-color": "#000",
            "line-width": ["interpolate", ["linear"], ["zoom"], 11, 2, 14, 3],
            "line-opacity": 0.9,
          },
        });

        map.addLayer({
          id: "mission-hover",
          type: "line",
          source: "mission",
          filter: ["==", ["get", UID_FIELD], ""],
          paint: {
            "line-color": "#000",
            "line-width": [
              "interpolate",
              ["linear"],
              ["zoom"],
              11,
              0.8,
              14,
              1.5,
            ],
            "line-opacity": 0.6,
          },
        });

        updateLegendGradient(currentPalette);
        updateLegendLabelsSym(currentRange);

        if (paletteSelect) {
          paletteSelect.addEventListener("change", (e) => {
            const name = e.target.value;
            currentPalette = PALETTES[name];

            const newStops = buildColorStops(currentPalette, currentRange);
            const newExpr = [
              "interpolate",
              ["linear"],
              ["to-number", ["get", VALUE_FIELD]],
              ...newStops,
            ];

            map.setPaintProperty("mission-fill", "fill-color", newExpr);
            updateLegendGradient(currentPalette);
          });
        }

        map.on("mousemove", "mission-fill", (e) => {
          if (!e.features?.length) return;
          const uid = e.features[0].properties?.[UID_FIELD] ?? "";
          map.setFilter("mission-hover", ["==", ["get", UID_FIELD], uid]);
          map.getCanvas().style.cursor = "pointer";
        });

        map.on("mouseleave", "mission-fill", () => {
          map.setFilter("mission-hover", ["==", ["get", UID_FIELD], ""]);
          map.getCanvas().style.cursor = "";
        });

        map.on("click", "mission-fill", (e) => {
          if (!e.features?.length) return;
          const f = e.features[0];
          const uid = f.properties?.[UID_FIELD] ?? "";

          map.setFilter("mission-selected", ["==", ["get", UID_FIELD], uid]);
          infoBox.innerHTML = tplInfo(f.properties);
          showInfoBox();
        });

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
      });
  });

  window.addEventListener("resize", () => map.resize());
});
