// map.js — Bayview neighborhood + political district outlines
document.addEventListener('DOMContentLoaded', async () => {
    const pymChild = new pym.Child();
    mapboxgl.accessToken = "pk.eyJ1IjoibWxub3ciLCJhIjoiY21mZDE2anltMDRkbDJtcHM1Y2M0eTFjNCJ9.nmMGLA-zX7BqznSJ2po65g";

    // DOM
    const infoBox = document.getElementById('info-box');

    // Hide info box on load (kept for styling consistency, but unused)
    if (infoBox) infoBox.style.display = 'none';

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mlnow/cm2tndow500co01pw3fho5d21',
        center: [-122.3930439, 37.737747], // Bayview-ish center
        zoom: 12
    });

    if (window.innerWidth < 768) {
        map.setZoom(11.8);  // adjust to taste (11.5, 11.7, etc.)
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
                'fill-color': '#f36e57',
                'fill-opacity': 0.12
            }
        });

        // Solid outline
        map.addLayer({
            id: 'bayview-outline',
            type: 'line',
            source: 'bayview',
            paint: {
                'line-color': '#f36e57',
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
                'line-color': '#f36e57',
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
