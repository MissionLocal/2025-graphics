// load in data from geojson files
function fetchJSON(url) {
    return fetch(url)
      .then(function(response) {
        return response.json();
      });
}

// Determine if we're on mobile
function isMobile() {
    return window.innerWidth < 768;
}

// Get the appropriate location settings based on viewport
function getLocationForViewport(chapterLocation) {
    if (isMobile() && chapterLocation.mobile) {
        return chapterLocation.mobile;
    }
    return {
        center: chapterLocation.center,
        zoom: chapterLocation.zoom,
        bearing: chapterLocation.bearing,
        pitch: chapterLocation.pitch
    };
}

// Fetch both geojson files before initializing the map
Promise.all([
    fetchJSON('mission.geojson'),
    fetchJSON('mission-plan.geojson'),
    fetchJSON('plazas.geojson'),
    fetchJSON('markets.geojson'),
    fetchJSON('ten-vendors.geojson'),
    fetchJSON('other-vendors.geojson')
])

.then(function([missionData, missionPlanData, plazasData, marketsData, vendorsData, otherVendorsData]) {
    var config = {
        style: 'mapbox://styles/mapbox/dark-v9',
        accessToken: 'pk.eyJ1IjoibWxub3ciLCJhIjoiY21kNmw1aTAyMDFkbTJqb3Z2dTN0YzRjMyJ9.4abRTnHdhMI-RE48dHNtYw',
        showMarkers: false,
        theme: 'dark',
        chapters: [
            {
                id: 'slide-00',
                title: 'March to April 2022',
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2022/04/24thStreetBART.jpg",
                description:
                    '<p>San Francisco has never had a citywide regulatory framework governing street vending — <a href="https://sfmayor.org/article/board-supervisors-approves-mayor-breed%E2%80%99s-street-vending-legislation">so then-Supervisor Hillary Ronen works to develop one.</a></p>'
                    +'<p>In March 2022, Ronen launches a <span class="yellow-highlight">"Mission Plan"</span> that envisions a system of permitted vendors. Other vendors will have their goods confiscated or be asked to leave the plazas.</p>'
                    +'<p>"I don\'t want to create chaos in the streets and an unlawful feeling for everyone," Ronen says. "I thought, as long as Public Works can take their stuff and confiscate it, that\'ll be enough and they\'ll leave because they can\'t sell their stuff here."</p>'
                    +'<p>This photo was taken on April 25, 2022 — less than two months after Ronen launched the plan.</p>',
                alignment: 'left',
                location: {
                    center: [-122.4328161350563, 37.75824032733743],
                    zoom: 14,
                    bearing: 0,
                    pitch: 0,
                    mobile: {
                        center: [-122.41526417941033, 37.759718918805575],
                        zoom: 13.2,
                        bearing: 0,
                        pitch: 0
                    }
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: false,
                showMarkets: false,
                showVendors: false,
                showOtherVendors: false
            },
            {
                id: 'slide-01',
                title: 'July 20 to Aug. 21, 2022 — Three months later',
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2022/07/My-project-3-4-e1658345342468.png",
                description:
                    '<p>The new permitting system for street vending — approved in March — is not yet in place.</p>'
                    +'<p>In the meantime, the city tries to control vending by fencing off the <span class="red-highlight">24th Street plaza</span>.</p>'
                    +'<p>Calle 24 Latino Cultural District, a nonprofit working with Ronen and BART, tells legal vendors that they will help them find new locations.</p>'
                    +'<p>This news does not go over well. <span class="bold-text">“I\'m a single mom,”</span> one jewelry seller tells Mission Local. <span class="bold-text">“I\'ve been here for eight years. I don\'t want to have to start over.”</span></p>',
                alignment: 'left',
                location: {
                    center: [-122.4328161350563, 37.75824032733743],
                    zoom: 14,
                    bearing: 0,
                    pitch: 0,
                    mobile: {
                        center: [-122.41526417941033, 37.759718918805575],
                        zoom: 13.2,
                        bearing: 0,
                        pitch: 0
                    }
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: true,
                showMarkets: false,
                showVendors: false,
                showOtherVendors: false
            },
            {
                id: 'slide-02',
                title: 'Late July 2022',
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2022/07/5p.m.24th.jpg",
                description:
                    '<p>The fences keep the <span class="red-highlight">24th Street plaza</span> clear, but vendors set up in front of the fences, crowding out pedestrians on Mission Street.</p>'
                    +'<p>Any rider getting off the bus faces a corridor of hawkers selling everything from beauty products to roach killer.</p>',
                alignment: 'left',
                location: {
                    center: [-122.42000941874, 37.752299761830855],
                    zoom: 16.9,
                    bearing: 0,
                    pitch: 0,
                    mobile: {
                        center: [-122.41900941874, 37.752299761830855],
                        zoom: 15.5,
                        bearing: 0,
                        pitch: 0
                    }
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: true,
                showMarkets: false,
                showVendors: false,
                showOtherVendors: false
            },
            {
                id: 'slide-03',
                title: 'August 2022',
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2022/09/IMG_0162-800x600-1.jpg",
                description:
                    '<p>In August, a group takes the fences down at night. A BART spokesperson attributes it to a group <a href="https://missionlocal.org/2022/08/its-like-youre-in-jail-activists-ecstatic-after-24th-street-bart-plaza-fences-pulled-down/">calling themselves Mission DeFENCE</a>.</p>'
                    +'<p>Public Works finishes the permitting system and announces <a href="https://sf.gov/apply-street-vending-permit?nid=5607">that by Sept. 12</a>,  all vendors need to obtain a $430 permit. Fees are waived in most cases.</p>',
                alignment: 'left',
                location: {
                    center: [-122.42000941874, 37.752299761830855],
                    zoom: 16.9,
                    bearing: 0,
                    pitch: 0,
                    mobile: {
                        center: [-122.41900941874, 37.752299761830855],
                        zoom: 15.5,
                        bearing: 0,
                        pitch: 0
                    }
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: true,
                showMarkets: false,
                showVendors: false,
                showOtherVendors: false
            },
            {
                id: 'slide-04',
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2022/08/IMG_0165.jpg",
                description:
                    '<p>No matter the permits, unpermitted vendors continue to work at the plazas.</p>',
                alignment: 'left',
                location: {
                    center: [-122.42000941874, 37.752299761830855],
                    zoom: 16.9,
                    bearing: 0,
                    pitch: 0,
                    mobile: {
                        center: [-122.41900941874, 37.752299761830855],
                        zoom: 15.5,
                        bearing: 0,
                        pitch: 0
                    }
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: true,
                showMarkets: false,
                showVendors: false,
                showOtherVendors: false
            },
            {
                id: 'slide-05',
                title: "Aug. 28, 2022 — First killing",
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2022/07/5p.m.24th.jpg",
                description:
                    '<p>A young BART passenger discovers 28-year-old Jabaree Harris bleeding from stab wounds and lying face down near the SFO/Millbrae platform.</p>'
                    +'<p><a href="https://missionlocal.org/2022/08/stab-victim-found-at-24th-street-bart-station-closed/">A witness tells Mission Local</a> that Harris, who peddled shoes and clothes among other vendors at the <span class="red-highlight">24th Street plaza</span>, was stabbed a few minutes earlier by another man during an argument over $50.</p>'
                    +'<p>Police <a href="https://missionlocal.org/2022/09/suspect-in-24th-bart-plaza-stabbing-arrested/">arrest his suspected killer</a> a week later.</p>',
                alignment: 'center',
                location: {
                    center: [-122.42000941874, 37.752299761830855],
                    zoom: 14,
                    bearing: 0,
                    pitch: 0,
                    mobile: {
                        center: [-122.41900941874, 37.752299761830855],
                        zoom: 15.5,
                        bearing: 0,
                        pitch: 0
                    }
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: true,
                showMarkets: false,
                showVendors: false,
                showOtherVendors: false
            },
            {
                id: 'slide-06',
                title: "September 2022 — Six months after permits are proposed, they go into effect",
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2022/09/My-project.jpg",
                description:
                    '<p><span class="bold-text">Permits have been issued and enforcement begins.</span> Enforcement follows specific guidelines: Public Works staffers first ask for permits. Those selling goods without a permit are told how they can get one and given an opportunity to pack up and leave.</p>'
                    +'<p>If they do not, Public Works may issue a notice of violation, and confiscate what they\'re selling.</p>'
                    +'<p>Police are expected to be on hand, but only to protect city workers and other people present if a crime occurs.</p>'
                    +'<p>Unpermitted vending continues, <a href="https://missionlocal.org/2022/09/day-one-of-enforcing-permits-at-the-24th-street-plaza-proves-easier-than-expected/">but vendors disperse once Public Works arrives</a>.</p>',
                alignment: 'left',
                location: {
                    center: [-122.4328161350563, 37.75824032733743],
                    zoom: 14,
                    bearing: 0,
                    pitch: 0,
                    mobile: {
                        center: [-122.41526417941033, 37.759718918805575],
                        zoom: 13.2,
                        bearing: 0,
                        pitch: 0
                    }
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: true,
                showMarkets: false,
                showVendors: false,
                showOtherVendors: false
            },
            {
                id: 'slide-07',
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2022/09/BARTPlaza.jpg",
                description:
                    '<p><span class="bold-text">Sixty-one</span> permits are approved. As long as officers are at the plaza, most of the unpermitted vendors stay away.</p>',
                alignment: 'left',
                location: {
                    center: [-122.4328161350563, 37.75824032733743],
                    zoom: 14,
                    bearing: 0,
                    pitch: 0,
                    mobile: {
                        center: [-122.41526417941033, 37.759718918805575],
                        zoom: 13.2,
                        bearing: 0,
                        pitch: 0
                    }
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: true,
                showMarkets: false,
                showVendors: false,
                showOtherVendors: false
            },
            {
                id: 'slide-08',
                title: "Dec. 18, 2022 — Second killing",
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2022/12/24thBARTPlazaNW.jpg",
                description:
                    '<p>At 4 p.m., a shooting at the <span class="red-highlight">24th Street plaza</span> <a href="https://missionlocal.org/2022/12/one-dead-sf-bart-plaza-shooting/">leaves one person dead and two suspects at large</a>.</p>',
                alignment: 'center',
                location: {
                    center: [-122.4328161350563, 37.76124032733743],
                    zoom: 13.5,
                    bearing: 0,
                    pitch: 0,
                    mobile: {
                        center: [-122.41935186602414, 37.76180547720679],
                        zoom: 11.5,
                        bearing: 0,
                        pitch: 0
                    }
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: true,
                showMarkets: false,
                showVendors: false,
                showOtherVendors: false
            },
            {
                id: 'slide-09',
                title: "February 2023",
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/Screenshot-2025-02-24-at-12.30.34 PM.png",
                description:
                    '<p><a href="https://missionlocal.org/2023/02/street-vending-the-future-of-24th-and-mission-bart-community-meeting/">At a community meeting</a> focused on how to improve the <span class="red-highlight">BART plazas</span> it\'s clear the permit system is not working.</p>'
                    +'<p>“Public Works hides, cops don\'t get out of their cars,” said William Ortiz-Cartagena, founder and treasurer of CLECHA, a nonprofit that supports Latinx entrepreneurs. The plazas continue to be overrun by vendors selling out of backpacks and suitcases.</p>'
                    +'<p>Some say the only solution is to redirect the Mission\'s 112 permitted vendors away from the plaza — maybe to a brick-and-mortar space. Others suggest allowing only crafts and artisan products to be sold. Everyone agrees the plazas need more supervision and cleaning.</p>',
                alignment: 'left',
                location: {
                    center: [-122.42000941874, 37.752299761830855],
                    zoom: 16.9,
                    bearing: 0,
                    pitch: 0,
                    mobile: {
                        center: [-122.41900941874, 37.752299761830855],
                        zoom: 15.5,
                        bearing: 0,
                        pitch: 0
                    }
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: true,
                showMarkets: false,
                showVendors: false,
                showOtherVendors: false
            },
            {
                id: 'slide-10',
                title: "June 27, 2023 - Nine months after permits go into effect, Public Works wants SFPD to take over enforcement",
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2022/09/My-project.jpg",
                description:
                    '<p>Public Works employees say they want police to take over street vending enforcement. One worker at a Mission District police station meeting says, <span class="bold-text">“They\'re already threatening our families, threatening to kill us.”</span></p>'
                    +'<p>“We\'ve had inspectors being punched before, cans thrown at us, you name it,” adds another.</p>'
                    +'<p>Switching enforcement to the police isn\'t possible — California SB 946 decriminalized vending.</p>'
                    +'<p>Mission Street remains packed, and most of the vendors appear to be operating without a permit.</p>',
                alignment: 'left',
                location: {
                    center: [-122.4328161350563, 37.75824032733743],
                    zoom: 14,
                    bearing: 0,
                    pitch: 0,
                    mobile: {
                        center: [-122.41526417941033, 37.759718918805575],
                        zoom: 13.2,
                        bearing: 0,
                        pitch: 0
                    }
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: true,
                showMarkets: false,
                showVendors: false,
                showOtherVendors: false
            },
            {
                id: 'slide-11',
                title: "July 23, 2023 - Third killing",
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2023/07/China-Express-24th-and-Mission-corner-July-23-by-Griffin.jpg",
                description:
                    '<p>In July, 42-year-old Valentin Hernandez Santillan, who regularly hangs out at the <span class="red-highlight">24th Street plaza</span>, is <a href="https://missionlocal.org/2023/07/plaza-regular-stabbed-killed-at-24th-and-mission-in-early-morning/">stabbed to death</a> nearby early one morning.</p>',
                alignment: 'center',
                location: {
                    center: [-122.4328161350563, 37.76124032733743],
                    zoom: 13.5,
                    bearing: 0,
                    pitch: 0,
                    mobile: {
                        center: [-122.41935186602414, 37.76180547720679],
                        zoom: 11.5,
                        bearing: 0,
                        pitch: 0
                    }
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: true,
                showMarkets: false,
                showVendors: false,
                showOtherVendors: false
            },
            {
                id: 'slide-12',
                title: "September 2023 — One year after permits go into effect, 16th Street plaza is fenced off",
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2023/09/16th-bart-plaza-barricades-police-1200x900.jpg",
                description:
                    '<p>The goal is to keep <span class="red-highlight">the plaza</span> clear for pedestrians, but vendors simply set up their wares in front of the barricades or on the pavement, further reducing walking space.</p>'
                    +'<p>Pinky, a vendor with bright pink hair and a can of pepper spray hanging on her neck, <a href="https://missionlocal.org/2023/09/new-barricades-erected-at-16th-st-bart-plaza-to-deter-vendors/">tells Mission Local</a> that the new fencing is just an annoyance. <span class="bold-text">“It\'s not stopping anybody doing anything; it just makes our lives more difficult.”</span></p>'
                    +'<p>She used to vend at Sixth and Market streets, she says, before coming to 16th Street four years ago.</p>',
                alignment: 'left',
                location: {
                    center: [-122.42292960530838, 37.76487577816566],
                    zoom: 16.7,
                    bearing: 0,
                    pitch: 0,
                    mobile: {
                        center: [-122.41974869993318, 37.765037111482954],
                        zoom: 15.5,
                        bearing: 0,
                        pitch: 0
                    }
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: true,
                showMarkets: false,
                showVendors: false,
                showOtherVendors: false
            },
            {
                id: 'slide-13',
                title: "October 2023 — After 13 months of trying permits, Ronen calls for a ban",
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2023/10/vendorBanner.png",
                description:
                    '<p>Supervisor Hilary Ronen <a href="https://missionlocal.org/2023/10/ronen-ban-mission-17th-street-vending-vendors-lease-clecha/">announces</a> <span class="yellow-highlight">a 90-day ban</span> of all street vending on Mission between Cesar Chavez and 14th streets.</p>'
                    +'<p>Vendors with permits will be invited to move into empty storefronts — one, on <span class="green-highlight">Mission Street near 17th Street</span>, has already been leased by CLECHA with the support of a city grant. A second will be an open air space at <span class="green-highlight">Capp and 24th streets</span>.</p>'
                    +'<p>The plan <a href="https://missionlocal.org/2023/10/mission-street-vendors-oppose-upcoming-ban/">receives pushback from vendors worried for their livelihoods</a>, as well as the Latinx Democratic Club. Co-president Kevin Ortiz says the club is “appalled” by the ban, and that “just moving the problem around solves nothing.”</p>',
                alignment: 'left',
                location: {
                    center: [-122.4328161350563, 37.75824032733743],
                    zoom: 14,
                    bearing: 0,
                    pitch: 0,
                    mobile: {
                        center: [-122.41526417941033, 37.759718918805575],
                        zoom: 13.2,
                        bearing: 0,
                        pitch: 0
                    }
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: false,
                showMarkets: true,
                showVendors: false,
                showOtherVendors: false
            },
            {
                id: 'slide-14',
                title: "November 2023 — A community meeting to discuss the ban",
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2023/11/IMG_1698-scaled.jpg",
                description:
                    '<p>Ronen refuses to abandon the ban. She manages to get a ban — which goes against state law that allows vending — based on health and safety precautions for the community.</p>'
                    +'<p>After several community meetings, it goes into effect on <a href="https://missionlocal.org/2023/11/mission-street-vending-ban-begins/">Nov. 27</a>.</p>'
                    +'<p>Permitted vendors are given two physical spots to set up — one indoors at <span class="green-highlight">2137 Mission St. called “El Tiangue,”</span> rented for 90 days by the city for $100,000.</p>'
                    +'<p>The second called <span class="green-highlight">"La Placita" is at Capp and 24th streets</span>. Neither ever take off.</p>',
                alignment: 'left',
                location: {
                    center: [-122.4328161350563, 37.75824032733743],
                    zoom: 14,
                    bearing: 0,
                    pitch: 0,
                    mobile: {
                        center: [-122.41526417941033, 37.759718918805575],
                        zoom: 13.2,
                        bearing: 0,
                        pitch: 0
                    }
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: false,
                showMarkets: true,
                showVendors: false,
                showOtherVendors: false
            },
            {
                id: 'slide-15',
                title: 'Three days into the ban',
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2023/11/enforcement-scaled-e1701129804794.jpg",
                description:
                    '<p>It\'s clear the ban only works when <a href="https://missionlocal.org/2023/11/update-three-days-into-street-vending-ban/">police and Public Works staff are present</a>.</p>'
                    +'<p>Before they arrive, street vendors set up early along Mission Street and the plazas. When police and Public Works staff appear for their scheduled shifts, vendors shout warnings to each other and clear out. As soon as the patrols leave, vendors return.</p>'
                    +'<p>Few of the permitted vendors are using the city\'s two rented spaces. La Placita, in a parking lot at 24th and Capp streets, has <span class="green-highlight">five vendors</span> in a space with <span class="green-highlight">room for nine</span>.</p>'
                    +'<p>El Tiangue, at 2137 Mission St., has <span class="green-highlight">eight vendors</span> in a space with <span class="green-highlight">room for 43</span>.</p>'
                    +'<p>Business is slow, say vendors at both, but they hope it will pick up.</p>',
                alignment: 'center',
                location: {
                    center: [-122.4328161350563, 37.75824032733743],
                    zoom: 14,
                    bearing: 0,
                    pitch: 0,
                    mobile: {
                        center: [-122.41526417941033, 37.759718918805575],
                        zoom: 13.2,
                        bearing: 0,
                        pitch: 0
                    }
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: false,
                showMarkets: true,
                showVendors: false,
                showOtherVendors: false
            },
            {
                id: 'slide-16',
                title: "Two weeks into the ban",
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2023/11/Franco-Gonzalez-70-2-14-p.m.-11-29.jpeg",
                description:
                    '<p>Vendors remain largely absent from both BART plazas but only when four-person teams from Public Works and the San Francisco Police Department are present. Those shifts are generally from 9 a.m. to 8 p.m. on weekdays, and from 8 a.m. to 8 p.m. on the weekends.</p>'
                    +'<p>“It\'s working. It\'s not perfect, but it\'s working,” District Supervisor Hillary Ronen <a href="https://missionlocal.org/2023/12/2-weeks-into-mission-street-vending-ban-sanctioned-indoor-markets-getting-more-sales/">tells Mission Local</a>.</p>'
                    +'<p>At El Tiangue, <span class="green-highlight">some 21 vendors filled 43 stalls</span>. Sales are far from robust, but visitors are coming through and getting a photo with Santa Claus.</p>'
                    +'<p>At La Placita at 24th and Capp, <span class="green-highlight">only two of nine stalls are filled</span>. A city-sponsored marketing campaign is trying to promote more foot traffic to both markets — called Las Posadas Holiday Shopping, it includes events like an abuelita cook-off.</p>',
                alignment: 'center',
                location: {
                    center: [-122.4328161350563, 37.75824032733743],
                    zoom: 14,
                    bearing: 0,
                    pitch: 0,
                    mobile: {
                        center: [-122.41526417941033, 37.759718918805575],
                        zoom: 13.2,
                        bearing: 0,
                        pitch: 0
                    }
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: false,
                showMarkets: true,
                showVendors: false,
                showOtherVendors: false
            },
            {
                id: 'slide-17',
                title: "Feb. 4, 2024 — The vending ban is extended for six months",
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2024/02/IMG_2141-scaled.jpg",
                description:
                    '<p>The <span class="yellow-highlight">90-day vending ban</span> is <a href="https://missionlocal.org/2024/02/mission-st-vending-ban-extended-by-six-months/">extended</a> for six months.</p>'
                    +'<p>“The progress in the Mission is evident, and a great relief to residents, merchants, and city workers,” announces Mayor London Breed in a press release.</p>'
                    + '<p>Data from Public Works and the police department shows a 30 percent decrease in assault and robbery incidents around the 16th Street and 24th Street BART plazas, and a 23 percent decrease in service requests for street cleaning since the vending ban was implemented, the mayor\'s office adds.</p>'
                    + '<p>The ban continues to be effective as long as officers and Public Works employees are on site.</p>',
                alignment: 'left',
                location: {
                    center: [-122.4328161350563, 37.75824032733743],
                    zoom: 14,
                    bearing: 0,
                    pitch: 0,
                    mobile: {
                        center: [-122.41526417941033, 37.759718918805575],
                        zoom: 13.2,
                        bearing: 0,
                        pitch: 0
                    }
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: false,
                showMarkets: false,
                showVendors: false,
                showOtherVendors: false
            },
            {
                id: 'slide-18',
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2024/06/vending-2.jpg",
                description:
                    '<p>But as soon as they leave, the vendors return.</p>',
                alignment: 'center',
                location: {
                    center: [-122.4328161350563, 37.75824032733743],
                    zoom: 14,
                    bearing: 0,
                    pitch: 0,
                    mobile: {
                        center: [-122.41526417941033, 37.759718918805575],
                        zoom: 13.2,
                        bearing: 0,
                        pitch: 0
                    }
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: false,
                showMarkets: true,
                showVendors: false,
                showOtherVendors: false
            },
            {
                id: 'slide-19',
                title: "June 2024 — Sanctioned spaces for permitted vendors fail to bring customers",
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2024/05/La-Placita-3-scaled-e1715357230372.jpg",
                description:
                    '<p><span class="green-highlight">El Tiangue</span> closes in May. <span class="green-highlight">La Placita</span> is also failing. The remaining merchants estimate they have lost more than 90 percent of their income by moving off the streets.</p>'
                    +'<p><span class="bold-text">“No one comes,”</span> the vendors say.</p>'
                    +'<p><span class="bold-text">“We were sold a bill of goods,”</span> says one vendor. <span class="bold-text">“We were told we would have customers. We were told it would be safe.”</span></p>',
                alignment: 'left',
                location: {
                    center: [-122.4328161350563, 37.75824032733743],
                    zoom: 14,
                    bearing: 0,
                    pitch: 0,
                    mobile: {
                        center: [-122.41526417941033, 37.759718918805575],
                        zoom: 13.2,
                        bearing: 0,
                        pitch: 0
                    }
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: false,
                showMarkets: true,
                showVendors: false,
                showOtherVendors: false
                
            },
            {
                id: 'slide-20',
                title: "June 2024 — 10 permitted vendors are allowed back on Mission Street, Sen. Wiener introduces a bill to get control of vending",
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2024/06/Pilot-2-scaled-e1719017954226.jpg",
                description:
                    '<p>Ten permitted vendors are allowed back on Mission Street.</p>'
                    +'<p>The <span class="green-highlight">10 permitted vendors</span> — <a href="https://missionlocal.org/2024/06/new-pilot-program-will-let-10-vendors-sell-on-mission-street/">six on the east side and four on the west side</a> — are allowed to set up shop on Mission Street between 23rd and 24th streets.</p>'
                    +'<p>“We\'re happy, because we\'re back and there\'s more people here, more transit,” <a href="https://missionlocal.org/2024/06/the-vendors-are-back-on-mission-street-with-uniforms-and-stalls/">said a vendor, in Spanish</a>. The ban stays in effect for everyone else.</p>'
                    +'<p>Sen. Scott Wiener <a href="https://missionlocal.org/2024/06/mission-vending-trial-set-for-mid-june-as-sen-wiener-introduces-bill-to-tackle-stolen-good-sales/">introduces SB 925</a>, a state bill specifically tailored to San Francisco\'s street vending troubles. It allows police to cite vendors who repeatedly sell stolen products with a misdemeanor and a penalty of up to six months in county jail. It does not apply to vendors selling food or anyone with a receipt or permit.</p>'
                    +'<p>Ronen begins to look at this bill as the only way to control unpermitted vending as it imposes consequences for illegal vending.</p>',
                alignment: 'left',
                location: {
                    center: [-122.42000941874, 37.753099761830855],
                    zoom: 17.2,
                    bearing: 0,
                    pitch: 0,
                    mobile: {
                        center: [-122.41852131009021, 37.75298932286557],
                        zoom: 16,
                        bearing: 0,
                        pitch: 0
                    }
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: false,
                showMarkets: false,
                showVendors: true,
                showOtherVendors: false
            },
            {
                id: 'slide-21',
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2024/06/IMG_8370-1.jpeg",
                description:
                    '<p><span class="red-highlight">Unpermitted vending</span> continues at the plazas and along Mission Street. </p>'
                    +'<p>One vendor, Estela Estrella, tells Mission Local she has already been asked to leave by Public Works, but seems undaunted. </p>'
                    +'<p>“I come here daily,” <a href="https://missionlocal.org/2024/06/the-vendors-are-back-on-mission-street-with-uniforms-and-stalls/">Estrella says</a>, “They have already taken my things four different times.”</p>',
                alignment: 'left',
                location: {
                    center: [-122.42000941874, 37.753099761830855],
                    zoom: 17.2,
                    bearing: 0,
                    pitch: 0,
                    mobile: {
                        center: [-122.41852131009021, 37.75298932286557],
                        zoom: 16,
                        bearing: 0,
                        pitch: 0
                    }
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: false,
                showMarkets: false,
                showVendors: true,
                showOtherVendors: true
            },
            {
                id: 'slide-22',
                title: "August 2024 — Sen. Wiener's bill dies in the State Assembly",
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2024/12/vending-ban-3-scaled.jpg",
                description:
                    '<p>SB 925, the state bill to give police the right to ticket vendors for selling stolen merchandise, quietly dies in the State Assembly without coming to a vote.</p>'
                    +'<p>San Francisco responds by <span class="bold-text">extending the vending ban for the third time</span>.</p>'
                    +'<p>“We were hoping that we could lift the moratorium once that law passed,” says Ronen. “Now that it hasn\'t passed, we\'re going to have to keep the moratorium going.”</p>',
                alignment: 'center',
                location: {
                    center: [-122.42000941874, 37.753099761830855],
                    zoom: 17.2,
                    bearing: 0,
                    pitch: 0,
                    mobile: {
                        center: [-122.41852131009021, 37.75298932286557],
                        zoom: 16,
                        bearing: 0,
                        pitch: 0
                    }
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: false,
                showMarkets: true,
                showVendors: true,
                showOtherVendors: true
            },
            {
                id: 'slide-23',
                title: "February 2025 — Sen. Wiener reintroduces the failed bill",
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/Screenshot-2025-02-24-at-12.52.04 PM.png",
                description:
                    '<p>By early February, it takes three police cars to keep the plaza at 24th Street clear.</p>'
                    +'<p>Sen. Scott Wiener <a href="https://missionlocal.org/2025/02/after-last-years-defeat-wiener-to-reintroduce-state-bill-to-address-fencing-operations-on-mission-street/">reintroduces</a> legislation — <a href="https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB276">SB 276</a> — to give officers the ability to cite unpermitted vendors selling stolen goods.</p>'
                    +'<p>It is set for a hearing on March 19, 2025.</p>'
                    +'<p>The vending ban is extended until June 30, 2026.</p>',
                alignment: 'center',
                location: {
                    center: [-122.42000941874, 37.753099761830855],
                    zoom: 17.2,
                    bearing: 0,
                    pitch: 0,
                    mobile: {
                        center: [-122.41852131009021, 37.75298932286557],
                        zoom: 16,
                        bearing: 0,
                        pitch: 0
                    }
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: false,
                showMarkets: true,
                showVendors: true,
                showOtherVendors: true
            },
            {
                id: 'slide-24',
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/Screenshot-2025-02-24-at-12.52.40 PM.png",
                description:
                    '<p>The police cars leave and the plazas fill up, blocking pedestrians walking on Mission Street near the plazas.</p>',
                alignment: 'center',
                location: {
                    center: [-122.42000941874, 37.753099761830855],
                    zoom: 17.2,
                    bearing: 0,
                    pitch: 0,
                    mobile: {
                        center: [-122.41852131009021, 37.75298932286557],
                        zoom: 16,
                        bearing: 0,
                        pitch: 0
                    }
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: false,
                showMarkets: true,
                showVendors: true,
                showOtherVendors: true
            },
            {
                id: 'slide-25',
                title: "March 2025 — Mayor Daniel Lurie targets the 16th Street plaza",
                image: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/03/e1610-1200x800.jpg",
                description:
                    '<p>While legislation is under consideration in Sacramento, <span class="bold-text">Mayor Daniel Lurie</span> targets the 16th Street plaza in his campaign on drugs, violence and vending.</p>'
                    +'<p>The mayor visits the plaza at least twice in <a href="https://missionlocal.org/2025/03/sf-mission-16th-street-bart-plaza-daniel-lurie-hour-by-hour/">early March as vendors sell everything</a> from babyfood to champagne.</p>'
                    +'<p>After a second visit, the mayor deploys a <a href="https://missionlocal.org/2025/03/sfpd-mobile-command-unit-16th-and-mission-bart-plaza/">mobile command unit to 16th Street</a>.</p>',
                alignment: 'center',
                location: {
                    center: [-122.42000941874, 37.753099761830855],
                    zoom: 17.2,
                    bearing: 0,
                    pitch: 0,
                    mobile: {
                        center: [-122.41852131009021, 37.75298932286557],
                        zoom: 16,
                        bearing: 0,
                        pitch: 0
                    }
                },
                showMission: true,
                showMissionPlan: true,
                showPlazas: false,
                showMarkets: true,
                showVendors: true,
                showOtherVendors: true
            }
        ]
    };
    
    var alignments = {
        'left': 'lefty',
        'center': 'centered',
        'right': 'righty'
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

        var slideAlignment = record.alignment ? alignments[record.alignment] : alignments[config.alignment];
        container.classList.add(slideAlignment);
        
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

    var initialLocation = getLocationForViewport(config.chapters[0].location);
    
    var map = new mapboxgl.Map({
        container: 'map',
        style: config.style,
        minZoom: 10.4,
        center: initialLocation.center,
        zoom: initialLocation.zoom,
        bearing: initialLocation.bearing,
        pitch: initialLocation.pitch,
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

        // Add markets with green fill
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

        //Add vendors with green circle
        map.addSource('vendors-source', {
            type: 'geojson',
            data: vendorsData
        });
        map.addLayer({
            id: 'vendors-circle',
            type: 'circle',
            source: 'vendors-source',
            layout: {
                'visibility': 'none'
            },
            paint: {
                'circle-color': '#46c134', 
                'circle-radius': 7,
                'circle-opacity': 0.9,
                'circle-stroke-color': '#46c134',
            }
        });

        //Add other vendors with red circle
        map.addSource('other-vendors-source', {
            type: 'geojson',
            data: otherVendorsData
        });
        map.addLayer({
            id: 'other-vendors-circle',
            type: 'circle',
            source: 'other-vendors-source',
            layout: {
                'visibility': 'none'
            },
            paint: {
                'circle-color': '#f36e57', 
                'circle-radius': 7,
                'circle-opacity': 0.9,
                'circle-stroke-color': '#f36e57',
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
        if (config.chapters[0].showVendors) {
            map.setLayoutProperty('vendors-circle', 'visibility', 'visible');
        }
        if (config.chapters[0].showOtherVendors) {
            map.setLayoutProperty('other-vendors-circle', 'visibility', 'visible');
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
        
            map.setLayoutProperty('vendors-circle', 'visibility',
                chapter.showVendors ? 'visible' : 'none');
            
            map.setLayoutProperty('other-vendors-circle', 'visibility',
                chapter.showOtherVendors ? 'visible' : 'none');
            
            // Special handling
            const specialSlides = ['slide-05', 'slide-08', 'slide-11', 'slide-15', 'slide-16', 'slide-18', 'slide-22', 'slide-23', 'slide-24', 'slide-25'];
            if (specialSlides.includes(response.element.id)) {
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
            const locationSettings = getLocationForViewport(chapter.location);

            map.flyTo({
                center: locationSettings.center,
                zoom: locationSettings.zoom,
                bearing: locationSettings.bearing,
                pitch: locationSettings.pitch,
                duration: 1000
            });
            
            if (config.showMarkers) {
                marker.setLngLat(locationSettings.center);
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

// Initialize pym.js
var pymChild = new pym.Child({ polling: 500 });

// Send height to parent after map loads
map.on("load", function() {
    setTimeout(function() {
        pymChild.sendHeight();
    }, 1000);
});

// Send height on scroll step changes
scroller.on("step", function() {
    pymChild.sendHeight();
});

// Send height on resize
window.addEventListener('resize', function() {
    pymChild.sendHeight();
});