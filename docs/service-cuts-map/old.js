document.addEventListener('DOMContentLoaded', function () {
    // Initialize the Pym.js child
    var pymChild = new pym.Child();
    // Define access token
    mapboxgl.accessToken = "pk.eyJ1IjoibWxub3ciLCJhIjoiY2t0dnZwcm1mMmR5YzMycDNrcDZtemRybyJ9.Br-G0LTOB3M6w83Az4XGtQ";

    // Define basemap settings
    let mapZoom = window.innerWidth < 400 ? 12.48 : 12.48;
    let mapY = window.innerWidth < 400 ? 37.781 : 37.781;

    // Initialize the map
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mlnow/cm2tndow500co01pw3fho5d21',
        zoom: mapZoom,
        center: [-122.481, mapY],
        minZoom: 10.4
    });

    let currentPopup; // Variable to hold the current popup reference
    let currentDistrict = 'Scenario 1'; // Set this based on user selection

    // Map load event
    map.on('load', () => {
        // Load initial district data
        map.addSource('precincts', {
            'type': 'geojson',
            'data': "data/1.geojson"
        });

        map.addLayer({
            'id': 'precincts-layer',
            'type': 'fill',
            'source': 'precincts',
            'paint': {
                'fill-color': [
                    'match',
                    ['get', 'winner'],

                    // District 1
                    'sherman_d\'silva', '#efbe25',
                    'jen_nossokoff', '#57a4ea',
                    'jeremiah_boehner', '#46c134',
                    'connie_chan', '#ed43e5',
                    'marjan_philhour', '#65ead0',

                    // District 3
                    'moe_jamil', '#d896ff',
                    'eduard_navarro', '#efbe25',
                    'sharon_lai', '#ed43e5',
                    'wendy_ha_chau', '#57a4ea',
                    'matthew_susk', '#46c134',
                    'danny_sauter', '#65ead0',

                    // District 5
                    'dean_preston', '#d896ff',
                    'scotty_jacobs', '#efbe25',
                    'allen_jones', '#57a4ea',
                    'autumn_hope_looijen', '#ed43e5',
                    'bilal_mahmood', '#46c134',r

                    // Default color for unmatched names
                    '#CECECE'
                ],
                'fill-opacity': 0.6
            }
        });

        // Add a base outline for the precincts
        map.addLayer({
            'id': 'precincts-outline',
            'type': 'line',
            'source': 'precincts',
            'paint': {
                'line-color': '#ffffff',
                'line-width': 0.5
            }
        });

        // Add hover outline layer for highlighted polygons
        map.addLayer({
            'id': 'precincts-hover-outline',
            'type': 'line',
            'source': 'precincts',
            'paint': {
                'line-color': '#ffffff',
                'line-width': 2.5
            },
            'filter': ['==', ['get', 'precinct'], '']
        });

        // Hover event listeners
        map.on('mousemove', 'precincts-layer', (e) => {
            if (e.features.length > 0) {
                map.getCanvas().style.cursor = 'pointer';
                const featurePrecinct = e.features[0].properties.precinct;
                map.setFilter('precincts-hover-outline', ['==', ['get', 'precinct'], featurePrecinct]);
            }
        });

        map.on('mouseleave', 'precincts-layer', () => {
            map.getCanvas().style.cursor = '';
            map.setFilter('precincts-hover-outline', ['==', ['get', 'precinct'], '']);
        });

        // Dropdown for updating districts
        document.getElementById('propositionDropdown').addEventListener('change', (event) => {
            const selectedProp = event.target.value;
            currentDistrict = `District ${selectedProp}`; // Update current district

            // Map data URL based on selection
            const dataUrl = `data/${selectedProp}.geojson`;

            // Remove any existing popups
            if (currentPopup) {
                currentPopup.remove();
                currentPopup = null;
            }

            // Update the precinct data based on selected district
            map.getSource('precincts').setData(dataUrl);

            // Define center and zoom levels for each district
            let center, zoom;
            switch (selectedProp) {
                case '1':
                    center = [-122.481, 37.781];  // Coordinates for District 1
                    zoom = 12.48;
                    break;
                case '3':
                    center = [-122.408, 37.798];  // Coordinates for District 3
                    zoom = 13.06;
                    break;
                case '5':
                    center = [-122.434, 37.778];  // Coordinates for District 5
                    zoom = 12.8;
                    break;
                case '7':
                    center = [-122.472, 37.740];  // Coordinates for District 7
                    zoom = 12;
                    break;
                case '9':
                    center = [-122.414, 37.744];  // Coordinates for District 9
                    zoom = 12.25;
                    break;
                case '11':
                    center = [-122.444, 37.722];  // Coordinates for District 11
                    zoom = 12.5;
                    break;
                default:
                    center = [-122.429, 37.77];   // Default coordinates
                    zoom = 10.5;
                    break;
            }

            // Update the map's center and zoom
            map.flyTo({
                center: center,
                zoom: zoom,
                essential: true // This ensures the transition is smooth
            });

            // Hide all legends
            document.querySelectorAll('.legend').forEach(legend => {
                legend.style.display = 'none';
            });

            // Show the selected legend
            const selectedLegend = document.getElementById(`legend-district${selectedProp}`);
            if (selectedLegend) {
                selectedLegend.style.display = 'block';
            }

            pymChild.sendHeight();

        });

        map.on('click', 'precincts-layer', function (e) {
            if (e.features.length > 0) {
                const properties = e.features[0].properties;
                console.log(e);

                // Initialize the content with basic precinct information
                let content = `
                    <div style="background-color: white; padding: 5px; border-radius: 2.5px; font-size: 12px; line-height: 1.2;">
                        <h3 class="popup-header" style="margin: 2px 0; font-size: 16px;">Precinct ${properties.precinct || 'N/A'}</h3>
                        <hr style="margin: 5px 0;">
                `;

                if (currentDistrict === 'District 1') {
                    const candidates = [
                        {
                            name: "Sherman D'Silva",
                            percent: properties['sherman_d\'silva_p'],
                            votes: properties['sherman_d\'silva'],
                            key: 'sherman_d\'silva'
                        },
                        {
                            name: "Marjan Philhour",
                            percent: properties['marjan_philhour_p'],
                            votes: properties['marjan_philhour'],
                            key: 'marjan_philhour'
                        },
                        {
                            name: "Connie Chan",
                            percent: properties['connie_chan_p'],
                            votes: properties['connie_chan'],
                            key: 'connie_chan'
                        },
                        {
                            name: "Jeremiah Boehner",
                            percent: properties['jeremiah_boehner_p'],
                            votes: properties['jeremiah_boehner'],
                            key: 'jeremiah_boehner'
                        },
                        {
                            name: "Jen Nossokoff",
                            percent: properties['jen_nossokoff_p'],
                            votes: properties['jen_nossokoff'],
                            key: 'jen_nossokoff'
                        }
                    ];

                    const winner = candidates.reduce((max, candidate) => (candidate.votes > max.votes ? candidate : max), candidates[0]);

                    candidates.forEach(candidate => {
                        content += `
                            <p class="popup-text" style="margin: 2px 0;">
                                ${winner.key === candidate.key ? `<strong>${candidate.name}</strong>` : candidate.name}:
                                ${winner.key === candidate.key ? `<strong>${candidate.percent}%</strong>` : candidate.percent + '%'}
                                (${winner.key === candidate.key ? `<strong>${candidate.votes}</strong>` : candidate.votes})
                            </p>
                        `;
                    });

                } else if (currentDistrict === 'District 3') {
                    const candidates = [
                        {
                            name: "Sharon Lai",
                            percent: properties['sharon_lai_p'],
                            votes: properties['sharon_lai'],
                            key: 'sharon_lai'
                        },
                        {
                            name: "Moe Jamil",
                            percent: properties['moe_jamil_p'],
                            votes: properties['moe_jamil'],
                            key: 'moe_jamil'
                        },
                        {
                            name: "Wendy Ha Chau",
                            percent: properties['wendy_ha_chau_p'],
                            votes: properties['wendy_ha_chau'],
                            key: 'wendy_ha_chau'
                        },
                        {
                            name: "Eduard Navarro",
                            percent: properties['eduard_navarro_p'],
                            votes: properties['eduard_navarro'],
                            key: 'eduard_navarro'
                        },
                        {
                            name: "Danny Sauter",
                            percent: properties['danny_sauter_p'],
                            votes: properties['danny_sauter'],
                            key: 'danny_sauter'
                        },
                        {
                            name: "Matthew Susk",
                            percent: properties['matthew_susk_p'],
                            votes: properties['matthew_susk'],
                            key: 'matthew_susk'
                        }
                    ];

                    const winner = candidates.reduce((max, candidate) => (candidate.votes > max.votes ? candidate : max), candidates[0]);

                    candidates.forEach(candidate => {
                        content += `
                            <p class="popup-text" style="margin: 2px 0;">
                                ${winner.key === candidate.key ? `<strong>${candidate.name}</strong>` : candidate.name}:
                                ${winner.key === candidate.key ? `<strong>${candidate.percent}%</strong>` : candidate.percent + '%'}
                                (${winner.key === candidate.key ? `<strong>${candidate.votes}</strong>` : candidate.votes})
                            </p>
                        `;
                    });
                } else if (currentDistrict === 'District 5') {
                    const candidates = [
                        {
                            name: "Autumn Hope Looijen",
                            percent: properties['autumn_hope_looijen_p'],
                            votes: properties['autumn_hope_looijen'],
                            key: 'autumn_hope_looijen'
                        },
                        {
                            name: "Bilal Mahmood",
                            percent: properties['bilal_mahmood_p'],
                            votes: properties['bilal_mahmood'],
                            key: 'bilal_mahmood'
                        },
                        {
                            name: "Scotty Jacobs",
                            percent: properties['scotty_jacobs_p'],
                            votes: properties['scotty_jacobs'],
                            key: 'scotty_jacobs'
                        },
                        {
                            name: "Allen Jones",
                            percent: properties['allen_jones_p'],
                            votes: properties['allen_jones'],
                            key: 'allen_jones'
                        },
                        {
                            name: "Dean Preston",
                            percent: properties['dean_preston_p'],
                            votes: properties['dean_preston'],
                            key: 'dean_preston'
                        }
                    ];

                    const winner = candidates.reduce((max, candidate) => (candidate.votes > max.votes ? candidate : max), candidates[0]);

                    candidates.forEach(candidate => {
                        content += `
                            <p class="popup-text" style="margin: 2px 0;">
                                ${winner.key === candidate.key ? `<strong>${candidate.name}</strong>` : candidate.name}:
                                ${winner.key === candidate.key ? `<strong>${candidate.percent}%</strong>` : candidate.percent + '%'}
                                (${winner.key === candidate.key ? `<strong>${candidate.votes}</strong>` : candidate.votes})
                            </p>
                        `;
                    });
                } else if (currentDistrict === 'District 7') {
                    const candidates = [
                        {
                            name: "Myrna Melgar",
                            percent: properties['myrna_melgar_p'],
                            votes: properties['myrna_melgar'],
                            key: 'myrna_melgar'
                        },
                        {
                            name: "Stephen Martin-Pinto",
                            percent: properties['stephen_martin-pinto_p'],
                            votes: properties['stephen_martin-pinto'],
                            key: 'stephen_martin-pinto'
                        },
                        {
                            name: "Edward S. Yee",
                            percent: properties['edward_s_yee_p'],
                            votes: properties['edward_s_yee'],
                            key: 'edward_s_yee'
                        },
                        {
                            name: "Matt Boschetto",
                            percent: properties['matt_boschetto_p'],
                            votes: properties['matt_boschetto'],
                            key: 'matt_boschetto'
                        }
                    ];

                    const winner = candidates.reduce((max, candidate) => (candidate.votes > max.votes ? candidate : max), candidates[0]);

                    candidates.forEach(candidate => {
                        content += `
                            <p class="popup-text" style="margin: 2px 0;">
                                ${winner.key === candidate.key ? `<strong>${candidate.name}</strong>` : candidate.name}:
                                ${winner.key === candidate.key ? `<strong>${candidate.percent}%</strong>` : candidate.percent + '%'}
                                (${winner.key === candidate.key ? `<strong>${candidate.votes}</strong>` : candidate.votes})
                            </p>
                        `;
                    });
                } else if (currentDistrict === 'District 9') {
                    const candidates = [
                        {
                            name: "Jackie Fielder",
                            percent: properties['jackie_fielder_p'],
                            votes: properties['jackie_fielder'],
                            key: 'jackie_fielder'
                        },
                        {
                            name: "Stephen Jon Torres",
                            percent: properties['stephen_jon_torres_p'],
                            votes: properties['stephen_jon_torres'],
                            key: 'stephen_jon_torres'
                        },
                        {
                            name: "Roberto Hernandez",
                            percent: properties['roberto_hernandez_p'],
                            votes: properties['roberto_hernandez'],
                            key: 'roberto_hernandez'
                        },
                        {
                            name: "Jaime Gutierrez",
                            percent: properties['jaime_gutierrez_p'],
                            votes: properties['jaime_gutierrez'],
                            key: 'jaime_gutierrez'
                        },
                        {
                            name: "Trevor Chandler",
                            percent: properties['trevor_chandler_p'],
                            votes: properties['trevor_chandler'],
                            key: 'trevor_chandler'
                        },
                        {
                            name: "Julian Bermudez",
                            percent: properties['julian_bermudez_p'],
                            votes: properties['julian_bermudez'],
                            key: 'julian_bermudez'
                        },
                        {
                            name: "H. Brown",
                            percent: properties['h_brown_p'],
                            votes: properties['h_brown'],
                            key: 'h_brown'
                        }
                    ];

                    const winner = candidates.reduce((max, candidate) => (candidate.votes > max.votes ? candidate : max), candidates[0]);

                    candidates.forEach(candidate => {
                        content += `
                            <p class="popup-text" style="margin: 2px 0;">
                                ${winner.key === candidate.key ? `<strong>${candidate.name}</strong>` : candidate.name}:
                                ${winner.key === candidate.key ? `<strong>${candidate.percent}%</strong>` : candidate.percent + '%'}
                                (${winner.key === candidate.key ? `<strong>${candidate.votes}</strong>` : candidate.votes})
                            </p>
                        `;
                    });
                } else if (currentDistrict === 'District 11') {
                    const candidates = [
                        {
                            name: "Oscar Flores",
                            percent: properties['oscar_flores_p'],
                            votes: properties['oscar_flores'],
                            key: 'oscar_flores'
                        },
                        {
                            name: "Michael Lai",
                            percent: properties['michael_lai_p'],
                            votes: properties['michael_lai'],
                            key: 'michael_lai'
                        },
                        {
                            name: "Roger K. Marenco",
                            percent: properties['roger_k_marenco_p'],
                            votes: properties['roger_k_marenco'],
                            key: 'roger_k_marenco'
                        },
                        {
                            name: "Jose Morales",
                            percent: properties['jose_morales_p'],
                            votes: properties['jose_morales'],
                            key: 'jose_morales'
                        },
                        {
                            name: "Ernest E.J. Jones",
                            percent: properties['ernest_ej_jones_p'],
                            votes: properties['ernest_ej_jones'],
                            key: 'ernest_ej_jones'
                        },
                        {
                            name: "Adlah Chisti",
                            percent: properties['adlah_chisti_p'],
                            votes: properties['adlah_chisti'],
                            key: 'adlah_chisti'
                        },
                        {
                            name: "Chyanne Chen",
                            percent: properties['chyanne_chen_p'],
                            votes: properties['chyanne_chen'],
                            key: 'chyanne_chen'
                        }
                    ];

                    const winner = candidates.reduce((max, candidate) => (candidate.votes > max.votes ? candidate : max), candidates[0]);

                    candidates.forEach(candidate => {
                        content += `
                            <p class="popup-text" style="margin: 2px 0;">
                                ${winner.key === candidate.key ? `<strong>${candidate.name}</strong>` : candidate.name}:
                                ${winner.key === candidate.key ? `<strong>${candidate.percent}%</strong>` : candidate.percent + '%'}
                                (${winner.key === candidate.key ? `<strong>${candidate.votes}</strong>` : candidate.votes})
                            </p>
                        `;
                    });
                }

                // Close the current popup if it exists
                if (currentPopup) {
                    currentPopup.remove();
                }

                // Create and add the new popup
                currentPopup = new mapboxgl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(content)
                    .addTo(map);
            } else {
                console.warn("No features found at clicked location.");
            }
        });


        // Resize the map when the window is resized

        window.addEventListener('resize', () => {
            map.resize();
        });




        // Send the map data to Pym.js for responsive design
        pymChild.sendHeight();
    });

    map.on('load', function () {
        map.moveLayer('road-label-navigation');
        map.moveLayer('settlement-subdivision-label');
    });
});
