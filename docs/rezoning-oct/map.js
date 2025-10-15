// map.js — Proposed heights using Mapbox vector tileset
// Discrete bins on the map; gradient legend (starts at 41); DROPDOWN filter.
document.addEventListener('DOMContentLoaded', async () => {
  const pymChild = new pym.Child();

  // PUBLIC token (pk.*) locked to your domains
  mapboxgl.accessToken = "pk.eyJ1IjoibWxub3ciLCJhIjoiY21ncjMxM2QwMnhjajJvb3ZobnllcDdmOSJ9.dskkEmEIuRIhKPkTh5o_Iw";

  // Tileset + source-layer
  const TILESET_URL  = "mapbox://mlnow.9lq77t5d";
  const SOURCE_LAYER = "gdf_supe_with_categories";

  // DOM refs
  const infoBox  = document.getElementById('info-box');
  const legendEl = document.getElementById('legend');
  const selectEl = document.getElementById('layerSelect'); // dropdown
  if (infoBox) infoBox.style.display = 'none';

  // ===== Breaks & Colors =====
  const HEIGHT_BREAKS = [
    40, 50, 65, 70, 75, 80, 85, 105, 120, 130, 140, 160, 180, 240, 250, 300, 350, 450, 490, 500, 650
  ];
  const HEIGHT_COLORS = [
    "#9DF4D9", "#66D9CF", "#3CCDC9", "#22BFC3", "#12ADBA",
    "#008FA4", "#007DBC", "#006FB0", "#0062A1", "#005892",
    "#004F84", "#004676", "#003C66", "#003459", "#002C4D",
    "#00233F", "#001C31", "#001724", "#001319", "#000F19", "#000C13"
  ];
  const BASE_BELOW_FIRST  = "#EFFFFA"; // numeric but < 40
  const EXACT_FORTY_COLOR = "#9e9e9e"; // exactly 40
  const MISSING_COLOR     = "#E6E6E6"; // non-numeric / NaN / empty / missing

  // Color expression:
  // - invalid/missing (NaN or null) -> MISSING_COLOR
  // - exactly 40 -> EXACT_FORTY_COLOR
  // - < 40 -> BASE_BELOW_FIRST
  // - else -> step() bins
  function makeHeightColorExprStep() {
    const raw = ["get", "proposed_height"];
    const v   = ["to-number", raw]; // yields NaN for non-numeric strings like "NaN", "140/450", "", etc.

    return [
      "case",
      // v != v is only true for NaN; also treat null/missing as invalid
      ["any",
        ["==", raw, null],
        ["!=", v, v]
      ], MISSING_COLOR,

      ["==", v, 40], EXACT_FORTY_COLOR,
      ["<",  v, 40], BASE_BELOW_FIRST,

      ["step", v,
        BASE_BELOW_FIRST,
        40, HEIGHT_COLORS[0],
        50, HEIGHT_COLORS[1],
        65, HEIGHT_COLORS[2],
        70, HEIGHT_COLORS[3],
        75, HEIGHT_COLORS[4],
        80, HEIGHT_COLORS[5],
        85, HEIGHT_COLORS[6],
        105, HEIGHT_COLORS[7],
        120, HEIGHT_COLORS[8],
        130, HEIGHT_COLORS[9],
        140, HEIGHT_COLORS[10],
        160, HEIGHT_COLORS[11],
        180, HEIGHT_COLORS[12],
        240, HEIGHT_COLORS[13],
        250, HEIGHT_COLORS[14],
        300, HEIGHT_COLORS[15],
        350, HEIGHT_COLORS[16],
        450, HEIGHT_COLORS[17],
        490, HEIGHT_COLORS[18],
        500, HEIGHT_COLORS[19],
        650, HEIGHT_COLORS[20]
      ]
    ];
  }

  // Legend: discrete 40 swatch + gradient (no extra “invalid” key)
  function legendHTML(title){
    const gradientColors = HEIGHT_COLORS.join(',');
    const minActive = HEIGHT_BREAKS[0] + 10; // 41
    const maxLabel  = `${HEIGHT_BREAKS[HEIGHT_BREAKS.length - 1]}`;
    return `
      <div class="legend-title">${title}</div>

      <div class="legend-keys" style="display:flex;gap:14px;flex-wrap:wrap;margin:6px 0 6px;">
        <div class="k" style="display:flex;align-items:center;gap:6px;">
          <span class="sw" style="width:12px;height:12px;border-radius:2px;background:${EXACT_FORTY_COLOR};
                 box-shadow:inset 0 0 0 1px rgba(0,0,0,.12);"></span>
          <span>40, no change</span>
        </div>
      </div>

      <div class="legend-gradient"
           style="width:100%;height:10px;border-radius:6px;background:linear-gradient(90deg, ${gradientColors});
                  box-shadow:inset 0 0 0 1px rgba(0,0,0,0.08);margin:4px 0 4px;">
      </div>
      <div class="legend-ends" style="display:flex;justify-content:space-between;">
        <span>${minActive}</span><span>${maxLabel}</span>
      </div>`;
  }

  function layerPaint() {
    return { "fill-color": makeHeightColorExprStep(), "fill-opacity": 0.9 };
  }

  // ---------- Info-box helpers ----------
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

  // ---------- Filter helpers ----------
  const robustClassFilter = (key) => [
    "any",
    ["==", ["get", key], true],
    ["==", ["downcase", ["coalesce", ["to-string", ["get", key]], ""]], "true"],
    ["==", ["coalesce", ["to-number", ["get", key]], 0], 1]
  ];

  // ---------- Info card ----------
  function num(v){
    if (v === null || v === undefined) return null;
    if (typeof v === "number") return Number.isFinite(v) ? v : null;
    if (typeof v === "string"){
      const s = v.trim();
      if (!s || /^(null|na|n\/a|none|undefined|nan)$/i.test(s)) return null;
      const m = s.match(/^[+-]?\d+(\.\d+)?/);
      return m ? Number(m[0]) : null;
    }
    return null;
  }
  function fmtFt(n){
    if (n === null) return "N/A";
    return Number.isInteger(n) ? `${n} ft` : `${n.toFixed(1)} ft`;
  }
  function fallbackChange(p){
    const proposed = num(p?.proposed_height_int ?? p?.proposed_height);
    const existing = num(p?.heightdist);
    if (proposed !== null && existing !== null) return proposed - existing;
    return null;
  }

  function tplInfo(p = {}) {
    const id   = p?.RP1PRCLID ?? "—";
    const type = p?.class_desc ?? p?.RP1CLACDE ?? "—";
  
    // Decide what to show for "Proposed height"
    const rawPH = (p?.proposed_height ?? "").toString().trim();
    const nums  = (rawPH.match(/[+-]?\d+(\.\d+)?/g) || []);
    const isNaNString = /^\s*nan\s*$/i.test(rawPH);
    const hasSeparators = /[;/]/.test(rawPH) || /\/\//.test(rawPH);
    const hasMultipleNums = nums.length > 1;
    // 👉 Treat empty/null as "multiple" too (since that's what you want to display)
    const isEmpty = rawPH.length === 0;
  
    const isMultiple = isEmpty || isNaNString || hasSeparators || hasMultipleNums;
  
    const propStr = isMultiple
      ? "multiple"
      : rawPH; // single numeric or any other single-value text like "No change"
  
    // Prefer 'change' from data; include 0 as valid; else compute from ints/strings
    let ch = num(p?.change);
    if (ch === null) ch = (function(){
      const proposed = num(p?.proposed_height_int ?? p?.proposed_height);
      const existing = num(p?.heightdist);
      return (proposed !== null && existing !== null) ? proposed - existing : null;
    })();
  
    let changeTxt = "—";
    if (ch !== null) {
      const rounded = Math.abs(ch % 1) === 0 ? Math.trunc(ch) : Math.round(ch * 10) / 10;
      const sign = ch > 0 ? "+" : ch < 0 ? "−" : "";
      changeTxt = `${sign}${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)} ft`;
    }
  
    const unitsNum = num(p?.UNITS);
  
    const header = `
      <div class="info-header">
        <strong>Parcel ${id}</strong>
        <span class="sep"> • </span>
        <span class="bldg-type">${type ?? "—"}</span>
      </div>`;
  
    const bits = [
      `Proposed height: ${propStr}`,
      `Change: ${changeTxt}`,
    ];
    if (unitsNum !== null && unitsNum > 0) bits.push(`Units: ${Math.round(unitsNum)}`);
  
    return `${header}<div class="info-stats">${bits.join(' • ')}</div>`;
  }
  
  
  
  // Init legend
  if (legendEl) {
    legendEl.style.display = 'inline-block';
    legendEl.innerHTML = legendHTML('Proposed height (ft)');
  }

  // ---------- Map ----------
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mlnow/cm2tndow500co01pw3fho5d21',
    center: [-122.4411568, 37.765044],
    zoom: 11.85
  });
  map.on('error', e => console.error('Mapbox GL error:', e && e.error));

  map.on('load', () => {
    const layers = map.getStyle().layers;
    const firstSymbolId = (layers.find(l => l.type === 'symbol') || {}).id;

    map.addSource('parcels', { type: 'vector', url: TILESET_URL });

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

    if (selectEl) {
      const applyFilter = () => {
        const key = selectEl.value; // "all" | "RC" | "SRES" | "MRES" | "COMM"
        if (!map.getLayer('parcels-fill')) return;
        const filt = (key === 'all') ? null : robustClassFilter(key);
        map.setFilter('parcels-fill', filt);
        if (map.getLayer('outline')) map.setFilter('outline', filt);
      };
      selectEl.addEventListener('change', applyFilter);
      applyFilter();
    }
  });

  window.addEventListener('resize', () => {
    map.resize();
    ensureInfoBoxInside();
    pymChild.sendHeight();
  });
});
