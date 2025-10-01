// map.js — multiline segments colored by "staffing" + TITLE
document.addEventListener('DOMContentLoaded', async () => {
    const pymChild = new pym.Child();
    mapboxgl.accessToken = "pk.eyJ1IjoibWxub3ciLCJhIjoiY21mZDE2anltMDRkbDJtcHM1Y2M0eTFjNCJ9.nmMGLA-zX7BqznSJ2po65g";
  
    // --- Title text (edit me) ---
    const MAP_TITLE = 'San Francisco foot patrol beats';
  
    // DOM
    const infoBox  = document.getElementById('info-box');
    const legendEl = document.getElementById('legend');
    const mapEl    = document.getElementById('map');
  
    // Hide info box on load ✅
    if (infoBox) infoBox.style.display = 'none';
  
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mlnow/cm2tndow500co01pw3fho5d21',
      center: [-122.4267806, 37.7685798],
      zoom: 11
    });
  
    // ---- Helpers --------------------------------------------------------------
    const key = v => (v == null ? '' : String(v).trim());
    const coalesce = (...vals) => {
      for (const v of vals) {
        if (v !== undefined && v !== null && `${v}`.trim() !== '') return v;
      }
      return '';
    };
  
    function tplInfo(p = {}) {
      const name     = key(coalesce(p.name));
      const station  = key(coalesce(p.station));
      const division = key(coalesce(p.division));
      const staffing = key(coalesce(p.staffing));
  
      return `
        <div><strong>${name || 'Unnamed segment'}</strong></div>
        <div class="info-stats">
          ${station ? `${station}` : ''}${station && division ? ' • ' : ''}${division ? `${division}` : ''}
        </div>
        <div class="info-stats">Staffing: ${staffing || 'N/A'}</div>
      `;
    }
  
    // Make a composite filter key we can use for hover/click selection
    const featureKeyExpr = (name, station) => ['all',
      ['==', ['get', 'name'], name],
      ['==', ['get', 'station'], station]
    ];
  
    // ---- Load data ------------------------------------------------------------
    const dataUrl = 'final_map.geojson';
    const gj = await fetch(dataUrl).then(r => r.json());
  
    // ---- Styling: staffing → color -------------------------------------------
    const COLOR_FILLED = '#66c2a5';  // teal
    const COLOR_UNFIL  = '#fc8d62';  // orange
    const COLOR_NA     = '#BDBDBD';  // neutral
  
    const staffingColor = [
      'match', ['get', 'staffing'],
      'Filled with On-Duty',   COLOR_FILLED,
      'Filled with Overtime',  COLOR_FILLED,
      'Not Filled',            COLOR_UNFIL,
      COLOR_NA // fallback
    ];
  
    // Base line widths and hover emphasis
    const baseLineWidth  = 2;
    const hoverLineWidth = 2.5;
  
    map.on('load', () => {
      // --- Inject a title pill (no HTML change needed) ---
      const host = (legendEl && legendEl.parentElement) || mapEl.parentElement;
      let titleEl = host.querySelector('.map-title');
      if (!titleEl) {
        titleEl = document.createElement('div');
        titleEl.className = 'map-title';
        titleEl.textContent = MAP_TITLE;
        host.appendChild(titleEl);
      } else {
        titleEl.textContent = MAP_TITLE;
      }
      // Nudge legend down so it sits under the title
      if (legendEl) {
        legendEl.style.top = '56px';
        legendEl.style.left = '14px';
      }
  
      // Source
      map.addSource('segments', { type: 'geojson', data: gj });
  
      // Base segments layer
      map.addLayer({
        id: 'segments-line',
        type: 'line',
        source: 'segments',
        paint: {
          'line-color': staffingColor,
          'line-width': baseLineWidth,
          'line-opacity': 1
        },
        layout: { 'line-cap': 'round', 'line-join': 'round' }
      });
  
      // Thin white casing to pop against basemap
      map.addLayer({
        id: 'segments-casing',
        type: 'line',
        source: 'segments',
        paint: {
          'line-color': '#FFFFFF',
          'line-width': ['+', baseLineWidth, 1.5],
          'line-opacity': 0.25
        },
        layout: { 'line-cap': 'round', 'line-join': 'round' }
      });
  
      // Hover highlight (white)
      map.addLayer({
        id: 'segments-hover',
        type: 'line',
        source: 'segments',
        paint: { 'line-color': '#FFFFFF', 'line-width': hoverLineWidth, 'line-opacity': 0.7 },
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        filter: ['==', ['get', 'name'], '__none__']
      });
  
      // Hover color overlay (thicker)
      map.addLayer({
        id: 'segments-hover-color',
        type: 'line',
        source: 'segments',
        paint: { 'line-color': staffingColor, 'line-width': ['+', hoverLineWidth, 1], 'line-opacity': 1.0 },
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        filter: ['==', ['get', 'name'], '__none__']
      });
  
      // ---- Interactions ------------------------------------------------------
      map.on('mousemove', 'segments-line', e => {
        if (!e.features?.length) return;
        const f = e.features[0];
        const name = f.properties?.name ?? '';
        const station = f.properties?.station ?? '';
        const filter = featureKeyExpr(name, station);
  
        map.setFilter('segments-hover', filter);
        map.setFilter('segments-hover-color', filter);
        map.getCanvas().style.cursor = 'pointer';
      });
  
      map.on('mouseleave', 'segments-line', () => {
        map.setFilter('segments-hover', ['==', ['get', 'name'], '__none__']);
        map.setFilter('segments-hover-color', ['==', ['get', 'name'], '__none__']);
        map.getCanvas().style.cursor = '';
      });
  
      // Click → show info card
      map.on('click', 'segments-line', e => {
        if (!e.features?.length) return;
        const f = e.features[0];
        const props = f.properties || {};
  
        infoBox.style.display = 'block';
        infoBox.innerHTML = tplInfo(props);
  
        const name = props.name ?? '';
        const station = props.station ?? '';
        const filter = featureKeyExpr(name, station);
        map.setFilter('segments-hover', filter);
        map.setFilter('segments-hover-color', filter);
  
        pymChild.sendHeight();
      });
  
      // Click anywhere else → hide card + clear highlight
      map.on('click', e => {
        const feats = map.queryRenderedFeatures(e.point, { layers: ['segments-line'] });
        if (feats.length) return;
        infoBox.style.display = 'none';
        map.setFilter('segments-hover', ['==', ['get', 'name'], '__none__']);
        map.setFilter('segments-hover-color', ['==', ['get', 'name'], '__none__']);
        pymChild.sendHeight();
      });
  
      // ---- Legend ------------------------------------------------------------
      const legendHTML = `
        <div class="legend-title">Staffing</div>
        <div class="legend-list">
          <div class="legend-item"><span class="legend-line" style="background:${COLOR_FILLED}"></span><span>Filled</span></div>
          <div class="legend-item"><span class="legend-line" style="background:${COLOR_UNFIL}"></span><span>Not Filled</span></div>
          <div class="legend-item"><span class="legend-line" style="background:${COLOR_NA}"></span><span>Other</span></div>
        </div>
      `;
      if (legendEl) legendEl.innerHTML = legendHTML;
  
      try {
        if (map.getLayer('road-label-navigation')) map.moveLayer('road-label-navigation');
        if (map.getLayer('settlement-subdivision-label')) map.moveLayer('settlement-subdivision-label');
      } catch {}
  
      pymChild.sendHeight();
    });
  
    // Keep responsive + update embed height
    window.addEventListener('resize', () => {
      map.resize();
      pymChild.sendHeight();
    });
  });
  