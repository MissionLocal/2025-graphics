// map.js — segments colored by "staffing" + TITLE + district boundaries (non-interactive)
document.addEventListener('DOMContentLoaded', async () => {
    const pymChild = new pym.Child();
    mapboxgl.accessToken = "pk.eyJ1IjoibWxub3ciLCJhIjoiY21mZDE2anltMDRkbDJtcHM1Y2M0eTFjNCJ9.nmMGLA-zX7BqznSJ2po65g";
  
    // Title text
    const MAP_TITLE = 'Foot patrol beats';
  
    // DOM
    const infoBox  = document.getElementById('info-box');
    const legendEl = document.getElementById('legend');
    const mapEl    = document.getElementById('map');
    if (infoBox) infoBox.style.display = 'none';
  
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mlnow/cm2tndow500co01pw3fho5d21',
      center: [-122.4267806, 37.7685798],
      zoom: 11
    });
  
    // Helpers
    const key = v => (v == null ? '' : String(v).trim());
    const coalesce = (...vals) => { for (const v of vals) if (v != null && `${v}`.trim() !== '') return v; return ''; };
  
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
  
    const featureKeyExpr = (name, station) => ['all',
      ['==', ['get', 'name'], name],
      ['==', ['get', 'station'], station]
    ];
  
    // Load both datasets
    const segmentsUrl  = 'final_map.geojson';
    const districtsUrl = 'districts.geojson'; // <-- your city districts (WGS84 / EPSG:4326)
    const [segmentsGJ, districtsGJ] = await Promise.all([
      fetch(segmentsUrl).then(r => r.json()),
      fetch(districtsUrl).then(r => r.json())
    ]);
  
    // Colors
    const COLOR_FILLED = '#66c2a5';  // teal
    const COLOR_UNFIL  = '#fc8d62';  // orange
    const COLOR_NA     = '#BDBDBD';  // neutral
  
    const staffingColor = [
      'match', ['get', 'staffing'],
      'Filled with on-duty',  COLOR_FILLED,
      'Filled with overtime', COLOR_FILLED,
      'Not filled',           COLOR_UNFIL,
      COLOR_NA
    ];
  
    const baseLineWidth  = 2;
    const hoverLineWidth = 2.5;
  
    map.on('load', () => {
      // Title pill
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
      if (legendEl) { legendEl.style.top = '56px'; legendEl.style.left = '14px'; }
  
      // -------- District boundaries (non-interactive) --------
      // Add BEFORE segments so it sits beneath them and never affects events.
      map.addSource('districts', { type: 'geojson', data: districtsGJ });
      map.addLayer({
        id: 'districts-line',
        type: 'line',
        source: 'districts',
        paint: {
          'line-color': '#777',           // neutral outline
          'line-width': 1.2,
          'line-opacity': 0.8,
          'line-dasharray': [2, 2]        // subtle dashed boundary
        },
        layout: { 'line-cap': 'round', 'line-join': 'round' }
      });
  
      // -------- Segments --------
      map.addSource('segments', { type: 'geojson', data: segmentsGJ });
  
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
  
      map.addLayer({
        id: 'segments-hover',
        type: 'line',
        source: 'segments',
        paint: { 'line-color': '#FFFFFF', 'line-width': hoverLineWidth, 'line-opacity': 0.7 },
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        filter: ['==', ['get','name'], '__none__']
      });
  
      map.addLayer({
        id: 'segments-hover-color',
        type: 'line',
        source: 'segments',
        paint: { 'line-color': staffingColor, 'line-width': ['+', hoverLineWidth, 1], 'line-opacity': 1.0 },
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        filter: ['==', ['get','name'], '__none__']
      });
  
      // Interactions (only on segments)
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
        map.setFilter('segments-hover', ['==', ['get','name'], '__none__']);
        map.setFilter('segments-hover-color', ['==', ['get','name'], '__none__']);
        map.getCanvas().style.cursor = '';
      });
  
      map.on('click', 'segments-line', e => {
        if (!e.features?.length) return;
        const props = e.features[0].properties || {};
        infoBox.style.display = 'block';
        infoBox.innerHTML = tplInfo(props);
  
        const name = props.name ?? '';
        const station = props.station ?? '';
        const filter = featureKeyExpr(name, station);
        map.setFilter('segments-hover', filter);
        map.setFilter('segments-hover-color', filter);
  
        pymChild.sendHeight();
      });
  
      // Click elsewhere → hide
      map.on('click', e => {
        const feats = map.queryRenderedFeatures(e.point, { layers: ['segments-line'] });
        if (feats.length) return;
        infoBox.style.display = 'none';
        map.setFilter('segments-hover', ['==', ['get','name'], '__none__']);
        map.setFilter('segments-hover-color', ['==', ['get','name'], '__none__']);
        pymChild.sendHeight();
      });
  
      // Legend
      const legendHTML = `
      <div class="legend-title">Staffing</div>
      <div class="legend-list">
        <div class="legend-item">
          <span class="legend-line" style="background:${COLOR_FILLED}"></span>
          <span>Filled</span>
        </div>
        <div class="legend-item">
          <span class="legend-line" style="background:${COLOR_UNFIL}"></span>
          <span>Not filled</span>
        </div>
        <div class="legend-item">
          <span class="legend-stroke legend-stroke--dashed" style="border-color:#777"></span>
          <span>Police districts</span>
        </div>
      </div>
    `;
    if (legendEl) legendEl.innerHTML = legendHTML;
    
      if (legendEl) legendEl.innerHTML = legendHTML;
  
      try {
        if (map.getLayer('road-label-navigation')) map.moveLayer('road-label-navigation');
        if (map.getLayer('settlement-subdivision-label')) map.moveLayer('settlement-subdivision-label');
      } catch {}
  
      pymChild.sendHeight();
    });
  
    window.addEventListener('resize', () => {
      map.resize();
      pymChild.sendHeight();
    });
  });
  