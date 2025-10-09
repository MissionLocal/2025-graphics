// map.js
// Minimal Mapbox GL JS loader for a full-page map + a local GeoJSON file.
// HTML needs: <div id="map"></div>
// Include Mapbox GL JS in your HTML head:
// <link href="https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.css" rel="stylesheet" />
// <script src="https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.js"></script>

(function () {
    // --- make #map fill the viewport ---
    const mapEl = document.getElementById('map');
    function setMapSize() {
      if (!mapEl) return;
      mapEl.style.position = 'fixed';
      mapEl.style.top = '0';
      mapEl.style.left = '0';
      mapEl.style.width = '100%';
      mapEl.style.height = window.innerHeight + 'px';
    }
    setMapSize();
    window.addEventListener('resize', setMapSize);
  
    // --- Mapbox token ---
    mapboxgl.accessToken = 'pk.eyJ1IjoibWxub3ciLCJhIjoiY21kNmw1aTAyMDFkbTJqb3Z2dTN0YzRjMyJ9.4abRTnHdhMI-RE48dHNtYw';
  
    // --- create map ---
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mlnow/cm2tndow500co01pw3fho5d21',
      center: [-122.4194, 37.7749],
      zoom: 10,
      attributionControl: true
    });
  
    const GEOJSON_URL = 'gdf_supe_with_RC.geojson'; // adjust path if needed
  
    map.on('load', async () => {
      // 1) fetch data
      let data;
      try {
        const resp = await fetch(GEOJSON_URL, { cache: 'no-store' });
        if (!resp.ok) throw new Error(`Failed to fetch ${GEOJSON_URL}: ${resp.status} ${resp.statusText}`);
        data = await resp.json();
      } catch (err) {
        console.error(err);
        const warn = document.createElement('div');
        warn.style.position = 'fixed';
        warn.style.top = '10px';
        warn.style.left = '10px';
        warn.style.padding = '10px 12px';
        warn.style.background = 'rgba(0,0,0,0.7)';
        warn.style.color = '#fff';
        warn.style.font = '14px/1.3 system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
        warn.style.borderRadius = '6px';
        warn.style.zIndex = '9999';
        warn.textContent = `Could not load ${GEOJSON_URL}. See console for details.`;
        document.body.appendChild(warn);
        return;
      }
  
      // 2) add source
      if (map.getSource('supe')) map.removeSource('supe');
      map.addSource('supe', {
        type: 'geojson',
        data,
        promoteId: 'RP1PRCLID'
      });
  
      // 3) binary RC coloring
      const TRUE_COLOR  = "#0dd6c7";
      const FALSE_COLOR = "#f36e57";
      const NA_COLOR    = "#bbbbbb";
  
      const rcIsTrue = [
        "match",
        ["downcase", ["to-string", ["get", "RC"]]],
        "true",  true,
        "t",     true,
        "yes",   true,
        "y",     true,
        "1",     true,
        "on",    true,
        "false", false,
        "f",     false,
        "no",    false,
        "n",     false,
        "0",     false,
        "off",   false,
        false // fallback
      ];
  
      const rcFillColor = [
        "case",
        ["!", ["has", "RC"]], NA_COLOR,  // property truly missing
        rcIsTrue,             TRUE_COLOR,
        FALSE_COLOR
      ];
  
      // 4) layers
      if (map.getLayer('supe-fill')) map.removeLayer('supe-fill');
      if (map.getLayer('supe-line')) map.removeLayer('supe-line');
  
      map.addLayer({
        id: 'supe-fill',
        type: 'fill',
        source: 'supe',
        paint: {
          'fill-color': rcFillColor,
          'fill-opacity': 0.35
        }
        // NOTE: no geometry-type filter so MultiPolygons render too
      });
  
      map.addLayer({
        id: 'supe-line',
        type: 'line',
        source: 'supe',
        paint: {
          'line-color': '#333',
          'line-width': 1.25
        }
      });
  
      // 5) fit to data
      const bounds = computeGeoJSONBounds(data);
      if (bounds) map.fitBounds(bounds, { padding: 24, duration: 0 });
  
      // 6) legend
      (function renderBinaryLegend() {
        let legend = document.getElementById("rc-legend");
        if (!legend) {
          legend = document.createElement("div");
          legend.id = "rc-legend";
          legend.style.position = "fixed";
          legend.style.bottom = "12px";
          legend.style.left = "12px";
          legend.style.padding = "10px 12px";
          legend.style.background = "rgba(255,255,255,0.9)";
          legend.style.borderRadius = "8px";
          legend.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
          legend.style.font = "13px/1.3 Barlow, system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
          legend.style.zIndex = "2";
          document.body.appendChild(legend);
        }
        legend.innerHTML = `
          <div style="font-weight:600;margin-bottom:6px;">RC</div>
          <div style="display:flex;align-items:center;gap:8px;margin:2px 0;">
            <span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:${TRUE_COLOR};border:1px solid rgba(0,0,0,0.15)"></span>
            <span>True</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;margin:2px 0;">
            <span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:${FALSE_COLOR};border:1px solid rgba(0,0,0,0.15)"></span>
            <span>False</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;margin:2px 0;">
            <span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:${NA_COLOR};border:1px solid rgba(0,0,0,0.15)"></span>
            <span>N/A</span>
          </div>
        `;
      })();
  
      // 7) popup + cursor
      const popup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: true,
        offset: 8,
        maxWidth: "300px"
      });
  
      function val(v) {
        if (v === null || v === undefined || v === "" || v !== v) return "—";
        if (typeof v === "number" && Number.isFinite(v)) {
          return Number.isInteger(v) ? v.toString() : String(v);
        }
        return String(v);
      }
  
      function buildPopupHTML(p) {
        const rows = [
          ["RP1PRCLID", p.RP1PRCLID],
          ["heightbulk", p.heightbulk],
          ["heightbu_1", p.heightbu_1],
          ["RC", p.RC],
          ["UNITS", p.UNITS],
          ["YRBLT", p.YRBLT],
          ["sup_dist", p.sup_dist]
        ].map(([k, v]) => `<tr><th>${k}</th><td>${val(v)}</td></tr>`).join("");
  
        return `
          <div style="font: 13px/1.3 system-ui, -apple-system, Segoe UI, Roboto, sans-serif;">
            <table style="border-collapse: collapse; width: 100%;">
              <tbody>${rows}</tbody>
            </table>
            <style>
              .mapboxgl-popup-content table th {
                text-align: left; white-space: nowrap; padding: 2px 8px 2px 0; font-weight: 600;
              }
              .mapboxgl-popup-content table td {
                text-align: left; padding: 2px 0;
              }
            </style>
          </div>
        `;
      }
  
      map.on('mouseenter', 'supe-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'supe-fill', () => { map.getCanvas().style.cursor = ''; });
  
      map.on('click', 'supe-fill', (e) => {
        const f = e.features && e.features[0];
        if (!f) return;
        popup
          .setLngLat(e.lngLat)
          .setHTML(buildPopupHTML(f.properties || {}))
          .addTo(map);
      });
    });
  
    // --- bounds helper ---
    function computeGeoJSONBounds(geojson) {
      let bounds = null;
      function extendBounds(lng, lat) {
        if (!isFinite(lng) || !isFinite(lat)) return;
        if (!bounds) bounds = new mapboxgl.LngLatBounds([lng, lat], [lng, lat]);
        else bounds.extend([lng, lat]);
      }
      function walkCoords(coords) {
        if (!coords) return;
        if (typeof coords[0] === 'number') extendBounds(coords[0], coords[1]);
        else for (const c of coords) walkCoords(c);
      }
      function handleGeometry(geom) {
        if (!geom) return;
        if (geom.type === 'GeometryCollection') (geom.geometries || []).forEach(handleGeometry);
        else walkCoords(geom.coordinates);
      }
      if (geojson.type === 'FeatureCollection') (geojson.features || []).forEach(f => handleGeometry(f.geometry));
      else if (geojson.type === 'Feature') handleGeometry(geojson.geometry);
      else handleGeometry(geojson);
      return bounds;
    }
  })();
  