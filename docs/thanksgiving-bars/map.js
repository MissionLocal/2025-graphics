// map.js — point locations with bottom info box + mobile-friendly hit area
document.addEventListener('DOMContentLoaded', async () => {
  const pymChild = new pym.Child();
  mapboxgl.accessToken = "pk.eyJ1IjoibWxub3ciLCJhIjoiY21mZDE2anltMDRkbDJtcHM1Y2M0eTFjNCJ9.nmMGLA-zX7BqznSJ2po65g";

  // DOM
  const infoBox = document.getElementById('info-box');

  // Hide info box on load
  if (infoBox) infoBox.style.display = 'none';

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mlnow/cm2tndow500co01pw3fho5d21',
    center: [-122.418345, 37.750666],
    zoom: 13
  });

  const raw = v => (v === undefined || v === null ? '' : String(v));

  // Column helpers
  const getBar = p =>
    raw(p.bar ?? p.Bar ?? p.BAR);

  const getAddress = p =>
    raw(p.address ?? p.Address ?? p.ADDRESS);

  const getHours = p =>
    raw(p["hours open"] ?? p.hours_open ?? p.Hours);

  const getNotes = p =>
    raw(p.notes ?? p.Notes ?? p.NOTES); // preserves quotes

  // Info box template
  function tplInfoBox(p = {}) {
    const bar   = getBar(p) || 'Unnamed bar';
    const addr  = getAddress(p);
    const hours = getHours(p);
    const notes = getNotes(p);

    const parts = [];
    parts.push(`<strong>${bar}</strong>`); // bold ONLY the bar name
    if (addr)  parts.push(addr);
    if (hours) parts.push(hours);

    const topLine = parts.join(' | ');

    return `
      <div>
        <div>${topLine}</div>
        ${notes ? `<div class="info-notes">${notes}</div>` : ''}
      </div>
    `;
  }

  // Load GeoJSON
  const dataUrl = 'locations.geojson';
  const gj = await fetch(dataUrl).then(r => r.json());

  map.on('load', () => {
    map.addSource('locations', {
      type: 'geojson',
      data: gj
    });

    // Visible circles
    map.addLayer({
      id: 'locations-circle',
      type: 'circle',
      source: 'locations',
      paint: {
        'circle-radius': 7,
        'circle-color': '#f36e57',
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 1.2
      }
    });

    // Invisible large hit-area for easy tapping
    map.addLayer({
      id: 'locations-hit',
      type: 'circle',
      source: 'locations',
      paint: {
        'circle-radius': 25,                 // big tap target
        'circle-color': 'rgba(0,0,0,0)'      // fully invisible
      }
    });

    // Hover: pointer cursor
    map.on('mousemove', 'locations-hit', e => {
      if (!e.features?.length) return;
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'locations-hit', () => {
      map.getCanvas().style.cursor = '';
    });

    // Click → show bottom info box
    map.on('click', 'locations-hit', e => {
      if (!e.features?.length) return;
      const feature = e.features[0];
      const props = feature.properties || {};

      infoBox.style.display = 'block';
      infoBox.innerHTML = tplInfoBox(props);
      pymChild.sendHeight();
    });

    // Click elsewhere → hide box
    map.on('click', e => {
      const feats = map.queryRenderedFeatures(e.point, { layers: ['locations-hit'] });
      if (feats.length) return; // click was on a bar
      infoBox.style.display = 'none';
      pymChild.sendHeight();
    });

    // Keep labels on top
    try {
      if (map.getLayer('road-label-navigation'))
        map.moveLayer('road-label-navigation');

      if (map.getLayer('settlement-subdivision-label'))
        map.moveLayer('settlement-subdivision-label');
    } catch (e) {}
  });

  window.addEventListener('resize', () => {
    map.resize();
    pymChild.sendHeight();
  });
});
