// map.js — Bayview neighborhood + political district outlines
document.addEventListener('DOMContentLoaded', async () => {
    const pymChild = new pym.Child();
    mapboxgl.accessToken = "pk.eyJ1IjoibWxub3ciLCJhIjoiY21kNmw1aTAyMDFkbTJqb3Z2dTN0YzRjMyJ9.4abRTnHdhMI-RE48dHNtYw";

    // DOM
    const infoBox = document.getElementById('info-box');

    // Hide info box on load (kept for styling consistency, but unused)
    if (infoBox) infoBox.style.display = 'none';

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mlnow/cmis0bnr0000401sr9iyb6i1a',
        center: [-122.431297, 37.773972], // San Francisco center
        // center: [-122.3930439, 37.737747], // Bayview-ish center37.763335,-122.4460469
        zoom: 10,
        maxBounds: [
            [-122.60, 37.68],   // southwest corner
            [-122.28, 37.88]    // northeast corner
          ]          
    });

    if (window.innerWidth < 768) {
        map.setZoom(10);  // adjust to taste (11.5, 11.7, etc.)
    }

    // Load GeoJSONs
    const bayviewUrl = 'bayview.geojson';
    const districtUrl = 'district.geojson';

    const [bayviewGJ, districtGJ] = await Promise.all([
        fetch(bayviewUrl).then(r => r.json()),
        fetch(districtUrl).then(r => r.json())
    ]);

    map.on('load', () => {
        // Bayview outline
        map.addSource('bayview', {
            type: 'geojson',
            data: bayviewGJ
        });

        // Light fill to echo your accent color
        map.addLayer({
            id: 'bayview-fill',
            type: 'fill',
            source: 'bayview',
            paint: {
                'fill-color': '#efbe25',
                'fill-opacity': 0.12
            }
        });

        // Solid outline
        map.addLayer({
            id: 'bayview-outline',
            type: 'line',
            source: 'bayview',
            paint: {
                'line-color': '#efbe25',
                'line-width': 1.5
            }
        });

        // Political district outline
        map.addSource('district', {
            type: 'geojson',
            data: districtGJ
        });

        map.addLayer({
            id: 'district-outline',
            type: 'line',
            source: 'district',
            paint: {
                'line-color': '#efbe25',
                'line-width': 1.5,
                'line-dasharray': [3, 2]
            }
        });

        // ---- Interactions: click Bayview → open link ----
        const bayviewUrlOut = 'https://missionlocal.org/'; // <-- change this to your story URL

        map.on('mouseenter', 'bayview-fill', () => {
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'bayview-fill', () => {
            map.getCanvas().style.cursor = '';
        });

        map.on('click', 'bayview-fill', () => {
            window.open(bayviewUrlOut, '_blank');
        });

        // Keep labels on top
        try {
            if (map.getLayer('road-label-navigation'))
                map.moveLayer('road-label-navigation');

            if (map.getLayer('settlement-subdivision-label'))
                map.moveLayer('settlement-subdivision-label');
        } catch (e) { }
    });

    window.addEventListener('resize', () => {
        map.resize();
        pymChild.sendHeight();
    });
});
