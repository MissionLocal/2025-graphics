// map.js — two maps: (1) plain segments w/ info, (2) staffing colors — synced cameras + synced clicks
document.addEventListener('DOMContentLoaded', async () => {
    const pymChild = new pym.Child();
    mapboxgl.accessToken = "pk.eyJ1IjoibWxub3ciLCJhIjoiY21mZDE2anltMDRkbDJtcHM1Y2M0eTFjNCJ9.nmMGLA-zX7BqznSJ2po65g";
  
    // DOM
    const infoBox1 = document.getElementById('info-box1');
    const infoBox2 = document.getElementById('info-box2');
    const legend2  = document.getElementById('legend2');
    if (infoBox1) infoBox1.style.display = 'none';
    if (infoBox2) infoBox2.style.display = 'none';
  
    // View
    const VIEW = {
      center: [-122.4267806, 37.7685798],
      zoom: 11.2,
      style: 'mapbox://styles/mlnow/cm2tndow500co01pw3fho5d21'
    };
  
    // Create maps
    const map1 = new mapboxgl.Map({ container: 'map1', style: VIEW.style, center: VIEW.center, zoom: VIEW.zoom });
    const map2 = new mapboxgl.Map({ container: 'map2', style: VIEW.style, center: VIEW.center, zoom: VIEW.zoom });
  
    // Helpers
    const key = v => (v == null ? '' : String(v).trim());
    const coalesce = (...vals) => { for (const v of vals) if (v != null && `${v}`.trim() !== '') return v; return ''; };
    const featureKeyExpr = (name, station) => ['all', ['==', ['get','name'], name], ['==', ['get','station'], station]];
  
    function tplInfo(p = {}) {
      const name     = key(coalesce(p.name));
      const station  = key(coalesce(p.station));
      const division = key(coalesce(p.division));
      const staffing = key(coalesce(p.staffing));
      return `
        <div><strong>${name || 'Unnamed segment'}</strong></div>
        <div class="info-stats">
          ${station ? `Station: ${station}` : ''}${station && division ? ' • ' : ''}${division ? `Division: ${division}` : ''}
        </div>
        <div class="info-stats">Staffing: ${staffing || 'N/A'}</div>
      `;
    }
  
    // Colors for staffing (map 2)
    const COLOR_FILLED = '#66c2a5';   // teal
    const COLOR_OT     = '#fc8d62';   // orange
    const COLOR_UNFIL  = '#bdbdbd';   // neutral (Not Filled)
    const COLOR_NA     = '#bdbdbd';   // fallback
  
    const staffingColor = [
      'match', ['get', 'staffing'],
      'Filled', COLOR_FILLED,
      'Filled with Overtime', COLOR_OT,
      'Not Filled', COLOR_UNFIL,
      COLOR_NA
    ];
  
    // Load once
    const dataUrl = 'final_map.geojson';
    const gj = await fetch(dataUrl).then(r => r.json());
  
    // =============== SYNC CAMERAS (both ways) =================
    let isSyncing = false;
    function syncFromTo(src, dst) {
      src.on('move', () => {
        if (isSyncing) return;
        isSyncing = true;
        dst.jumpTo({
          center: src.getCenter(),
          zoom:   src.getZoom(),
          bearing:src.getBearing(),
          pitch:  src.getPitch()
        });
        isSyncing = false;
      });
    }
    syncFromTo(map1, map2);
    syncFromTo(map2, map1);
  
    // =============== MAP 1 (plain lines + info + hover) =======
    map1.on('load', () => {
      map1.addSource('segments1', { type: 'geojson', data: gj });
  
      const baseWidth  = 2.5;
      const hoverWidth = 4;
  
      map1.addLayer({
        id: 'segments1-line',
        type: 'line',
        source: 'segments1',
        paint: { 'line-color': '#666', 'line-width': baseWidth, 'line-opacity': 0.95 },
        layout: { 'line-cap': 'round', 'line-join': 'round' }
      });
  
      map1.addLayer({
        id: 'segments1-casing',
        type: 'line',
        source: 'segments1',
        paint: { 'line-color': '#FFFFFF', 'line-width': ['+', baseWidth, 1.5], 'line-opacity': 0.25 },
        layout: { 'line-cap': 'round', 'line-join': 'round' }
      });
  
      map1.addLayer({
        id: 'segments1-hover',
        type: 'line',
        source: 'segments1',
        paint: { 'line-color': '#FFFFFF', 'line-width': hoverWidth, 'line-opacity': 0.7 },
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        filter: ['==', ['get','name'], '__none__']
      });
  
      // Hover (local to map1)
      map1.on('mousemove', 'segments1-line', e => {
        if (!e.features?.length) return;
        const f = e.features[0];
        const name = f.properties?.name ?? '';
        const station = f.properties?.station ?? '';
        map1.setFilter('segments1-hover', featureKeyExpr(name, station));
        map1.getCanvas().style.cursor = 'pointer';
      });
      map1.on('mouseleave', 'segments1-line', () => {
        map1.setFilter('segments1-hover', ['==', ['get','name'], '__none__']);
        map1.getCanvas().style.cursor = '';
      });
  
      try {
        if (map1.getLayer('road-label-navigation')) map1.moveLayer('road-label-navigation');
        if (map1.getLayer('settlement-subdivision-label')) map1.moveLayer('settlement-subdivision-label');
      } catch {}
    });
  
    // =============== MAP 2 (staffing colors + info + hover) ===
    map2.on('load', () => {
      map2.addSource('segments2', { type: 'geojson', data: gj });
  
      const baseWidth  = 2;
      const hoverWidth = 3;
  
      map2.addLayer({
        id: 'segments2-line',
        type: 'line',
        source: 'segments2',
        paint: { 'line-color': staffingColor, 'line-width': baseWidth, 'line-opacity': 0.95 },
        layout: { 'line-cap': 'round', 'line-join': 'round' }
      });
  
      map2.addLayer({
        id: 'segments2-casing',
        type: 'line',
        source: 'segments2',
        paint: { 'line-color': '#FFFFFF', 'line-width': ['+', baseWidth, 1.5], 'line-opacity': 0.25 },
        layout: { 'line-cap': 'round', 'line-join': 'round' }
      });
  
      map2.addLayer({
        id: 'segments2-hover',
        type: 'line',
        source: 'segments2',
        paint: { 'line-color': '#FFFFFF', 'line-width': hoverWidth, 'line-opacity': 0.7 },
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        filter: ['==', ['get','name'], '__none__']
      });
  
      map2.addLayer({
        id: 'segments2-hover-color',
        type: 'line',
        source: 'segments2',
        paint: { 'line-color': staffingColor, 'line-width': ['+', hoverWidth, 1], 'line-opacity': 1 },
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        filter: ['==', ['get','name'], '__none__']
      });
  
      // Hover (local to map2)
      map2.on('mousemove', 'segments2-line', e => {
        if (!e.features?.length) return;
        const f = e.features[0];
        const name = f.properties?.name ?? '';
        const station = f.properties?.station ?? '';
        const filter = featureKeyExpr(name, station);
        map2.setFilter('segments2-hover', filter);
        map2.setFilter('segments2-hover-color', filter);
        map2.getCanvas().style.cursor = 'pointer';
      });
      map2.on('mouseleave', 'segments2-line', () => {
        map2.setFilter('segments2-hover', ['==', ['get','name'], '__none__']);
        map2.setFilter('segments2-hover-color', ['==', ['get','name'], '__none__']);
        map2.getCanvas().style.cursor = '';
      });
  
      // Legend
      const legendHTML = `
        <div class="legend-title">Staffing</div>
        <div class="legend-list">
          <div class="legend-item"><span class="legend-line" style="background:${COLOR_FILLED}"></span><span>Filled</span></div>
          <div class="legend-item"><span class="legend-line" style="background:${COLOR_OT}"></span><span>Filled with Overtime</span></div>
          <div class="legend-item"><span class="legend-line" style="background:${COLOR_UNFIL}"></span><span>Not Filled</span></div>
        </div>`;
      if (legend2) legend2.innerHTML = legendHTML;
  
      try {
        if (map2.getLayer('road-label-navigation')) map2.moveLayer('road-label-navigation');
        if (map2.getLayer('settlement-subdivision-label')) map2.moveLayer('settlement-subdivision-label');
      } catch {}
    });
  
    // =============== SHARED CLICK HANDLERS (sync info + highlight) =============
    function showInfoOnBoth(props) {
      if (infoBox1) { infoBox1.innerHTML = tplInfo(props); infoBox1.style.display = 'block'; }
      if (infoBox2) { infoBox2.innerHTML = tplInfo(props); infoBox2.style.display = 'block'; }
      pymChild.sendHeight();
    }
    function highlightOnBoth(props) {
      const name = props?.name ?? '';
      const station = props?.station ?? '';
      const filter = featureKeyExpr(name, station);
      if (map1.getLayer('segments1-hover')) map1.setFilter('segments1-hover', filter);
      if (map2.getLayer('segments2-hover')) map2.setFilter('segments2-hover', filter);
      if (map2.getLayer('segments2-hover-color')) map2.setFilter('segments2-hover-color', filter);
    }
    function clearAllHighlightsAndCards() {
      if (map1.getLayer('segments1-hover')) map1.setFilter('segments1-hover', ['==', ['get','name'], '__none__']);
      if (map2.getLayer('segments2-hover')) map2.setFilter('segments2-hover', ['==', ['get','name'], '__none__']);
      if (map2.getLayer('segments2-hover-color')) map2.setFilter('segments2-hover-color', ['==', ['get','name'], '__none__']);
      if (infoBox1) infoBox1.style.display = 'none';
      if (infoBox2) infoBox2.style.display = 'none';
      pymChild.sendHeight();
    }
  
    function wireClicksFor(map, lineLayerId) {
      // Click on a segment → show both info boxes + highlight both
      map.on('click', lineLayerId, e => {
        if (!e.features?.length) return;
        const props = e.features[0].properties || {};
        showInfoOnBoth(props);
        highlightOnBoth(props);
      });
  
      // Click elsewhere on this map → hide both
      map.on('click', e => {
        const feats = map.queryRenderedFeatures(e.point, { layers: [lineLayerId] });
        if (feats.length) return; // clicked a segment on this map
        clearAllHighlightsAndCards();
      });
    }
  
    // Wire after both maps have their line layers (safe to attach now; listeners wait for layers)
    map1.on('load', () => wireClicksFor(map1, 'segments1-line'));
    map2.on('load', () => wireClicksFor(map2, 'segments2-line'));
  
    // Resize handling
    window.addEventListener('resize', () => {
      map1.resize();
      map2.resize();
      pymChild.sendHeight();
    });
  });
  