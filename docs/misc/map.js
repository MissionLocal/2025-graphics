// map.js
// Minimal Mapbox GL JS loader for a full-page map + a local GeoJSON file.
// HTML needs: <div id="map"></div>
// Include Mapbox GL JS in your HTML head:
// <link href="https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.css" rel="stylesheet" />
// <script src="https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.js"></script>

(function () {
    // 1) Make the #map div fill the viewport even without extra CSS.
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
  
    // 2) Your Mapbox token
    mapboxgl.accessToken = 'pk.eyJ1IjoibWxub3ciLCJhIjoiY21kNmw1aTAyMDFkbTJqb3Z2dTN0YzRjMyJ9.4abRTnHdhMI-RE48dHNtYw';
  
    // 3) Create the map
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mlnow/cm2tndow500co01pw3fho5d21',
      center: [-122.4194, 37.7749], // temporary center (SF)
      zoom: 10,
      attributionControl: true
    });
  
    // 4) Load your GeoJSON and add it to the map
    const GEOJSON_URL = 'gdf_supe_filtered.geojson'; // adjust path if needed
  
    map.on('load', async () => {
      try {
        const resp = await fetch(GEOJSON_URL, { cache: 'no-store' });
        if (!resp.ok) throw new Error(`Failed to fetch ${GEOJSON_URL}: ${resp.status} ${resp.statusText}`);
        const data = await resp.json();
  
        // Add as a GeoJSON source
        map.addSource('supe', {
          type: 'geojson',
          data,
          // If polygons are complex, promoteId helps with future interactivity
          promoteId: 'RP1PRCLID'
        });
  
        // Fill layer (soft teal)
        map.addLayer({
          id: 'supe-fill',
          type: 'fill',
          source: 'supe',
          paint: {
            'fill-color': '#0dd6c7',
            'fill-opacity': 0.35
          },
          filter: ['==', ['geometry-type'], 'Polygon'] // works for MultiPolygon as well
        });
  
        // Outline layer
        map.addLayer({
          id: 'supe-line',
          type: 'line',
          source: 'supe',
          paint: {
            'line-color': '#066a62',
            'line-width': 1.25
          }
        });
  
        // 5) Fit map to the data bounds
        const bounds = computeGeoJSONBounds(data);
        if (bounds) {
          map.fitBounds(bounds, { padding: 24, duration: 0 });
        }
      } catch (err) {
        // Basic error surface
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
      }
    });
  
    // --- Utility: compute bounds for any GeoJSON geometry (Point/Line/Polygon/Multi*) ---
    function computeGeoJSONBounds(geojson) {
      let bounds = null;
  
      function extendBounds(lng, lat) {
        if (!isFinite(lng) || !isFinite(lat)) return;
        if (!bounds) {
          bounds = new mapboxgl.LngLatBounds([lng, lat], [lng, lat]);
        } else {
          bounds.extend([lng, lat]);
        }
      }
  
      function walkCoords(coords) {
        // coords can be deeply nested (e.g., MultiPolygon -> array of polygon rings -> array of [lng,lat(,alt)])
        if (!coords) return;
        if (typeof coords[0] === 'number') {
          // Single coordinate [lng, lat, (alt?)]
          extendBounds(coords[0], coords[1]);
        } else {
          for (const c of coords) walkCoords(c);
        }
      }
  
      function handleGeometry(geom) {
        if (!geom) return;
        if (geom.type === 'GeometryCollection') {
          (geom.geometries || []).forEach(handleGeometry);
          return;
        }
        walkCoords(geom.coordinates);
      }
  
      if (geojson.type === 'FeatureCollection') {
        for (const f of geojson.features || []) handleGeometry(f.geometry);
      } else if (geojson.type === 'Feature') {
        handleGeometry(geojson.geometry);
      } else {
        handleGeometry(geojson); // bare Geometry
      }
  
      return bounds;
    }
  })();
  