// map.js — Proposed heights, Mission Local embed style (single-layer filtering)
document.addEventListener('DOMContentLoaded', async () => {
    const pymChild = new pym.Child();
    mapboxgl.accessToken = "pk.eyJ1IjoibWxub3ciLCJhIjoiY21mZDE2anltMDRkbDJtcHM1Y2M0eTFjNCJ9.nmMGLA-zX7BqznSJ2po65g";
  
    // DOM refs
    const infoBox  = document.getElementById('info-box');
    const legendEl = document.getElementById('legend');
    const btns     = document.getElementById('layerButtons');
    if (infoBox) infoBox.style.display = 'none';
  
    // ======= CONFIG =======
    const DATA_URL = 'gdf_supe_with_categories.geojson'; // <-- your file path
  
    // Color ramp (light → dark). Add/remove hexes freely; legend + scale update automatically.
    const COLOR_STOPS = [
      "#dbe8f9", "#b9d3f3", "#95bceb", "#73a5e2",
      "#4f8bd7", "#2f74ce", "#165fc4", "#0a4ea8"
    ];
  
    // Legend HTML (squares)
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
  
    // Helpers
    function computeHeightStats(geojson) {
      const vals = geojson.features
        .map(f => Number(f.properties?.proposed_height))
        .filter(v => Number.isFinite(v));
      const min = vals.length ? Math.min(...vals) : 0;
      const max = vals.length ? Math.max(...vals) : 100;
      return { min, max, mid: (min + max) / 2 };
    }
  
    function makeStops(min, max, n) {
      const stops = [];
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        stops.push(min + t * (max - min));
      }
      return stops;
    }
  
    function makeInterpolateExpr(min, max) {
      const n = COLOR_STOPS.length;
      const stops = makeStops(min, max, n);
      const expr = ["interpolate", ["linear"], ["to-number", ["get", "proposed_height"]]];
      for (let i = 0; i < n; i++) expr.push(stops[i], COLOR_STOPS[i]);
      return expr;
    }
  
    function layerPaint(fillColorExpr) {
      return {
        "fill-color": [
          "case",
          ["!", ["to-boolean", ["get", "proposed_height"]]], "#BFC7D1", // N/A gray
          fillColorExpr
        ],
        "fill-opacity": 0.85,
        "fill-outline-color": "#9fb3c8"
      };
    }
  
    // Robust class filter: true OR "true"/"True" OR 1
    const robustClassFilter = (key) => [
      "any",
      ["==", ["get", key], true],                                                   // boolean true
      ["==", ["downcase", ["coalesce", ["to-string", ["get", key]], ""]], "true"],  // string "true"
      ["==", ["coalesce", ["to-number", ["get", key]], 0], 1]                       // number 1
    ];
  
    // Info card (Units hidden if 0, “Type” label)
    function tplInfo(p = {}) {
      const id   = p?.RP1PRCLID ?? "—";
      const type = p?.class_desc ?? p?.RP1CLACDE ?? "—";
      const hNum = Number(p?.proposed_height);
      const hTxt = Number.isFinite(hNum) ? `${Math.round(hNum)} ft` : "N/A";
      const unitsNum = Number(p?.UNITS);
  
      const bits = [`Proposed height: ${hTxt}`];
      if (Number.isFinite(unitsNum) && unitsNum > 0) bits.push(`Units: ${Math.round(unitsNum)}`);
      bits.push(`Type: ${type}`);
  
      return `
        <div><strong>Parcel ${id}</strong></div>
        <div class="info-stats">${bits.join(' • ')}</div>
      `;
    }
  
    // Load data (serve over http/https, not file://)
    async function loadData() {
      if (window.ZONING_DATA) return window.ZONING_DATA;
      const res = await fetch(DATA_URL);
      if (!res.ok) throw new Error('Failed to fetch GeoJSON');
      return await res.json();
    }
  
    const gj    = await loadData();
    const stats = computeHeightStats(gj);
  
    // Show legend immediately
    if (legendEl) {
      legendEl.style.display = 'inline-block';
      legendEl.innerHTML = legendSquaresHTML('Proposed height (ft)', Math.round(stats.min), Math.round(stats.max));
    }
  
    // Map
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mlnow/cm2tndow500co01pw3fho5d21',
      center: [-122.496, 37.750],
      zoom: 12.2
    });
    map.addControl(new mapboxgl.NavigationControl({ showCompass:false }));
  
    map.on('load', () => {
      const colorExpr = makeInterpolateExpr(stats.min, stats.max);
  
      map.addSource('parcels', { type:'geojson', data: gj });
  
      // ONE fill layer we filter dynamically
      map.addLayer({
        id: 'parcels-fill',
        type: 'fill',
        source: 'parcels',
        paint: layerPaint(colorExpr)  // default = all features (no filter)
      });
  
      // Outline + hover
      map.addLayer({ id:'outline', type:'line', source:'parcels',
                     paint:{ 'line-color':'#fff','line-width':0.4 } });
      map.addLayer({ id:'hover', type:'line', source:'parcels',
                     paint:{ 'line-color':'#fff','line-width':2.0 },
                     filter:['==',['get','RP1PRCLID'],''] });
  
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
        infoBox.style.display = 'block';
        infoBox.innerHTML = tplInfo(f.properties || {});
        pymChild.sendHeight();
      });
  
      // Fit to bounds
      try {
        const bbox = simpleBbox(gj);
        if (bbox) map.fitBounds(bbox, { padding: 24, maxZoom: 14 });
      } catch {}
  
      // Buttons → apply filter on single fill layer
      if (btns) {
        btns.addEventListener('click', (e) => {
          const b = e.target.closest('button.btn');
          if (!b) return;
          const key = b.dataset.layer; // "all" | "RC" | "SRES" | "MRES" | "COMM"
  
          // button UI
          [...btns.querySelectorAll('.btn')].forEach(x => x.classList.remove('active'));
          b.classList.add('active');
  
          if (!map.getLayer('parcels-fill')) return;
  
          if (key === 'all') {
            // SHOW EVERYTHING → remove filter entirely
            map.setFilter('parcels-fill', null);
          } else {
            // Filter by strict truthiness for the chosen property
            map.setFilter('parcels-fill', robustClassFilter(key));
          }
  
          // keep outline/hover visible
          if (map.getLayer('outline')) map.setLayoutProperty('outline', 'visibility', 'visible');
          if (map.getLayer('hover'))   map.setLayoutProperty('hover',   'visibility', 'visible');
        });
      }
    });
  
    // Resize + pym
    window.addEventListener('resize', () => { map.resize(); pymChild.sendHeight(); });
  
    // Minimal bbox (no Turf dependency)
    function simpleBbox(geo){
      let minX= Infinity, minY= Infinity, maxX= -Infinity, maxY= -Infinity;
      const scan = (c)=>{ const x=+c[0], y=+c[1]; if(!Number.isFinite(x)||!Number.isFinite(y))return;
        if(x<minX)minX=x; if(x>maxX)maxX=x; if(y<minY)minY=y; if(y>maxY)maxY=y; };
      const coords = (g)=>{
        const t=g.type;
        if(t==='Point')return [g.coordinates];
        if(t==='MultiPoint'||t==='LineString')return g.coordinates;
        if(t==='MultiLineString'||t==='Polygon')return g.coordinates.flat();
        if(t==='MultiPolygon')return g.coordinates.flat(2);
        return [];
      };
      if (geo.type==='FeatureCollection') geo.features.forEach(f=>coords(f.geometry).forEach(scan));
      else if (geo.type && geo.coordinates) coords(geo).forEach(scan);
      else if (geo.type==='Feature') coords(geo.geometry).forEach(scan);
      if (minX===Infinity) return null;
      return [[minX,minY],[maxX,maxY]];
    }
  });
  