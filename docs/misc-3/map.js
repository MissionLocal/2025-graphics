// map.js — Proposed heights w/ vector tiles, bright palette, dropdown + address search
document.addEventListener('DOMContentLoaded', async () => {
  const pymChild = new pym.Child();

  // Use a PUBLIC token (pk.*) locked to your domains in Mapbox token settings
  mapboxgl.accessToken = "pk.eyJ1IjoibWxub3ciLCJhIjoiY21ncjMxM2QwMnhjajJvb3ZobnllcDdmOSJ9.dskkEmEIuRIhKPkTh5o_Iw";

  // Tileset + source-layer
  const TILESET_URL  = "mapbox://mlnow.cmqyrusg";
  const SOURCE_LAYER = "gdf_supe_with_categories";

  // Domain for color scale
  const HEIGHT_MIN = 0;
  const HEIGHT_MAX = 400;

  // DOM refs
  const infoBox   = document.getElementById('info-box');
  const legendEl  = document.getElementById('legend');
  const selectEl  = document.getElementById('layerSelect');   // NEW: dropdown
  const searchEl  = document.getElementById('search');        // NEW: search slot
  if (infoBox) infoBox.style.display = 'none';

  // Bright palette
  const COLOR_STOPS = [
    "#9DF4D9", "#65EAD0", "#0DD6C7", "#0DC1D3",
    "#00A4BF", "#007DBC", "#005A8C", "#003F5C",
    "#00233B", "#001F2A", "#001622", "#000F19"
  ];

  // Legend
  function legendSquaresHTML(title, leftLabel, rightLabel){
    const row = `<div class="legend-row">${
      COLOR_STOPS.map(c => `<span class="legend-swatch" style="background:${c}"></span>`).join('')
    }</div>`;
    return `
      <div class="legend-title">${title}</div>
      ${row}
      <div class="legend-ends"><span>${leftLabel}</span><span>${rightLabel}</span></div>
    `;
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

  // Helpers
  function makeStops(min, max, n) {
    const s = [];
    for (let i = 0; i < n; i++) s.push(min + (i/(n-1))*(max-min));
    return s;
  }
  function makeInterpolateExpr(min, max) {
    const stops = makeStops(min, max, COLOR_STOPS.length);
    const expr = ["interpolate", ["linear"], ["to-number", ["get", "proposed_height"]]];
    for (let i = 0; i < COLOR_STOPS.length; i++) expr.push(stops[i], COLOR_STOPS[i]);
    return expr;
  }
  function layerPaint(fillColorExpr) {
    return {
      "fill-color": [
        "case",
        ["!", ["to-boolean", ["get", "proposed_height"]]], "#CECECE",
        fillColorExpr
      ],
      "fill-opacity": 0.9
    };
  }
  const robustClassFilter = (key) => [
    "any",
    ["==", ["get", key], true],
    ["==", ["downcase", ["coalesce", ["to-string", ["get", key]], ""]], "true"],
    ["==", ["coalesce", ["to-number", ["get", key]], 0], 1]
  ];
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

  // Legend now
  if (legendEl) {
    legendEl.style.display = 'inline-block';
    legendEl.innerHTML = legendSquaresHTML('Proposed height (ft)', Math.round(HEIGHT_MIN), Math.round(HEIGHT_MAX));
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

  // Add a Geocoder search bar (address search)
  // You included <div id="search"></div> in HTML; we mount the control there.
  let searchMarker = null;
  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl,
    marker: false,
    placeholder: 'Search an address…',
    countries: 'us',
    bbox: [-122.56, 37.70, -122.32, 37.84], // SF bbox
    proximity: { longitude: -122.4194, latitude: 37.7749 }
  });
  geocoder.addTo('#search');
  geocoder.on('result', (e) => {
    const [lng, lat] = e.result.center;
    if (searchMarker) searchMarker.remove();
    searchMarker = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map);
    map.flyTo({ center: [lng, lat], zoom: 15 });
  });

  map.on('load', () => {
    const colorExpr = makeInterpolateExpr(HEIGHT_MIN, HEIGHT_MAX);

    // Vector tiles
    map.addSource('parcels', { type: 'vector', url: TILESET_URL });

    // Fill
    map.addLayer({
      id: 'parcels-fill',
      type: 'fill',
      source: 'parcels',
      'source-layer': SOURCE_LAYER,
      paint: layerPaint(colorExpr)
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

    // Dropdown → filter
    if (selectEl) {
      selectEl.addEventListener('change', () => {
        const key = selectEl.value; // "all", "RC", "SRES", "MRES", "COMM"
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
