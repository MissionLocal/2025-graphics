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

  // ===== Discrete bins (step expression) =====
  const HEIGHT_BREAKS = [40, 50, 65, 85, 105, 120, 130, 140, 160, 180, 240, 250, 300, 350, 450, 490, 500, 650];
  const HEIGHT_COLORS = [
    "#9DF4D9","#00C6C4","#00C6C4","#00C6C4",
    "#007DBC","#007DBC","#007DBC","#007DBC",
    "#005A8C","#005A8C","#005A8C",
    "#000F19","#000F19","#000F19","#000F19","#000F19","#000F19","#000F19"
  ];
  const BASE_BELOW_FIRST = "#EFFFFA"; // < 40

  function makeHeightColorExprStep() {
    const v = ["to-number", ["get", "proposed_height"]];
    const expr = ["step", v, BASE_BELOW_FIRST];
    for (let i = 0; i < HEIGHT_BREAKS.length; i++) expr.push(HEIGHT_BREAKS[i], HEIGHT_COLORS[i]);
    return expr;
  }

  // Gradient legend with only min/max labels
  function legendGradientHTML(title){
    const gradientColors = [BASE_BELOW_FIRST, ...HEIGHT_COLORS].join(',');
    const minLabel = `${HEIGHT_BREAKS[0]}`;
    const maxLabel = `${HEIGHT_BREAKS[HEIGHT_BREAKS.length - 1]}`;
    return `
      <div class="legend-title">${title}</div>
      <div class="legend-gradient"
           style="width:100%;height:10px;border-radius:6px;background:linear-gradient(90deg, ${gradientColors});box-shadow:inset 0 0 0 1px rgba(0,0,0,0.08);margin:6px 0 4px;">
      </div>
      <div class="legend-ends" style="display:flex;justify-content:space-between;">
        <span>${minLabel}</span><span>${maxLabel}</span>
      </div>`;
  }

  function layerPaint() {
    return {
      "fill-color": [
        "case",
        ["!", ["to-boolean", ["get", "proposed_height"]]], "#CECECE",
        makeHeightColorExprStep()
      ],
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

  // Legend (gradient + min/max only)
  if (legendEl) {
    legendEl.style.display = 'inline-block';
    legendEl.innerHTML = legendGradientHTML('Proposed height (ft)');
  }

  // Map
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mlnow/cm2tndow500co01pw3fho5d21',
    center: [-122.4411568, 37.7564758],
    zoom: 12.14
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
      paint: { 'line-color':'#ffffff', 'line-width': 0.4 }
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
