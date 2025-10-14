// map.js — Proposed heights using Mapbox vector tileset
// Tweaked palette: much lighter at 40 ft, strong contrast at 65/85+.
document.addEventListener('DOMContentLoaded', async () => {
  const pymChild = new pym.Child();

  // IMPORTANT: use a PUBLIC token (pk.*) locked to your domains
  mapboxgl.accessToken = "pk.eyJ1IjoibWxub3ciLCJhIjoiY21ncjMxM2QwMnhjajJvb3ZobnllcDdmOSJ9.dskkEmEIuRIhKPkTh5o_Iw";

  // Tileset + source-layer (from Mapbox Studio)
  const TILESET_URL  = "mapbox://mlnow.cmqyrusg";
  const SOURCE_LAYER = "gdf_supe_with_categories";

  // If you want, keep these for reference; the color ramp below uses explicit breaks.
  const HEIGHT_MIN = 0;
  const HEIGHT_MAX = 400;

  // DOM refs
  const infoBox  = document.getElementById('info-box');
  const legendEl = document.getElementById('legend');
  const btns     = document.getElementById('layerButtons');
  if (infoBox) infoBox.style.display = 'none';

  // ===== Color breaks + colors (lighter ≤40; strong mid/highs) =====
  // Breaks you care about: 40, 65, 85, then broader bands.
  const HEIGHT_BREAKS = [40, 65, 85, 120, 200, 400];
  const HEIGHT_COLORS = [
    "#EFFFFA", // ≤ 40  (much lighter so 40ft stands out)
    "#9DF4D9", // 65
    "#00C6C4", // 85
    "#007DBC", // 120
    "#005A8C", // 200
    "#000F19"  // 400+
  ];

  // Legend (swatches reflect the bins above)
  function legendSquaresHTML(title){
    const row = `<div class="legend-row">${
      HEIGHT_COLORS.map(c => `<span class="legend-swatch" style="background:${c}"></span>`).join('')
    }</div>`;
    const labels = ["≤40", "65", "85", "120", "200", "400+"];
    return `
      <div class="legend-title">${title}</div>
      ${row}
      <div class="legend-ends">
        <span>${labels[0]} ft</span>
        <span>${labels[labels.length - 1]} ft</span>
      </div>
    `;
  }

  // Make a smooth-ish ramp emphasizing separation near 40→65→85
  function makeHeightColorExpr() {
    const v = ["to-number", ["get", "proposed_height"]];
    return [
      "interpolate", ["exponential", 1.6], v,
      HEIGHT_BREAKS[0], HEIGHT_COLORS[0],
      HEIGHT_BREAKS[1], HEIGHT_COLORS[1],
      HEIGHT_BREAKS[2], HEIGHT_COLORS[2],
      HEIGHT_BREAKS[3], HEIGHT_COLORS[3],
      HEIGHT_BREAKS[4], HEIGHT_COLORS[4],
      HEIGHT_BREAKS[5], HEIGHT_COLORS[5]
    ];
  }

  // Paint using the new color expression
  function layerPaint() {
    return {
      "fill-color": [
        "case",
        ["!", ["to-boolean", ["get", "proposed_height"]]], "#CECECE", // N/A gray
        makeHeightColorExpr()
      ],
      "fill-opacity": 0.9
    };
  }

  // Info-box spill protection
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

  // Robust class filter: true OR "true"/"True" OR 1
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

  // Legend
  if (legendEl) {
    legendEl.style.display = 'inline-block';
    legendEl.innerHTML = legendSquaresHTML('Proposed height (ft)');
  }

  // Map
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mlnow/cm2tndow500co01pw3fho5d21',
    center: [-122.4411568, 37.7564758],
    zoom: 12.14
  });
  map.addControl(new mapboxgl.NavigationControl({ showCompass:false }));
  map.on('error', e => console.error('Mapbox GL error:', e && e.error));

  map.on('load', () => {
    // Vector tiles source
    map.addSource('parcels', { type: 'vector', url: TILESET_URL });

    // Fill
    map.addLayer({
      id: 'parcels-fill',
      type: 'fill',
      source: 'parcels',
      'source-layer': SOURCE_LAYER,
      paint: layerPaint()
    });

    // Outline + hover
    map.addLayer({
      id: 'outline',
      type: 'line',
      source: 'parcels',
      'source-layer': SOURCE_LAYER,
      paint: { 'line-color':'#ffffff', 'line-width': 0.4 }
    });
    map.addLayer({
      id: 'hover',
      type: 'line',
      source: 'parcels',
      'source-layer': SOURCE_LAYER,
      paint: { 'line-color':'#ffffff', 'line-width': 2.0 },
      filter: ['==', ['get','RP1PRCLID'], '']
    });

    // Interactions
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

    // Hide card on blank click
    map.on('click', e => {
      const hits = map.queryRenderedFeatures(e.point, { layers:['parcels-fill'] });
      if (hits.length) return;
      if (infoBox) { infoBox.style.display = 'none'; infoBox.style.bottom = '22px'; }
      pymChild.sendHeight();
    });

    // Buttons → filter (unchanged)
    if (btns) {
      btns.addEventListener('click', (e) => {
        const b = e.target.closest('button.btn');
        if (!b) return;
        const key = b.dataset.layer; // "all" | "RC" | "SRES" | "MRES" | "COMM"
        [...btns.querySelectorAll('.btn')].forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        if (!map.getLayer('parcels-fill')) return;
        map.setFilter('parcels-fill', key === 'all' ? null : robustClassFilter(key));
      });
    }
  });

  // Resize + pym
  window.addEventListener('resize', () => {
    map.resize();
    ensureInfoBoxInside();
    pymChild.sendHeight();
  });
});
