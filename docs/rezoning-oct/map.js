// map.js — Proposed heights (vector tiles) with *stable* Pym height reporting
document.addEventListener('DOMContentLoaded', () => {
  // ---------- Minimal, STABLE Pym ----------
  let pymChild = null;
  try { if (window.pym) pymChild = new pym.Child(); } catch (_) {}

  // Measure the content we actually care about
  const WRAPPER_ID = 'mapsWrapper'; // make sure your outer container has this id
  const measure = () => {
    const el = document.getElementById(WRAPPER_ID) || document.body;
    return Math.ceil(el.getBoundingClientRect().height);
  };

  // Only send when height has *settled* AND changed meaningfully
  let lastSentH = 0;
  let lastSentAt = 0;
  let sendTimer = null;

  function sendHeightStable(reason = '', minDelta = 4, settleMs = 120) {
    clearTimeout(sendTimer);
    sendTimer = setTimeout(() => {
      const h = measure();
      const now = performance.now();
      const delta = Math.abs(h - lastSentH);

      // ignore micro-changes + bursts
      if (delta < minDelta && now - lastSentAt < 1000) return;

      // send once
      try { if (pymChild) pymChild.sendHeight(); } catch (_) {}
      lastSentH = h;
      lastSentAt = now;
    }, settleMs);
  }

  // --------- Map setup ---------
  mapboxgl.accessToken = "pk.eyJ1IjoibWxub3ciLCJhIjoiY21ncjMxM2QwMnhjajJvb3ZobnllcDdmOSJ9.dskkEmEIuRIhKPkTh5o_Iw";
  const TILESET_URL = "mapbox://mlnow.01iokrpa";
  const SOURCE_LAYER = "gdf_supe_with_categories";

  const infoBox  = document.getElementById('info-box');
  const legendEl = document.getElementById('legend');
  const selectEl = document.getElementById('layerSelect');
  if (infoBox) infoBox.style.display = 'none';

  const HEIGHT_BREAKS = [40,50,65,70,75,80,85,105,120,130,140,160,180,240,250,300,350,450,490,500,650];
  const HEIGHT_COLORS = ["#9DF4D9","#66D9CF","#3CCDC9","#22BFC3","#12ADBA","#008FA4","#007DBC","#006FB0","#0062A1","#005892","#004F84","#004676","#003C66","#003459","#002C4D","#00233F","#001C31","#001724","#001319","#000F19","#000C13"];
  const BASE_BELOW_FIRST = "#EFFFFA";
  const EXACT_FORTY_COLOR = "#9e9e9e";
  const MISSING_COLOR = "#E6E6E6";

  function makeHeightColorExprStep(){
    const raw=["get","proposed_height"];
    const v=["to-number",raw];
    return ["case",
      ["any",["==",raw,null],["!=",v,v]], MISSING_COLOR,
      ["==",v,40], EXACT_FORTY_COLOR,
      ["<", v,40], BASE_BELOW_FIRST,
      ["step", v,
        BASE_BELOW_FIRST,
        40,HEIGHT_COLORS[0],50,HEIGHT_COLORS[1],65,HEIGHT_COLORS[2],
        70,HEIGHT_COLORS[3],75,HEIGHT_COLORS[4],80,HEIGHT_COLORS[5],
        85,HEIGHT_COLORS[6],105,HEIGHT_COLORS[7],120,HEIGHT_COLORS[8],
        130,HEIGHT_COLORS[9],140,HEIGHT_COLORS[10],160,HEIGHT_COLORS[11],
        180,HEIGHT_COLORS[12],240,HEIGHT_COLORS[13],250,HEIGHT_COLORS[14],
        300,HEIGHT_COLORS[15],350,HEIGHT_COLORS[16],450,HEIGHT_COLORS[17],
        490,HEIGHT_COLORS[18],500,HEIGHT_COLORS[19],650,HEIGHT_COLORS[20]
      ]
    ];
  }

  function legendHTML(title){
    const gradientColors = HEIGHT_COLORS.join(',');
    const minActive = HEIGHT_BREAKS[0] + 1; // 41
    const maxLabel  = HEIGHT_BREAKS.at(-1);
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
                  box-shadow:inset 0 0 0 1px rgba(0,0,0,.08);margin:4px 0 4px;"></div>
      <div class="legend-ends" style="display:flex;justify-content:space-between;">
        <span>${minActive}</span><span>${maxLabel}</span>
      </div>`;
  }

  if (legendEl) {
    legendEl.style.display = 'inline-block';
    legendEl.innerHTML = legendHTML('Proposed height (ft)');
  }

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mlnow/cm2tndow500co01pw3fho5d21',
    center: [-122.4411568, 37.765044],
    zoom: 11.85
  });

  const robustClassFilter = (key) => [
    "any",
    ["==", ["get", key], true],
    ["==", ["downcase", ["coalesce", ["to-string", ["get", key]], ""]], "true"],
    ["==", ["coalesce", ["to-number", ["get", key]], 0], 1]
  ];

  // info box utils
  const toNum = v => {
    if (v==null) return null;
    if (typeof v==="number") return Number.isFinite(v)?v:null;
    const s=String(v).trim(); if(!s||/^(null|na|n\/a|none|undefined|nan)$/i.test(s)) return null;
    const m=s.match(/^[+-]?\d+(\.\d+)?/); return m?Number(m[0]):null;
  };
  const fallbackChange = p => {
    const proposed = toNum(p?.proposed_height_int ?? p?.proposed_height);
    const existing = toNum(p?.heightdist);
    return (proposed!=null && existing!=null) ? proposed-existing : null;
  };
  function tplInfo(p={}){
    const id = p?.RP1PRCLID ?? "—";
    const type = p?.class_desc ?? p?.RP1CLACDE ?? "—";
    const rawPH = (p?.proposed_height ?? "").toString().trim();
    const nums  = rawPH.match(/[+-]?\d+(\.\d+)?/g) || [];
    const isMultiple = !rawPH || /^\s*nan\s*$/i.test(rawPH) || /[;/]/.test(rawPH) || nums.length>1;
    const propStr = isMultiple ? "multiple" : (rawPH || "N/A");
    let ch = toNum(p?.change); if (ch==null) ch = fallbackChange(p);
    let changeTxt = "—";
    if (ch!=null){ const r = Math.abs(ch%1)===0 ? Math.trunc(ch) : Math.round(ch*10)/10;
      const sign = ch>0?"+":ch<0?"−":""; changeTxt = `${sign}${Number.isInteger(r)?r:r.toFixed(1)} ft`; }
    return `
      <div class="info-header"><strong>Parcel ${id}</strong><span class="sep"> • </span><span class="bldg-type">${type}</span></div>
      <div class="info-stats">Proposed height: ${propStr} • Change: ${changeTxt}</div>
    `;
  }

  map.on('load', () => {
    const firstSymbolId = (map.getStyle().layers.find(l=>l.type==='symbol')||{}).id;

    map.addSource('parcels', { type:'vector', url:TILESET_URL });

    map.addLayer({
      id:'parcels-fill', type:'fill', source:'parcels', 'source-layer':SOURCE_LAYER,
      paint:{ 'fill-color': makeHeightColorExprStep(), 'fill-opacity':0.9 }
    }, firstSymbolId);

    map.addLayer({
      id:'outline', type:'line', source:'parcels', 'source-layer':SOURCE_LAYER,
      paint:{ 'line-color':'#ffffff', 'line-width':0.2 }
    }, firstSymbolId);

    map.addLayer({
      id:'hover', type:'line', source:'parcels', 'source-layer':SOURCE_LAYER,
      paint:{ 'line-color':'#ffffff', 'line-width':2.0 },
      filter:['==',['get','RP1PRCLID'],'' ]
    }, firstSymbolId);

    map.on('mousemove','parcels-fill', e=>{
      if (!e.features?.length) return;
      const pid = e.features[0].properties?.RP1PRCLID ?? '';
      map.setFilter('hover', ['==',['get','RP1PRCLID'], pid]);
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave','parcels-fill', ()=>{
      map.setFilter('hover', ['==',['get','RP1PRCLID'], '' ]);
      map.getCanvas().style.cursor = '';
    });

    map.on('click','parcels-fill', e=>{
      const f = e.features?.[0]; if (!f) return;
      if (infoBox){
        infoBox.innerHTML = tplInfo(f.properties||{});
        infoBox.style.display = 'block';
        // height after reveal
        requestAnimationFrame(()=> sendHeightStable('info-show', 4, 80));
      }
    });

    // Background click hides
    map.on('click', e=>{
      const hit = map.queryRenderedFeatures(e.point, { layers:['parcels-fill'] });
      if (hit.length) return;
      if (infoBox && infoBox.style.display!=='none'){
        infoBox.style.display = 'none';
        requestAnimationFrame(()=> sendHeightStable('info-hide', 4, 80));
      }
    });

    // Dropdown filter (if present)
    if (selectEl){
      const applyFilter = () => {
        const key = selectEl.value; // 'all' | 'RC' | 'SRES' | 'MRES' | 'COMM' | 'AMEND'
        const filt = (key==='all') ? null : robustClassFilter(key);
        if (map.getLayer('parcels-fill')) map.setFilter('parcels-fill', filt);
        if (map.getLayer('outline'))      map.setFilter('outline', filt);
        // legend/text may wrap -> send once after layout settles
        sendHeightStable('filter-change', 6, 120);
      };
      selectEl.addEventListener('change', applyFilter);
      applyFilter();
    }
  });

  // --- Debounced *window* resize (don’t spam parent) ---
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      try { map.resize(); } catch(_) {}
      sendHeightStable('window-resize', 6, 120);
    }, 150);
  }, { passive:true });

  // --- Send height only once the map is truly idle + fonts are ready ---
  Promise.all([
    new Promise(res => map.once('idle', res)),
    (document.fonts?.ready ?? Promise.resolve())
  ]).then(() => {
    // one tick for legend/info layout, then one stable send
    requestAnimationFrame(() => sendHeightStable('initial', 8, 120));
  });
});
