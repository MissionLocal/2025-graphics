// load in data from geojson files
function fetchJSON(url) {
    return fetch(url)
      .then(function(response) {
        return response.json();
      });
}

// Fetch both geojson files before initializing the map
Promise.all([
    fetchJSON('mission.geojson'),
    fetchJSON('mission-plan.geojson'),
    fetchJSON('plazas.geojson'),
    fetchJSON('markets.geojson')
])
.then(function([missionData, missionPlanData, plazasData, marketsData]) {
    var config = {
        style: 'mapbox://styles/mapbox/dark-v11',
        accessToken: 'pk.eyJ1IjoibWxub3ciLCJhIjoiY2t0dnZwcm1mMmR5YzMycDNrcDZtemRybyJ9.Br-G0LTOB3M6w83Az4XGtQ',
        showMarkers: false,
        theme: 'dark',
        alignment: 'left',
        chapters: [
            {
                id: 'slide-00',
                title: 'March 2022 to April 2022',
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2022/04/24thStreetBART.jpg",
                description:
                    '<p>San Francisco has never had a citywide regulatory framework governing street vending — <a href="https://sfmayor.org/article/board-supervisors-approves-mayor-breed%E2%80%99s-street-vending-legislation">so then Supervisor Hillary Ronen works to develop one.</a></p>'
                    +'<p>In March 2022, Ronen launches a <span class="yellow-highlight">"Mission Plan"</span> that envisions a system of permitted vendors. Other vendors will have their goods confiscated or be asked to leave the plazas.</p>'
                    +'<p>"I don\'t want to create chaos in the streets and an unlawful feeling for everyone," Ronen said. "I thought, as long as Public Works can take their stuff and confiscate it, that\'ll be enough and they\'ll leave because they can\'t sell their stuff here."</p>'
                    +'<p>This photo was taken on April 25, 2022 — less than two months after Ronen launched the plan. *</p>',
                location: {
                    center: [-122.4328161350563, 37.76124032733743],
                    zoom: 13.5,
                    bearing: 0,
                    pitch: 0,
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: false,
                showMarkets: false
            },
            {
                id: 'slide-01',
                title: 'July 20, 2022 to Aug. 21, 2022',
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2022/07/My-project-3-4-e1658345342468.png",
                description:
                    '<p>The new permitting system for street vending — approved in March — is not yet in place.</p>'
                    +'<p>In the meantime, the city tries to control vending by fencing off the <span class="red-highlight">24th Street plaza</span>.</p>'
                    +'<p>Calle 24 Latino Cultural District, a nonprofit working with Ronen and BART, told legal vendors that they would help them find new locations.</p>'
                    +'<p>This news did not go over well. “I\'m a single mom,” one jewelry seller told Mission Local. “I\'ve been here for eight years. I don\'t want to have to start over.”</p>',
                location: {
                    center: [-122.4328161350563, 37.76124032733743],
                    zoom: 13.5,
                    bearing: 0,
                    pitch: 0,
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: true,
                showMarkets: false
            },
            {
                id: 'slide-02',
                title: 'Late July, 2022',
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2022/07/5p.m.24th.jpg",
                description:
                    '<p>The fences keep the <span class="red-highlight">24th street plazas</span> clear, but vendors set up in front of the fences, crowding out pedestrians on Mission street.</p>'
                    +'<p>Any rider getting off the bus faces a corridor of hawkers selling everything from beauty products to roach killer.</p>',
                location: {
                    center: [-122.42000941874, 37.752299761830855],
                    zoom: 16.9,
                    bearing: 0,
                    pitch: 0,
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: true,
                showMarkets: false
            },
            {
                id: 'slide-03',
                title: 'August 2022',
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2022/09/IMG_0162-800x600-1.jpg",
                description:
                    '<p>In August, a group takes the fences down at night. A Bart spokesperson attributes it to a group <a href="https://missionlocal.org/2022/08/its-like-youre-in-jail-activists-ecstatic-after-24th-street-bart-plaza-fences-pulled-down/">calling themselves Mission DeFENCE</a>.</p>'
                    +'<p>DPW finishes the permitting system and announces <a href="https://sf.gov/apply-street-vending-permit?nid=5607">that by Sept. 12</a>,  all vendors need to obtain a $430 permit. Fees are waived in most cases.</p>',
                location: {
                    center: [-122.42000941874, 37.752299761830855],
                    zoom: 16.9,
                    bearing: 0,
                    pitch: 0,
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: true,
                showMarkets: false
            },
            {
                id: 'slide-04',
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2022/08/IMG_0165.jpg",
                description:
                    '<p>No matter the permits, unpermitted vendors continue to work at the plazas.</p>',
                location: {
                    center: [-122.42000941874, 37.752299761830855],
                    zoom: 16.9,
                    bearing: 0,
                    pitch: 0,
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: true,
                showMarkets: false
            },
            {
                id: 'slide-05',
                title: "Aug. 28, 2022 — The first fatality",
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2022/07/5p.m.24th.jpg",
                description:
                    '<p>A young BART passenger discovers 28-year-old Jabaree Harris bleeding from stab wounds and lying face down near the SFO/Millbrae platform.</p>'
                    +'<p><a href="https://missionlocal.org/2022/08/stab-victim-found-at-24th-street-bart-station-closed/">A witness tells Mission Local</a> that Harris, who peddled shoes and clothes among other vendors at the 24th street plaza, was stabbed a few minutes earlier by another man during an argument over $50.</p>'
                    +'<p>Police <a href="https://missionlocal.org/2022/09/suspect-in-24th-bart-plaza-stabbing-arrested/">arrest his suspected killer</a> a week later.</p>',
                location: {
                    center: [-122.42000941874, 37.752299761830855],
                    zoom: 16.9,
                    bearing: 0,
                    pitch: 0,
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: true,
                showMarkets: false
            },
            {
                id: 'slide-06',
                title: "September 2022",
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2022/09/My-project.jpg",
                description:
                    '<p><span class="bold-text">Permits have been issued and enforcement begins.</span> Enforcement follows specific guidelines: DPW Staffers first ask for permits. Those selling goods without a permit are told how they can get one and given an opportunity to pack up and leave.</p>'
                    +'<p>If they do not, DPW may issue a Notice of Violation, and confiscate what they\'re selling.</p>'
                    +'<p>Police are expected to be on hand, but only to protect DPW and other people present if a criminal act occurs.</p>'
                    +'<p>Unpermitted vending continues, <a href="https://missionlocal.org/2022/09/day-one-of-enforcing-permits-at-the-24th-street-plaza-proves-easier-than-expected/">but vendors disperse once Department of Public Works staffers arrive</a>.</p>',
                location: {
                    center: [-122.4328161350563, 37.76124032733743],
                    zoom: 13.5,
                    bearing: 0,
                    pitch: 0,
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: true,
                showMarkets: false
            },
            {
                id: 'slide-07',
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2022/09/BARTPlaza.jpg",
                description:
                    '<p><span class="bold-text">Sixty-one</span> permits are approved. As long as officers are at the plaza, most of the unpermitted vendors stay away.</p>',
                location: {
                    center: [-122.4328161350563, 37.76124032733743],
                    zoom: 13.5,
                    bearing: 0,
                    pitch: 0,
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: true,
                showMarkets: false
            },
            {
                id: 'slide-08',
                title: "Dec. 18, 2022 — The second fatality",
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2022/12/24thBARTPlazaNW.jpg",
                description:
                    '<p>At 4 p.m., a shooting at the <span class="red-highlight">24th street BART plaza</span> <a href="https://missionlocal.org/2022/12/one-dead-sf-bart-plaza-shooting/">leaves one person dead, two suspects at large</a>.</p>',
                location: {
                    center: [-122.4328161350563, 37.76124032733743],
                    zoom: 13.5,
                    bearing: 0,
                    pitch: 0,
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: true,
                showMarkets: false
            },
            {
                id: 'slide-09',
                title: "February 2023",
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/Screenshot-2025-02-24-at-12.30.34 PM.png",
                description:
                    '<p><a href="https://missionlocal.org/2023/02/street-vending-the-future-of-24th-and-mission-bart-community-meeting/">At a community meeting</a> focused on how to improve the BART plazas it\'s clear the permit system is not working.</p>'
                    +'<p>“Public Works hides, cops don\'t get out of their cars,” said William Ortiz-Cartagena, founder and treasurer of CLECHA, a nonprofit that supports Latinx entrepreneurs. The plazas continue to be overrun by vendors selling out of backpacks and suitcases.</p>'
                    +'<p>Some say the only solution is to redirect the Mission\'s 112 permitted vendors away from the plaza — maybe to a brick-and-mortar space. Others suggest allowing only crafts and artisan products to be sold. Everyone agrees the plazas need more supervision and cleaning.</p>',
                location: {
                    center: [-122.42000941874, 37.752299761830855],
                    zoom: 16.9,
                    bearing: 0,
                    pitch: 0,
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: true,
                showMarkets: false
            },
            {
                id: 'slide-10',
                title: "June 27, 2023 - Public Works wants police to take over enforcement",
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2022/09/My-project.jpg",
                description:
                    '<p>Department of Public Works employees say they want police to take over street vending enforcement.  One worker at a Mission District police station meeting says, “they\'re already threatening our families, threatening to kill us.”</p>'
                    +'<p>“We\'ve had inspectors being punched before, cans thrown at us, you name it,” adds another.</p>'
                    +'<p>Switching enforcement to the police isn\'t possible — California SB 946 decriminalized vending.</p>'
                    +'<p>Mission Street remains packed, and most of the vendors appear to be operating without a permit.</p>',
                location: {
                    center: [-122.4328161350563, 37.76124032733743],
                    zoom: 13.5,
                    bearing: 0,
                    pitch: 0,
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: true,
                showMarkets: false
            },
            {
                id: 'slide-11',
                title: "July 23, 2023 - Third fatality",
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2023/07/China-Express-24th-and-Mission-corner-July-23-by-Griffin.jpg",
                description:
                    '<p>In July, 42-year-old Valentin Hernandez Santillan, who regularly hangs out at the 24th Street plaza, is stabbed to death nearby early one morning.</p>',
                location: {
                    center: [-122.4328161350563, 37.76124032733743],
                    zoom: 13.5,
                    bearing: 0,
                    pitch: 0,
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: true,
                showMarkets: false
            },
            {
                id: 'slide-12',
                title: "September 2023 - 16th Street Plaza",
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2023/09/16th-bart-plaza-barricades-police-1200x900.jpg",
                description:
                    '<p>The <a href="https://missionlocal.org/2023/09/new-barricades-erected-at-16th-st-bart-plaza-to-deter-vendors/"><span class="red-highlight">16th Street BART plaza</span> is fenced off</a> at the request of SFPD. The goal is to keep the plaza clear for pedestrians, but vendors simply set up their wares in front of the barricades or on the pavement, further reducing walking space.</p>'
                    +'<p>Pinky, a vendor with bright pink hair and a can of pepper spray hanging on her neck, tells Mission Local that the new fencing is just an annoyance. “It\'s not stopping anybody doing anything; it just makes our lives more difficult.”</p>'
                    +'<p>She used to vend at Sixth and Market streets, she says, before coming to the 16th Street BART Plaza four years ago.</p>',
                location: {
                    center: [-122.42292960530838, 37.76487577816566],
                    zoom: 16.7,
                    bearing: 0,
                    pitch: 0,
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: true,
                showMarkets: false
            },
            {
                id: 'slide-13',
                title: "October 2023",
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2023/10/vendorBanner.png",
                description:
                    '<p>Supervisor Hilary Ronen announces <a href="https://missionlocal.org/2023/10/ronen-ban-mission-17th-street-vending-vendors-lease-clecha/">a 90-day ban</a> of all street vending on Mission between Cesar Chavez to 14th streets.</p>'
                    +'<p>Vendors with permits will be invited to move into empty storefronts — one, on the corner of 17th and Mission, has already been leased by CLECHA with the support of a city grant. A second will be an open air space at Capp and 24th Street.</p>'
                    +'<p>The plan <a href="https://missionlocal.org/2023/10/mission-street-vendors-oppose-upcoming-ban/">receives pushback from vendors worried for their livelihoods</a>, as well as the Latinx Democratic Club. Co-president Kevin Ortiz says the club is “appalled” by the ban, and that “just moving the problem around solves nothing.”</p>',
                location: {
                    center: [-122.4328161350563, 37.76124032733743],
                    zoom: 13.5,
                    bearing: 0,
                    pitch: 0,
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: false,
                showMarkets: true
            },
            {
                id: 'slide-14',
                title: "November 2023",
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2023/11/IMG_1698-scaled.jpg",
                description:
                    '<p>Ronen refuses to abandon the ban. She managed to get a ban - which goes against state law that allows vending - based on health and safety precautions for the community.</p>'
                    +'<p>After several community meetings, it goes into effect on <a href="https://missionlocal.org/2023/11/mission-street-vending-ban-begins/">November 27</a>.</p>'
                    +'<p>Permitted vendors are given two physical spots to set up — one indoors at 2137 Mission called “El Tiangue,” rented for 90 days by the city for $100,000. The second called "La Placita" is at Capp and 24th Streets. Neither ever take off.</p>',
                location: {
                    center: [-122.4328161350563, 37.76124032733743],
                    zoom: 13.5,
                    bearing: 0,
                    pitch: 0,
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: false,
                showMarkets: true
            },
            {
                id: 'slide-15',
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2023/11/enforcement-scaled-e1701129804794.jpg",
                description:
                    '<p><a href="https://missionlocal.org/2023/11/update-three-days-into-street-vending-ban/">Three days into the ban</a>, it is clear it will only work when police and Public Works staff are present.</p>'
                    +'<p>Before they arrive, street vendors set up early along Mission street and the plazas. When police and Public Works staff appear for their scheduled shifts, vendors shout warnings to each other and clear out. As soon as the patrols leave, vendors return.</p>'
                    +'<p>Few of the permitted vendors are using the city\'s two rented spaces. La Placita, in a parking lot at 24th and Capp streets, has five vendors in a space with room for nine. El Tiangue, at 2137 Mission St., has eight vendors in a space with room for 43. Business is slow, say vendors at both, but they hope it will pick up.</p>',
                location: {
                    center: [-122.4328161350563, 37.76124032733743],
                    zoom: 13.5,
                    bearing: 0,
                    pitch: 0,
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: false,
                showMarkets: true
            },
            {
                id: 'slide-16',
                title: "December 2023 to 2024",
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2023/11/Franco-Gonzalez-70-2-14-p.m.-11-29.jpeg",
                description:
                    '<p>Two weeks into the ban, vendors remain largely absent from both BART plazas but only when four-person teams from Public Works and the San Francisco Police Department are present. Those shifts are generally from 9 a.m. to 8 p.m. on weekdays, and from 8 a.m. to 8 p.m. on the weekends.</p>'
                    +'<p>“It\'s working. It\'s not perfect, but it\'s working,” District Supervisor Hillary Ronen <a href="https://missionlocal.org/2023/12/2-weeks-into-mission-street-vending-ban-sanctioned-indoor-markets-getting-more-sales/">tells Mission Local</a>.</p>'
                    +'<p>At El Tiangue, some 21 vendors filled 43 stalls. Sales are far from robust, but visitors are coming through and getting a photo with Santa Claus.</p>'
                    +'<p>At La Placita at 24th and Capp, only two of nine stalls are filled. A city-sponsored marketing campaign is trying to promote more foot traffic to both markets — called Las Posadas Holiday Shopping, it includes events like an Abuelita cook-off.</p>',
                location: {
                    center: [-122.4328161350563, 37.76124032733743],
                    zoom: 13.5,
                    bearing: 0,
                    pitch: 0,
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: false,
                showMarkets: true
            },
            {
                id: 'slide-17',
                title: "Feb, 4, 2024 — <a href='https://missionlocal.org/2024/02/mission-st-vending-ban-extended-by-six-months/'>The vending ban is extended for six months</a>",
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2024/02/IMG_2141-scaled.jpg",
                description:
                    '<p>“The progress in the Mission is evident, and a great relief to residents, merchants, and city workers,” announces Mayor Breed in a press release.</p>'
                    + '<p>Data from Public Works and the police department shows a 30 percent decrease in assault and robbery incidents around the 16th Street and 24th Street BART plazas, and a 23 percent decrease in service requests for street cleaning since the vending ban was implemented, the mayor\'s office adds.</p>'
                    + '<p>The ban continues to be effective as long as officers and Public Works employees are on site.</p>',
                location: {
                    center: [-122.4328161350563, 37.76124032733743],
                    zoom: 13.5,
                    bearing: 0,
                    pitch: 0,
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: false,
                showMarkets: true
            },
            {
                id: 'slide-18',
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2024/06/vending-2.jpg",
                description:
                    '<p>But as soon as they leave, the vendors return.</p>',
                location: {
                    center: [-122.4328161350563, 37.76124032733743],
                    zoom: 13.5,
                    bearing: 0,
                    pitch: 0,
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: false,
                showMarkets: true
            },
            {
                id: 'slide-19',
                title: "April 2024 - June 2024 — Sanctioned spaces for permitted vendors fail to bring customers",
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2024/05/La-Placita-3-scaled-e1715357230372.jpg",
                description:
                    '<p>El Tiangue closes in May. La Placita, is also failing. The remaining merchants estimate they have lost more than 90 percent of their income by moving off the streets. “No one comes,” the vendors say.</p>'
                    +'<p>“We were sold a bill of goods,” says one vendor. “We were told we would have customers. We were told it would be safe.”</p>',
                location: {
                    center: [-122.4328161350563, 37.76124032733743],
                    zoom: 13.5,
                    bearing: 0,
                    pitch: 0,
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: false,
                showMarkets: true
            }
        ]
    };

    // fill in layers
    var layerTypes = {
        'fill': ['fill-opacity'],
        'line': ['line-opacity'],
        'circle': ['circle-opacity', 'circle-stroke-opacity'],
        'symbol': ['icon-opacity', 'text-opacity'],
        'raster': ['raster-opacity'],
        'fill-extrusion': ['fill-extrusion-opacity']
    }
    
    var alignments = {
        'left': 'lefty',
        'center': 'centered',
        'right': 'righty'
    }
    
    function getLayerPaintType(layer) {
        var layerType = map.getLayer(layer).type;
        return layerTypes[layerType];
    }
    
    // Create story elements
    var story = document.getElementById('story');
    var features = document.createElement('div');
    features.classList.add(alignments[config.alignment]);
    features.setAttribute('id', 'features');
    
    var header = document.createElement('div');
    if (config.title) {
        var titleText = document.createElement('h1');
        titleText.innerText = config.title;
        header.appendChild(titleText);
    }
    
    if (config.subtitle) {
        var subtitleText = document.createElement('h2');
        subtitleText.innerText = config.subtitle;
        header.appendChild(subtitleText);
    }
    
    if (config.byline) {
        var bylineText = document.createElement('p');
        bylineText.innerText = config.byline;
        header.appendChild(bylineText);
    }
    
    if (config.description) {
        var descriptionText = document.createElement("div");
        descriptionText.innerHTML = config.description;
        header.appendChild(descriptionText);
    }

    if (config.image) {
        var image = new Image();
        image.src = config.image;
        chapter.appendChild(image);
    }
    
    if (header.innerText.length > 0) {
        header.classList.add(config.theme);
        header.setAttribute('id', 'header');
        story.appendChild(header);
    }
    
    // Create chapter elements
    config.chapters.forEach((record, idx) => {
        var container = document.createElement('div');
        var chapter = document.createElement('div');
        
        if (record.title) {
            var title = document.createElement('h3');
            title.innerText = record.title;
            chapter.appendChild(title);
        }
        
        if (record.image) {
            var image = new Image();
            image.src = record.image;
            chapter.appendChild(image);
        }
        
        if (record.description) {
            var story = document.createElement('p');
            story.innerHTML = record.description;
            chapter.appendChild(story);
        }
        
        container.setAttribute('id', record.id);
        container.classList.add('step');
        
        if (idx === 0) {
            container.classList.add('active');
        }
        
        chapter.classList.add(config.theme);
        container.appendChild(chapter);
        features.appendChild(container);
    });
    
    story.appendChild(features);
    
    var footer = document.createElement('div');
    if (config.footer) {
        var footerText = document.createElement('p');
        footerText.innerHTML = config.footer;
        footer.appendChild(footerText);
    }
    
    if (footer.innerText.length > 0) {
        footer.classList.add(config.theme);
        footer.setAttribute('id', 'footer');
        story.appendChild(footer);
    }
    
    // Initialize map
    mapboxgl.accessToken = config.accessToken;
    
    const transformRequest = (url) => {
        const hasQuery = url.indexOf("?") !== -1;
        const suffix = hasQuery ? "&pluginName=scrollytellingV2" : "?pluginName=scrollytellingV2";
        return {
            url: url + suffix
        }
    }
    
    var map = new mapboxgl.Map({
        container: 'map',
        style: config.style,
        center: config.chapters[0].location.center,
        zoom: config.chapters[0].location.zoom,
        bearing: config.chapters[0].location.bearing,
        pitch: config.chapters[0].location.pitch,
        scrollZoom: false,
        transformRequest: transformRequest
    });
    
    // Optional marker
    var marker = new mapboxgl.Marker();
    if (config.showMarkers) {
        marker.setLngLat(config.chapters[0].location.center).addTo(map);
    }
    
    // Setup Scrollama
    var scroller = scrollama();
    
    map.on("load", function () {
        // Add mission boundary with yellow border
        map.addSource('mission-source', {
            type: 'geojson',
            data: missionData
        });   
        map.addLayer({
            id: 'mission-line',
            type: 'line',
            source: 'mission-source',
            layout: {
                'visibility': 'none'
            },
            paint: {
                'line-color': '#ffffff', 
                'line-width': 2,
                'line-opacity': 1
            }
        });
        
        // Add mission plan with blue fill
        map.addSource('mission-plan-source', {
            type: 'geojson',
            data: missionPlanData
        }); 
        map.addLayer({
            id: 'mission-plan-fill',
            type: 'fill',
            source: 'mission-plan-source',
            layout: {
                'visibility': 'none'
            },
            paint: {
                'fill-color': '#efbe25', 
                'fill-opacity': 0.6,
            }
        });

        // Add plazas with red fill
        map.addSource('plazas-source', {
            type: 'geojson',
            data: plazasData
        });
        map.addLayer({
            id: 'plazas-fill',
            type: 'fill',
            source: 'plazas-source',
            layout: {
                'visibility': 'none'
            },
            paint: {
                'fill-color': '#f36e57', 
                'fill-opacity': 0.6,
            }
        });

        // Add markets with red fill
        map.addSource('markets-source', {
            type: 'geojson',
            data: marketsData
        });
        map.addLayer({
            id: 'markets-fill',
            type: 'fill',
            source: 'markets-source',
            layout: {
                'visibility': 'none'
            },
            paint: {
                'fill-color': '#46c134', 
                'fill-opacity': 0.6,
            }
        });
        
        // Set initial layer visibility based on first chapter
        if (config.chapters[0].showMission) {
            map.setLayoutProperty('mission-line', 'visibility', 'visible');
        }
        if (config.chapters[0].showMissionPlan) {
            map.setLayoutProperty('mission-plan-fill', 'visibility', 'visible');
        }
        if (config.chapters[0].showPlazas) {
            map.setLayoutProperty('plazas-fill', 'visibility', 'visible');
        }
        if (config.chapters[0].showMarkets) {
            map.setLayoutProperty('markets-fill', 'visibility', 'visible');
        }
        
        // Setup the scrollama instance
        scroller.setup({
            step: '.step',
            offset: 0.5,
            progress: true
        })
        .onStepEnter(response => {
            var chapter = config.chapters.find(chap => chap.id === response.element.id);
            response.element.classList.add('active');
            
            // Update layer visibility based on chapter settings
            map.setLayoutProperty('mission-line', 'visibility', 
                chapter.showMission ? 'visible' : 'none');
                
            map.setLayoutProperty('mission-plan-fill', 'visibility', 
                chapter.showMissionPlan ? 'visible' : 'none');

            map.setLayoutProperty('plazas-fill', 'visibility',
                chapter.showPlazas ? 'visible' : 'none');

            map.setLayoutProperty('markets-fill', 'visibility',
                chapter.showMarkets ? 'visible' : 'none');

            
            // Special handling
            if (response.element.id === 'slide-05' || response.element.id === 'slide-08' || response.element.id === 'slide-11') {
                // First check if we already have the black overlay
                if (!map.getSource('black-overlay-source')) {
                    map.addSource('black-overlay-source', {
                        'type': 'geojson',
                        'data': {
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Polygon',
                                'coordinates': [
                                    [[-180, -90], [-180, 90], [180, 90], [180, -90], [-180, -90]]
                                ]
                            }
                        }
                    });
                    map.addLayer({
                        'id': 'black-overlay-layer',
                        'type': 'fill',
                        'source': 'black-overlay-source',
                        'layout': {},
                        'paint': {
                            'fill-color': '#000000',
                            'fill-opacity': 1
                        }
                    });
                } else {
                    // If we already have the overlay, just make it visible
                    map.setLayoutProperty('black-overlay-layer', 'visibility', 'visible');
                }
            } else {
                // For other slides, hide the black overlay if it exists
                if (map.getSource('black-overlay-source') && map.getLayer('black-overlay-layer')) {
                    map.setLayoutProperty('black-overlay-layer', 'visibility', 'none');
                }
            }
            
            // Fly to the chapter location
            map.flyTo({
                center: chapter.location.center,
                zoom: chapter.location.zoom,
                bearing: chapter.location.bearing,
                pitch: chapter.location.pitch,
                duration: 1000
            });
            
            if (config.showMarkers) {
                marker.setLngLat(chapter.location.center);
            }
        })
        .onStepExit(response => {
            var chapter = config.chapters.find(chap => chap.id === response.element.id);
            response.element.classList.remove('active');
        });
});
    
    // Setup resize event
    window.addEventListener('resize', scroller.resize);
})
.catch(error => {
    console.error('Error loading geojson files:', error);
});