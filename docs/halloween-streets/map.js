// cases.js — Line segments via local GeoJSON; with wide hit-layer for easier mobile taps
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
    container: "map",
    style: "mapbox://styles/mlnow/cmhcjcs6y003s01smeip27ohd",
    center: [-122.433, 37.765],
    zoom: 11.5,
  });

  // ======================= CONFIG =======================
  // Local GeoJSON path (put the file next to this JS or adjust the path)
  const GEOJSON_PATH = 'street_closures.geojson';

  // Line styling
  const LINE_COLOR  = '#ff964f';  // base color
  const HOVER_COLOR = '#ffb380';  // hover color emphasis

  // Wider hit-target widths (pixels) by zoom
  const HIT_WIDTHS = [
    'interpolate', ['linear'], ['zoom'],
    8, 10,     // ~10px at z8
    12, 18,    // ~18px at z12
    14, 24     // ~24px at z14
  ];

  // Slightly thicker visual lines on phones
  const IS_MOBILE = window.matchMedia('(max-width: 640px)').matches;

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
    const event = safe(p, "cleaned_event") || "Untitled event";
    const startDate = safe(p, "start_date");
    const startTime = safe(p, "start_time");
    const endTime = safe(p, "end_time");
    const where = safe(p, "cleaned_where");

    return `
    <div class="info-title-row">
      <div class="event"><strong>🎃 ${event}</strong></div>
    </div>
    <div class="info-desc">
      ${
        startDate && startTime && endTime
          ? `<strong>🕐 When:</strong> ${startDate} from ${startTime} to ${endTime}<br/>`
          : ``
      }
      ${where ? `<strong>📍 Where:</strong> ${where}` : ``}
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

    // Base visual line layer (thin, pretty)
    map.addLayer({
      id: 'cases-line',
      type: 'line',
      source: 'cases',
      layout: {
        'line-cap': 'round',
        'line-join': 'round'
      },
      paint: {
        'line-color': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          HOVER_COLOR,
          LINE_COLOR
        ],
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          // z8
          8, [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            IS_MOBILE ? 3.0 : 2.5,     // hover
            IS_MOBILE ? 1.6 : 1.2      // base
          ],
          // z12
          12, [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            IS_MOBILE ? 5.0 : 4.0,     // hover
            IS_MOBILE ? 3.0 : 2.0      // base
          ],
          // z14
          14, [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            IS_MOBILE ? 7.0 : 6.0,     // hover
            IS_MOBILE ? 4.2 : 3.0      // base
          ]
        ],
        'line-opacity': 0.9
      }
    });

    // Wide, almost-invisible hit layer for easier taps (placed ABOVE cases-line)
    map.addLayer({
      id: 'cases-hit',
      type: 'line',
      source: 'cases',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-width': HIT_WIDTHS,
        'line-color': '#000000',
        'line-opacity': 0.001
      }
    });

    // Keep labels above lines if your basemap exposes them
    try {
      if (map.getLayer('road-label-navigation')) map.moveLayer('road-label-navigation');
      if (map.getLayer('settlement-subdivision-label')) map.moveLayer('settlement-subdivision-label');
    } catch {}

    // ======================= Interactions =======================
    let hoveredId = null;

    function setHover(id, on) {
      try { map.setFeatureState({ source: 'cases', id }, { hover: !!on }); } catch {}
    }

    // Desktop hover (mousemove)
    map.on('mousemove', 'cases-hit', (e) => {
      map.getCanvas().style.cursor = 'pointer';
      if (!e.features?.length) return;
      const f = e.features[0];
      if (hoveredId !== null && hoveredId !== f.id) setHover(hoveredId, false);
      hoveredId = f.id;
      setHover(hoveredId, true);
    });

    map.on('mouseleave', 'cases-hit', () => {
      map.getCanvas().style.cursor = '';
      if (hoveredId !== null) setHover(hoveredId, false);
      hoveredId = null;
    });

    // Touchstart: emulate hover on mobile
    map.on('touchstart', 'cases-hit', (e) => {
      if (!e.features?.length) return;
      const f = e.features[0];
      if (hoveredId !== null && hoveredId !== f.id) setHover(hoveredId, false);
      hoveredId = f.id;
      setHover(hoveredId, true);
    });

    // Click → info card (bind to hit layer)
    map.on('click', 'cases-hit', (e) => {
      if (!e.features?.length) return;
      const props = e.features[0].properties || {};
      infoBox.innerHTML = tplInfo(props);
      showInfoBox();
    });

    // Click background → clear info + unhover
    map.on('click', (e) => {
      const hit = map.queryRenderedFeatures(e.point, { layers: ['cases-hit'] });
      if (!hit.length) {
        hideInfoBox();
        if (hoveredId !== null) {
          setHover(hoveredId, false);
          hoveredId = null;
        }
      }
    });

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
