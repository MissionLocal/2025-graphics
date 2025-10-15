// map.js — Proposed heights using Mapbox vector tileset
// Discrete bins on the map; gradient legend with min/max; DROPDOWN filter.
document.addEventListener('DOMContentLoaded', async () => {
  const pymChild = new pym.Child();

  // PUBLIC token (pk.*) locked to your domains
  mapboxgl.accessToken = "pk.eyJ1IjoibWxub3ciLCJhIjoiY21ncjMxM2QwMnhjajJvb3ZobnllcDdmOSJ9.dskkEmEIuRIhKPkTh5o_Iw";

  // Tileset + source-layer
  const TILESET_URL  = "mapbox://mlnow.cmqyrusg";
  const SOURCE_LAYER = "gdf_supe_with_categories";

  // DOM refs
  const infoBox  = document.getElementById('info-box');
  const legendEl = document.getElementById('legend');
  const selectEl = document.getElementById('layerSelect'); // dropdown
  if (infoBox) infoBox.style.display = 'none';

// 1) Breaks: add 70 (and keep 75 & 80)
// Bins: 41–49, 50–64, 65–69, 70–74, 75–79, 80–84, 85–104, …
const HEIGHT_BREAKS = [
  40, 50, 65, 70, 75, 80, 85, 105, 120, 130, 140, 160, 180, 240, 250, 300, 350, 450, 490, 500, 650
];

// 2) Colors: one per bin (length must match HEIGHT_BREAKS length)
const HEIGHT_COLORS = [
  "#9DF4D9", // 41–49
  "#66D9CF", // 50–64
  "#3CCDC9", // 65–69
  "#22BFC3", // 70–74   ← new distinct shade
  "#12ADBA", // 75–79
  "#008FA4", // 80–84   ← distinct from 70s
  "#007DBC", // 85–104
  "#006FB0", // 105–119
  "#0062A1", // 120–129
  "#005892", // 130–139
  "#004F84", // 140–159
  "#004676", // 160–179
  "#003C66", // 180–239
  "#003459", // 240–249
  "#002C4D", // 250–299
  "#00233F", // 300–349
  "#001C31", // 350–449
  "#001724", // 450–489
  "#001319", // 490–499
  "#000F19", // 500–649
  "#000C13"  // 650+
];

// 3) Step expression: insert 70 (plus 75 & 80) with matching color indices
function makeHeightColorExprStep() {
  const v = ["to-number", ["coalesce", ["get", "proposed_height"], 0]];
  return [
    "case",
    ["==", v, 40], EXACT_FORTY_COLOR,  // 40 ft → grey
    ["step", v,
      BASE_BELOW_FIRST, // < 40 (and missing)
      40, HEIGHT_COLORS[0],  // 41–49
      50, HEIGHT_COLORS[1],  // 50–64
      65, HEIGHT_COLORS[2],  // 65–69
      70, HEIGHT_COLORS[3],  // 70–74
      75, HEIGHT_COLORS[4],  // 75–79
      80, HEIGHT_COLORS[5],  // 80–84
      85, HEIGHT_COLORS[6],  // 85–104
      105, HEIGHT_COLORS[7], // 105–119
      120, HEIGHT_COLORS[8], // 120–129
      130, HEIGHT_COLORS[9], // 130–139
      140, HEIGHT_COLORS[10],// 140–159
      160, HEIGHT_COLORS[11],// 160–179
      180, HEIGHT_COLORS[12],// 180–239
      240, HEIGHT_COLORS[13],// 240–249
      250, HEIGHT_COLORS[14],// 250–299
      300, HEIGHT_COLORS[15],// 300–349
      350, HEIGHT_COLORS[16],// 350–449
      450, HEIGHT_COLORS[17],// 450–489
      490, HEIGHT_COLORS[18],// 490–499
      500, HEIGHT_COLORS[19],// 500–649
      650, HEIGHT_COLORS[20] // 650+
    ]
  ];
}


  const BASE_BELOW_FIRST   = "#EFFFFA"; // < 40 (and missing)
  const EXACT_FORTY_COLOR  = "#9e9e9e"; // 40 ft special case (grey)

  // Color expression:
  // - 40 exactly → grey
  // - <40 and missing → BASE_BELOW_FIRST
  // - everything else binned by step() thresholds
  function makeHeightColorExprStep() {
    const v = ["to-number", ["coalesce", ["get", "proposed_height"], 0]];
    return [
      "case",
      ["==", v, 40], EXACT_FORTY_COLOR,
      ["step", v,
        BASE_BELOW_FIRST,            // < 40 (and missing)
        40, HEIGHT_COLORS[0],
        50, HEIGHT_COLORS[1],
        65, HEIGHT_COLORS[2],
        85, HEIGHT_COLORS[3],
        105, HEIGHT_COLORS[4],
        120, HEIGHT_COLORS[5],
        130, HEIGHT_COLORS[6],
        140, HEIGHT_COLORS[7],
        160, HEIGHT_COLORS[8],
        180, HEIGHT_COLORS[9],
        240, HEIGHT_COLORS[10],
        250, HEIGHT_COLORS[11],
        300, HEIGHT_COLORS[12],
        350, HEIGHT_COLORS[13],
        450, HEIGHT_COLORS[14],
        490, HEIGHT_COLORS[15],
        500, HEIGHT_COLORS[16],
        650, HEIGHT_COLORS[17]
      ]
    ];
  }

  // Legend: gradient (<40 → max) + a single swatch for 40 ft
  function legendHTML(title){
    // Gradient starts at the first binned color (41–49),
    // since 40 ft is a special grey swatch and <40 is its own swatch.
    const gradientColors = HEIGHT_COLORS.join(',');
    const minActive = HEIGHT_BREAKS[0] + 10; // 41
    const maxLabel = `${HEIGHT_BREAKS[HEIGHT_BREAKS.length - 1]}`;
    return `
      <div class="legend-title">${title}</div>
  
      <div class="legend-keys" style="display:flex;gap:14px;flex-wrap:wrap;margin:6px 0 6px;">
        <div class="k" style="display:flex;align-items:center;gap:6px;">
          <span class="sw" style="width:12px;height:12px;border-radius:2px;background:${EXACT_FORTY_COLOR};box-shadow:inset 0 0 0 1px rgba(0,0,0,.12);"></span>
          <span>40</span>
        </div>
      </div>
  
      <div class="legend-gradient"
           style="width:100%;height:10px;border-radius:6px;background:linear-gradient(90deg, ${gradientColors});box-shadow:inset 0 0 0 1px rgba(0,0,0,0.08);margin:4px 0 4px;">
      </div>
      <div class="legend-ends" style="display:flex;justify-content:space-between;">
        <span>${minActive}</span><span>${maxLabel}</span>
      </div>`;
  }
  

  function layerPaint() {
    return {
      "fill-color": makeHeightColorExprStep(), // no separate "No data" branch
      "fill-opacity": 0.9
    };
  }

  // Info-box helpers
  function ensureInfoBoxInside() {
    const cont = document.querySelector('.map-container');
    if (!cont || !infoBox || infoBox.style.display === 'none') return;
    infoBox.style.bottom = '22px';
    requestAnimationFrame(() => {
      const c = cont.getBoundingClientRect();
      const b = infoBox.getBoundingClientRect();
      const spill = (b.bottom + 8) - c.bottom;
      if (spill > 0) infoBox.style.bottom = `${22 + spill}px`;
    });
  }
  function revealInfoBox(html) {
    infoBox.innerHTML = html;
    infoBox.style.display = 'block';
    ensureInfoBoxInside();
    requestAnimationFrame(() => pymChild.sendHeight());
  }

  // Filter helpers
  const robustClassFilter = (key) => [
    "any",
    ["==", ["get", key], true],
    ["==", ["downcase", ["coalesce", ["to-string", ["get", key]], ""]], "true"],
    ["==", ["coalesce", ["to-number", ["get", key]], 0], 1]
  ];

  // Info card
  function tplInfo(p = {}) {
    const id   = p?.RP1PRCLID ?? "—";
    const type = p?.class_desc ?? p?.RP1CLACDE ?? "—";
    const hNum = Number(p?.proposed_height);
    const hTxt = Number.isFinite(hNum) ? `${Math.round(hNum)} ft` : "N/A";
    const unitsNum = Number(p?.UNITS);
    const bits = [`Proposed height: ${hTxt}`];
    if (Number.isFinite(unitsNum) && unitsNum > 0) bits.push(`Units: ${Math.round(unitsNum)}`);
    bits.push(`Type: ${type}`);
    return `<div><strong>Parcel ${id}</strong></div><div class="info-stats">${bits.join(' • ')}</div>`;
  }

  // Legend init
  if (legendEl) {
    legendEl.style.display = 'inline-block';
    legendEl.innerHTML = legendHTML('Proposed height (ft)');
  }

  // Map
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mlnow/cm2tndow500co01pw3fho5d21',
    center: [-122.4411568, 37.765044],
    zoom: 11.85
  });
  map.on('error', e => console.error('Mapbox GL error:', e && e.error));

  map.on('load', () => {
    // Find the first symbol (label) layer in the style
    const layers = map.getStyle().layers;
    const firstSymbolId = (layers.find(l => l.type === 'symbol') || {}).id;

    // Source
    map.addSource('parcels', { type: 'vector', url: TILESET_URL });

    // Add your layers BEFORE the first label layer so labels stay on top
    map.addLayer({
      id: 'parcels-fill',
      type: 'fill',
      source: 'parcels',
      'source-layer': SOURCE_LAYER,
      paint: layerPaint()
    }, firstSymbolId);

    map.addLayer({
      id: 'outline',
      type: 'line',
      source: 'parcels',
      'source-layer': SOURCE_LAYER,
      paint: { 'line-color':'#ffffff', 'line-width': 0.2 }
    }, firstSymbolId);

    map.addLayer({
      id: 'hover',
      type: 'line',
      source: 'parcels',
      'source-layer': SOURCE_LAYER,
      paint: { 'line-color':'#ffffff', 'line-width': 2.0 },
      filter: ['==', ['get','RP1PRCLID'], '']
    }, firstSymbolId);

    map.on('mousemove','parcels-fill', e => {
      if (!e.features?.length) return;
      const pid = e.features[0].properties?.RP1PRCLID ?? '';
      map.setFilter('hover', ['==',['get','RP1PRCLID'], pid]);
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave','parcels-fill', () => {
      map.setFilter('hover', ['==',['get','RP1PRCLID'],'']);
      map.getCanvas().style.cursor = '';
    });

    map.on('click','parcels-fill', e => {
      const f = e.features?.[0];
      if (!f) return;
      revealInfoBox(tplInfo(f.properties || {}));
    });

    map.on('click', e => {
      const hits = map.queryRenderedFeatures(e.point, { layers:['parcels-fill'] });
      if (hits.length) return;
      if (infoBox) { infoBox.style.display = 'none'; infoBox.style.bottom = '22px'; }
      pymChild.sendHeight();
    });

    // Dropdown → filter
    if (selectEl) {
      const applyFilter = () => {
        const key = selectEl.value; // "all" | "RC" | "SRES" | "MRES" | "COMM"
        if (!map.getLayer('parcels-fill')) return;
        map.setFilter('parcels-fill', key === 'all' ? null : robustClassFilter(key));
      };
      selectEl.addEventListener('change', applyFilter);
      applyFilter(); // initial state
    }
  });

  window.addEventListener('resize', () => {
    map.resize();
    ensureInfoBoxInside();
    pymChild.sendHeight();
  });
});
