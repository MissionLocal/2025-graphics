document.addEventListener('DOMContentLoaded', function () {
    var pymChild = new pym.Child();
    mapboxgl.accessToken = "pk.eyJ1IjoibWxub3ciLCJhIjoiY2t0dnZwcm1mMmR5YzMycDNrcDZtemRybyJ9.Br-G0LTOB3M6w83Az4XGtQ";

    const mapZoom = window.innerWidth < 400 ? 10.4 : 11.1;
    const mapY = window.innerWidth < 400 ? 37.771 : 37.77;

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mlnow/cm2tndow500co01pw3fho5d21',
        zoom: mapZoom,
        center: [-122.429, mapY],        
        minZoom: 10.4
    });

    const scenarios = {
        "1": "./data/scenario_1.geojson",
        "2": "./data/scenario_2.geojson",
        "3": "./data/scenario_3.geojson"
    };

    map.on('load', () => {
        loadScenario("1");
    });

    function loadScenario(scenario) {
        const geojsonUrl = scenarios[scenario];

        if (map.getSource('routes')) {
            map.removeLayer('routeLayer');
            map.removeLayer('routeHighlight');
            map.removeLayer('routeClickArea'); // Remove expanded click area
            map.removeSource('routes');
        }

        map.addSource('routes', {
            type: 'geojson',
            data: geojsonUrl
        });

        // Visible route layer
        map.addLayer({
            id: 'routeLayer',
            type: 'line',
            source: 'routes',
            paint: {
                'line-width': 2,
                'line-color': [
                    'match',
                    ['get', 'status'],
                    'suspended', '#f67cf6',
                    'reduced', '#efbe25',
                    'extended', '#8ad6ce',
                    '#ccc'
                ],
                'line-dasharray': [
                    'case',
                    ['==', ['get', 'status'], 'extended'], [2, 2],
                    ['literal', [1, 0]]
                ]
            }
        });

        // Invisible click area layer (wider but transparent)
        map.addLayer({
            id: 'routeClickArea',
            type: 'line',
            source: 'routes',
            paint: {
                'line-width': 10, // Expands clickable area
                'line-opacity': 0 // Fully transparent
            }
        });

        // Highlight layer
        map.addLayer({
            id: 'routeHighlight',
            type: 'line',
            source: 'routes',
            paint: {
                'line-width': 4,
                'line-color': [
                    'match',
                    ['get', 'status'],
                    'suspended', '#f67cf6',
                    'reduced', '#efbe25',
                    'extended', '#8ad6ce',
                    '#ccc'
                ],
                'line-opacity': 0
            },
            filter: ['==', ['get', 'route_name'], '']
        });

        // Remove previous event listeners
        map.off('click', 'routeClickArea', showPopup);
        map.off('mouseenter', 'routeClickArea', highlightRoute);
        map.off('mouseleave', 'routeClickArea', resetRoute);

        // Attach events to the expanded click area
        map.on('click', 'routeClickArea', showPopup);
        map.on('mouseenter', 'routeClickArea', highlightRoute);
        map.on('mouseleave', 'routeClickArea', resetRoute);
    }

    function showPopup(event) {
        const features = event.features;
        if (!features.length) return;

        let routeInfo = features.map(f => {
            return `<div class="popup-text">
            <strong> ${f.properties.route_name} ${f.properties.full_name}</strong><br>
            <strong>Status:</strong> ${f.properties.note}
        </div>`;
        }).join("<hr>");

        new mapboxgl.Popup()
            .setLngLat(event.lngLat)
            .setHTML(routeInfo)
            .addTo(map);
    }

    function highlightRoute(event) {
        const feature = event.features[0];
        const routeName = feature.properties.route_name;

        map.setFilter('routeHighlight', ['==', ['get', 'route_name'], routeName]);
        map.setPaintProperty('routeHighlight', 'line-opacity', 1);
        map.getCanvas().style.cursor = 'pointer';
    }

    function resetRoute() {
        map.setFilter('routeHighlight', ['==', ['get', 'route_name'], '']);
        map.setPaintProperty('routeHighlight', 'line-opacity', 0);
        map.getCanvas().style.cursor = '';
    }

    document.getElementById('propositionDropdown').addEventListener('change', (event) => {
        loadScenario(event.target.value);
    });

    function addLegend() {
        const legend = document.getElementById('legend');
        legend.innerHTML = ''; // Clear previous content
    
        const legendItems = [
            { color: '#f67cf6', label: 'Suspended' },
            { color: '#efbe25', label: 'Reduced' },
            { color: '#8ad6ce', label: 'Extended' }
        ];
    
        legendItems.forEach(item => {
            const legendElement = document.createElement('div');
            legendElement.classList.add('legend-item');
            legendElement.innerHTML = `
                <span class="legend-color" style="background:${item.color};"></span>
                ${item.label}
            `;
            legend.appendChild(legendElement);
        });
    }
    
    // Call the function after the map loads
    map.on('load', addLegend);
    
});
