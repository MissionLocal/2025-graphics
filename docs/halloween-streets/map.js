// cases.js — Line segments via local GeoJSON; same layout/styling as your polygon map
document.addEventListener('DOMContentLoaded', () => {
  // Optional Pym
  let pymChild = null;
  try { if (window.pym) pymChild = new pym.Child(); } catch {}

  mapboxgl.accessToken = "pk.eyJ1IjoibWxub3ciLCJhIjoiY21kNmw1aTAyMDFkbTJqb3Z2dTN0YzRjMyJ9.4abRTnHdhMI-RE48dHNtYw";

  // ---- DOM
  const infoBox  = document.getElementById('info-box');
  const legendEl = document.getElementById('legend');

  // Hide legend for this lines map (keeps same DOM but no swatches)
  if (legendEl) legendEl.style.display = 'none';

  // ---- Map
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mlnow/cmhcjcs6y003s01smeip27ohd',
    center: [-122.417, 37.754],
    zoom: 11.5
  });

  // ======================= CONFIG =======================
  // Local GeoJSON path (put the file next to this JS or adjust the path)
  const GEOJSON_PATH = 'halloween_street_closures_clean.geojson';

  // Field names expected on each feature
  const CASE_FIELD  = 'case_name';
  const START_FIELD = 'start_time';
  const END_FIELD   = 'end_time';

  // Line styling
  const LINE_COLOR = '#ff964f';  // base color
  const HOVER_COLOR = '#000'; // hover color emphasis

  // ======================= Helpers =======================
  const key  = v => (v == null ? '' : String(v).trim());
  const safe = (p, k) => key(p?.[k]);
  const showInfoBox = () => {
    infoBox.style.display = 'block';
    requestAnimationFrame(() => { try { pymChild?.sendHeight(); } catch {} });
  };
  const hideInfoBox = () => {
    infoBox.style.display = 'none';
    requestAnimationFrame(() => { try { pymChild?.sendHeight(); } catch {} });
  };

  function tplInfo(p = {}) {
    const caseName = safe(p, CASE_FIELD) || 'Untitled case';
    const start    = safe(p, START_FIELD);
    const end      = safe(p, END_FIELD);

    // You can format times here if you know they’re ISO strings. For now, show raw.
    // e.g., new Date(start).toLocaleString('en-US', { dateStyle:'medium', timeStyle:'short' })
    return `
      <div class="info-title-row">
        <div class="event"><strong>${caseName}</strong></div>
      </div>
      <div class="info-desc">
        ${start ? `Start: ${start}<br/>` : ``}
        ${end   ? `End: ${end}` : ``}
      </div>
    `;
  }

  // ======================= Map layers =======================
  map.on('load', () => {
    // Local GeoJSON source; generateId for feature-state hover
    map.addSource('cases', {
      type: 'geojson',
      data: GEOJSON_PATH,
      generateId: true
    });

    // Base line layer
    map.addLayer({
      id: 'cases-line',
      type: 'line',
      source: 'cases',
      layout: {
        'line-cap': 'round',
        'line-join': 'round'
      },
      paint: {
        'line-color': LINE_COLOR,
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          8, 1.0,
          12, 2.0,
          14, 3.0
        ],
        'line-opacity': 0.9
      }
    });

    // Emphasis via feature-state on same layer: bump width/color on hover
    map.setPaintProperty('cases-line', 'line-width', [
      'interpolate', ['linear'], ['zoom'],
      8, ['case', ['boolean', ['feature-state', 'hover'], false], 2.5, 1.0],
      12, ['case', ['boolean', ['feature-state', 'hover'], false], 4.0, 2.0],
      14, ['case', ['boolean', ['feature-state', 'hover'], false], 6.0, 3.0]
    ]);
    map.setPaintProperty('cases-line', 'line-color', [
      'case', ['boolean', ['feature-state', 'hover'], false], HOVER_COLOR, LINE_COLOR
    ]);

    // Hover behavior via feature-state
    let hoveredId = null;
    map.on('mousemove', 'cases-line', (e) => {
      map.getCanvas().style.cursor = 'pointer';
      if (!e.features?.length) return;

      const f = e.features[0];
      if (hoveredId !== null) {
        try { map.setFeatureState({ source: 'cases', id: hoveredId }, { hover: false }); } catch {}
      }
      hoveredId = f.id;
      try { map.setFeatureState({ source: 'cases', id: hoveredId }, { hover: true }); } catch {}
    });

    map.on('mouseleave', 'cases-line', () => {
      map.getCanvas().style.cursor = '';
      if (hoveredId !== null) {
        try { map.setFeatureState({ source: 'cases', id: hoveredId }, { hover: false }); } catch {}
      }
      hoveredId = null;
    });

    // Click → info card
    map.on('click', 'cases-line', (e) => {
      if (!e.features?.length) return;
      const props = e.features[0].properties || {};
      infoBox.innerHTML = tplInfo(props);
      showInfoBox();
    });

    // Click background → clear info + unhover
    map.on('click', (e) => {
      const hit = map.queryRenderedFeatures(e.point, { layers: ['cases-line'] });
      if (!hit.length) {
        hideInfoBox();
        if (hoveredId !== null) {
          try { map.setFeatureState({ source: 'cases', id: hoveredId }, { hover: false }); } catch {}
          hoveredId = null;
        }
      }
    });

    // Keep labels above lines (if available in style)
    try {
      if (map.getLayer('road-label-navigation')) map.moveLayer('road-label-navigation');
      if (map.getLayer('settlement-subdivision-label')) map.moveLayer('settlement-subdivision-label');
    } catch {}

    // Pym sync after style/fonts
    Promise.all([
      new Promise(r => map.once('idle', r)),
      (document.fonts?.ready ?? Promise.resolve())
    ]).then(() => {
      requestAnimationFrame(() => { try { pymChild?.sendHeight(); } catch {} });
    });
  });

  // Resize
  window.addEventListener('resize', () => map.resize());
});
