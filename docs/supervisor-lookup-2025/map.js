document.addEventListener('DOMContentLoaded', function () {
    // Initialize the Pym.js child
    var pymChild = new pym.Child({ polling: 200 });  // Add polling option here too

    // Add event listeners for image loading
    window.addEventListener('load', function() {
        // Send height when all resources including images are loaded
        pymChild.sendHeight();
    });
    
    // Listen for image loads
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('load', function() {
            // Send height whenever an image loads
            pymChild.sendHeight();
        });
    });

    // Define access token
    mapboxgl.accessToken = "pk.eyJ1IjoibWxub3ciLCJhIjoiY2t0dnZwcm1mMmR5YzMycDNrcDZtemRybyJ9.Br-G0LTOB3M6w83Az4XGtQ";

    // Define basemap settings
    let mapZoom = window.innerWidth >= 768 ? 10.8 : 10.45;
    let mapY = window.innerWidth < 400 ? 37.76 : 37.76;
    let mapX = window.innerWidth < 400 ? -122.434 : -122.434;

    // Initialize the map
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mlnow/cm2tndow500co01pw3fho5d21',
        zoom: mapZoom,
        center: [mapX, mapY],
        minZoom: 10.4
    });

    // Define colors for each district
    const districtColors = {
        "1": "#0dd6c7",
        "2": "#ef9f6a",
        "3": "#d896ff",
        "4": "#46c134",
        "5": "#ff9da6",
        "6": "#efbe25",
        "7": "#00a4bf",
        "8": "#e54c4c",
        "9": "#57a4ea",
        "10": "#ed43e5",
        "11": "#c1811a"
    };

    // Give district information 
    const districtInfo = {
        "1": {
            title: "District 1",
            photo: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/D1-Connie-Chan.png",
            supe: "Connie Chan",
            supeEmail: "chanstaff@sfgov.org",
            supeLang: "English, Cantonese, Mandarin",
            supeHistory: "Re-elected on Nov. 5, 2024 for the term from Jan. 8, 2025 to Jan. 8, 2029.",
            newsletter: "Sign up <a href='https://fe3b157075640675741775.pub.s10.sfmc-content.com/livrcs30wkh'>here</a> and read archives <a href='https://sfbos.org/supervisor-chan-newsletter'>here</a>. District official <a href='https://sfbos.org/supervisor-chan-district-1'>page</a>.",
            aide1: "Frances Hsieh",
            aide1Email: "Frances.Hsieh@sfgov.org",
            aide1Lang: "English",
            aide1Work: "To be confirmed.",
            aide2: "Angelina Yu",
            aide2Email: "Angelina.Yu@sfgov.org",
            aide2Lang: "English, Cantonese",
            aide2Work: "To be confirmed.",
            aide3: "Robyn Burke",
            aide3Lang: "English",
            aide3Email: "Robyn.Burke@sfgov.org",
            aide3Work: "To be confirmed.",
            aide4: "Calvin Yan",
            aide4Lang: "English, Cantonese",
            aide4Email: "Calvin.Yan@sfgov.org",
            aide4Work: "To be confirmed.",
            background: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/District-1-background-blank-2.png",
            neighborhoods: "Inner Richmond, Central Richmond, Outer Richmond, Lone Mountain, Golden Gate Park, Lincoln Park, and University of San Francisco.",
            race: "White: 47.17%; Asian: 41.25%; Latino: 7.16%; Black: 2.89%; Indigenous: 0.44%",
            population: "75,727",
            registeredVoters: "39,515",
            turnout: "83.4%",
            homeownership: "34.5%",
            policeMeeting: "<ul><li><span style='font-weight: 500'>Richmond Station</span>: The fourth Tuesday of the month, 5 - 6 p.m. Call 415-666-8000 for the latest details.</li><li><span style='font-weight: 500'>Park Station</span>: The fourth Wednesday of the month, 6:30 - 7:30 p.m., on <a href='https://www.sanfranciscopolice.org/stations/park-station'>Zoom</a>.</li></ul>",
            moneyIcon: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/finance-icon.png",
            endorsements: "Unions including SEIU Local 87, 1021, and 2015, San Francisco Fire Fighters Local 798, Teamsters Local 350, 665, 853, and 856, and <a href='https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/Connie_Chan_D1_endorsements_nov2024.pdf'>others</a>.",
            outsideSpending: "<ul><li>Fix our City SF, a PAC supported by various labor unions (<span style='font-weight: 500'>$693,473</span>)</li><li>Asian Americans for Representation, a PAC put together by former District 7 Supervisor Norman Yee to support Asian candidates (<span style='font-weight: 500'>$90,913</span>)</li><li>Building a Working SF, a pro-labor PAC (<span style='font-weight: 500'>$39,294</span>)</li><li>Tenants and Families United PAC, supported by various labor organizations (<span style='font-weight: 500'>$11,567</span>)</li><li>San Francisco Labor Council Labor & Neighbor Independent Expenditure PAC, a pro-labor PAC (<span style='font-weight: 500'>$9,720</span>)</li></ul>",
            oppositionSpending: "GrowSF, a tech-backed public pressure group (<span style='font-weight: 500'>$76,226</span>)"
        },
        "2": {
            title: "District 2",
            photo: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/D2-Stephen-Sherrill.png",
            supe: "Stephen Sherrill",
            supeEmail: "sherrillstaff@sfgov.org",
            supeLang: "English",
            supeHistory: "Appointed by former Mayor London Breed on Dec. 18, 2024 to fill the seat vacated by Catherine Stefani.",
            newsletter: "Sign up <a href='https://mcnsxn3s-g-22dg52lr9gqs9xjf0.pub.sfmc-content.com/5sdyibhqdyy'>here</a> and read archives <a href='https://sfbos.org/supervisor-sherrill-newsletter'>here</a>. District official <a href='https://sfbos.org/supervisor-sherrill-district-2'>page</a>.",
            aide1: "Mick Del Rosario",
            aide1Email: "Mick.DelRosario@sfgov.org",
            aide1Lang: "English",
            aide1Work: "To be confirmed.",
            aide2: "Lorenzo Rosas",
            aide2Email: "Lorenzo.Rosas@sfgov.org",
            aide2Lang: "English",
            aide2Work: "To be confirmed.",
            aide3: "Veronica Lempert",
            aide3Email: "Veronica.Lempert@sfgov.org",
            aide3Lang: "English",
            aide3Work: "To be confirmed.",
            aide4: "Lauren Chung",
            aide4Email: "Lauren.l.Chung@sfgov.org",
            aide4Lang: "English, Mandarin",
            aide4Work: "Chief of staff.",
            background: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/District-2-background-blank.png",
            neighborhoods: "The Marina, Pacific Heights, Cow Hollow, and Presidio Heights.",
            race: "White: 72.64%; Asian: 17.94%; Latino: 6.27%; Black: 2.45%; Indigenous: 0.33%",
            population: "75,950",
            registeredVoters: "42,749",
            turnout: "86.2%",
            homeownership: "24%",
            policeMeeting: "<ul><li><span style='font-weight: 500'>Park Station</span>: The fourth Wednesday of the month, 6:30 - 7:30 p.m., on <a href='https://www.sanfranciscopolice.org/stations/park-station'>Zoom</a>.</li><li><span style='font-weight: 500'>Richmond Station</span>: The fourth Tuesday of the month, 5 - 6 p.m. Call 415-666-8000 for the latest details.</li><li><span style='font-weight: 500'>Northern Station</span>: The second Tuesday of the month, 5 - 6 p.m. In-person at Northern Station at 1125 Fillmore St.</li><li><span style='font-weight: 500'>Central Station</span>: The third Thursday of the month, 5 - 6 p.m. Call 415-315-2400 for the latest details.</li>",
        },
        "3": {
            title: "District 3",
            photo: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/D3-Danny-Sauter.png",
            supe: "Danny Sauter",
            supeEmail: "sauterstaff@sfgov.org",
            supeLang: "English, Cantonese",
            supeHistory: "Elected on Nov. 5, 2024 for the term from Jan. 8, 2025 to Jan. 8, 2029.",
            newsletter: "Sign up <a href='https://www.dannyd3.com/newsletter'>here</a>.",
            aide1: "Tomio Nagano",
            aide1Email: "Tomio.Nagano@sfgov.org",
            aide1Lang: "English",
            aide1Work: "Constituent services, homelessness, behavioral health, street cleanliness, small businesses in Nob Hill and Lower Nob Hill.",
            aide2: "Amy Lee",
            aide2Email: "Amy.Lee5@sfgov.org",
            aide2Lang: "English, Cantonese",
            aide2Work: "Asian American and Pacific Islander liaison, neighborhood public safety, education, press, Chinatown small businesses.",
            aide3: "Michelle Andrews",
            aide3Email: "Michelle.Andrews@sfgov.org",
            aide3Lang: "English",
            aide3Work: "Housing, land use, transportation, small businesses in North Beach, Russian Hill and Fisherman’s Wharf.",
            aide4: "Tita Bell",
            aide4Email: "Tita.Bell@sfgov.org",
            aide4Lang: "English, Thai, German",
            aide4Work: "Chief of Staff. Public health, public safety policy, parks, downtown revitalization and small businesses.",
            background: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/District-3-background-blank-1.png",
            neighborhoods: "Lower Nob Hill, Lower Polk, Polk Gulch, Russian Hill, Nob Hill, Union Square, Fisherman's Wharf, Downtown/Financial District, Chinatown, North Beach, Telegraph Hill, Barbary Coast.",
            race: "White: 49.43%; Asian: 38.03%; Latino: 6.95%; Black: 3.85%; Indigenous: 0.78%",
            population: "79,301",
            registeredVoters: "32,824",
            turnout: "77.2%",
            homeownership: "12.3%",
            policeMeeting: "<ul><li><span style='font-weight: 500'>Tenderloin Station</span>: Last Tuesday of the month, 6 - 7 p.m. In person at Tenderloin Station at 301 Eddy St.</li><li><span style='font-weight: 500'>Central Station</span>: The third Thursday of the month, 5 - 6 p.m. Call 415-315-2400 for the latest details.</li><li><span style='font-weight: 500'>Northern Station</span>: The second Tuesday of the month, 5 - 6 p.m. In-person at Northern Station at 1125 Fillmore St.</li><li><span style='font-weight: 500'>Southern Station</span>: The third Wednesday of the month, 6 - 7 p.m. Call 415-575-6000 for the latest details.</li></ul>",
            moneyIcon: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/finance-icon.png",
            endorsements: "San Francisco Democratic Party, YIMBY Action, Asian political clubs such as Advancing Asians, Chinese American Citizens Alliance, Chinese American Democratic Club, and <a href='https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/Danny_Sauter_D3_endorsements_nov2024.pdf'>others</a>.",
            outsideSpending: "<ul><li>Families for a Vibrant SF, supported by the YIMBY and tech-backed group Abundance Network (<span style='font-weight: 500'>$161,877</span>)</li><li>GrowSF, a tech-backed public pressure group (<span style='font-weight: 500'>$70,910</span>)</li></ul>",
            oppositionSpending: "San Francisco Labor Council Labor & Neighbor Independent Expenditure PAC, a pro-labor PAC (<span style='font-weight: 500'>$55,746</span>)"
        },
        "4": {
            title: "District 4",
            photo: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/D4-Joel-Engardio.png",
            supe: "Joel Engardio",
            supeEmail: "engardiostaff@sfgov.org",
            supeLang: "English",
            supeHistory: "Elected on Nov. 8, 2022 for the term from Jan. 8, 2023 to Jan. 8, 2027.",
            newsletter: "Sign up <a href='https://www.joelengardio.com/subscribe'>here</a> and read archives <a href='https://us7.campaign-archive.com/home/?u=6f805a5cbc77cb8e75b8da566&id=0a22a96862'>here</a>. Read Engardio's blog <a href='https://www.joelengardio.com/blog'>here</a>. District official <a href='https://sfbos.org/supervisor-engardio-district-4'>page</a>.",
            aide1: "Jonathan Goldberg",
            aide1Email: "Jonathan.Goldberg@sfgov.org",
            aide1Lang: "English",
            aide1Work: "To be confirmed.",
            aide2: "Sammi Ma",
            aide2Email: "Sammi.Ma@sfgov.org",
            aide2Lang: "English, Cantonese",
            aide2Work: "To be confirmed.",
            aide3: "Sophie Shao",
            aide3Email: "hshao@sfgov.org",
            aide3Lang: "English, Mandarin",
            aide3Work: "To be confirmed.",
            aide4: "Sophie Marie",
            aide4Email: "Sophie.Marie@sfgov.org",
            aide4Lang: "English",
            aide4Work: "To be confirmed.",
            background: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/District-4-rev-2.png",
            neighborhoods: "The Sunset, Outer Sunset, Parkside, Pine Lake Park, Lakeshore and Merced Manor.",
            race: "Asian: 54.51%; White: 34.95%; Latino: 7.15%; Black: 1.72%; Indigenous: 0.43%",
            population: "75,998",
            registeredVoters: "39,017",
            turnout: "78.6%",
            homeownership: "52.7%",
            policeMeeting: "<ul><li><span style='font-weight: 500'>Taraval Station</span>: The third Thursday of the month, 6 - 7 p.m. Call 415-759-3100 for the latest details.</li><li><span style='font-weight: 500'>Richmond Station</span>: The fourth Tuesday of the month, 5 - 6 p.m. Call 415-666-8000 for the latest details.</li>",
        },
        "5": {
            title: "District 5",
            photo: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/D5-Bilal-Mahmood.png",
            supe: "Bilal Mahmood",
            supeEmail: "mahmoodstaff@sfgov.org",
            supeLang: "English, Urdu",
            supeHistory: "Elected on Nov. 5, 2024 for the term from Jan. 8, 2025 to Jan. 8, 2029.",
            newsletter: "Sign up <a href='https://fe3f15707564077d741374.pub.s10.sfmc-content.com/j3ltc3jkttv'>here</a> and read archives <a href='https://sfbos.org/supervisor-mahmood-newsletter'>here</a>. District official <a href='https://sfbos.org/supervisor-mahmood-district-5'>page</a>.",
            aide1: "Samantha Logan",
            aide1Email: "Sam.Logan@sfgov.org",
            aide1Lang: "English",
            aide1Work: "To be confirmed.",
            aide2: "Raynell Cooper",
            aide2Email: "Raynell.Cooper@sfgov.org",
            aide2Lang: "English",
            aide2Work: "To be confirmed.",
            aide3: "William Macfie",
            aide3Email: "William.Macfie@sfgov.org",
            aide3Lang: "English",
            aide3Work: "To be confirmed.",
            aide4: "Jessica Gutierrez Garcia",
            aide4Email: "Jessica.GutierrezGarcia@sfgov.org",
            aide4Lang: "English, Spanish",
            aide4Work: "Chief of staff.",
            background: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/District-5-background-blank-1.png",
            neighborhoods: "Tenderloin, Hayes Valley, Western Addition, Fillmore, Alamo Square, Japantown, NoPA, and Haight Ashbury.",
            race: "White: 53.51%; Asian: 20.75%; Black: 12.60%; Latino: 10.59%; Indigenous: 0.87%",
            population: "83,506",
            registeredVoters: "32,526",
            turnout: "76.1%",
            homeownership: "11.4%",
            policeMeeting: "<ul><li><span style='font-weight: 500'>Park Station</span>: The fourth Wednesday of the month, 6:30 - 7:30 p.m., on <a href='https://www.sanfranciscopolice.org/stations/park-station'>Zoom</a>.</li><li><span style='font-weight: 500'>Tenderloin Station</span>: Last Tuesday of the month, 6 - 7 p.m. In person at Tenderloin Station at 301 Eddy St.</li><li><span style='font-weight: 500'>Richmond Station</span>: The fourth Tuesday of the month, 5 - 6 p.m. Call 415-666-8000 for the latest details.</li><li><span style='font-weight: 500'>Northern Station</span>: The second Tuesday of the month, 5 - 6 p.m. In-person at Northern Station at 1125 Fillmore St.</li><li><span style='font-weight: 500'>Central Station</span>: The third Thursday of the month, 5 - 6 p.m. Call 415-315-2400 for the latest details.</li></ul>",
            moneyIcon: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/finance-icon.png",
            endorsements: "San Francisco Democratic Party, San Francisco Chronicle, SF YIMBY, and <a href='https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/Bilal_Mahmood_D5_endorsements_nov2024.pdf'>others</a>.",
            outsideSpending: "GrowSF, a tech-backed public pressure group (<span style='font-weight: 500'>$14,940</span>)",
            oppositionSpending: "<ul><li>Fix our City SF, a PAC supported by various labor unions (<span style='font-weight: 500'>$134,178</span>)</li><li>San Francisco Labor Council Labor & Neighbor Independent Expenditure PAC, a pro-labor PAC (<span style='font-weight: 500'>$65,879</span>)</li></ul>",
        },
        "6": {
            title: "District 6",
            photo: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/D6-Matt-Dorsey.png",
            supe: "Matt Dorsey",
            supeEmail: "DorseyStaff@sfgov.org",
            supeLang: "English",
            supeHistory: "Appointed May 9, 2022 by former Mayor London Breed. Then elected on Nov. 8, 2022 for the term from Jan. 8, 2023 to Jan. 8, 2027.",
            newsletter: "None. District official <a href='https://sfbos.org/supervisor-dorsey-district-6'>page</a>.",
            aide1: "Dominica Donovan",
            aide1Email: "Dominica.Donovan@sfgov.org",
            aide1Lang: "English",
            aide1Work: "Chief of Staff.",
            aide2: "Madison Tam",
            aide2Email: "Madison.R.Tam@sfgov.org",
            aide2Lang: "English",
            aide2Work: "Rules committee, Chinese media inquiries, Asian American and Pacific Islander liaison, land use and housing, transportation, youth, families, and education.",
            aide3: "Bryan Dahl",
            aide3Email: "Bryan.Dahl@sfgov.org",
            aide3Lang: "English",
            aide3Work: "Media inquiries and communications, budget, LGBTQ+, HIV/AIDS, Treasure Island redevelopment.",
            aide4: "Mahanaz Ebadi",
            aide4Email: "Mahanaz.Ebadi@sfgov.org",
            aide4Lang: "English, Farsi, Urdu",
            aide4Work: "Small businesses Liaison, drugs, recovery, public health Liaison, Southwest Asian and North African Liaison, San Francisco Recovers Liaison, Constituent Services.",
            background: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/District-6-background-blank.png",
            neighborhoods: "Mid-Market, Rincon Hill/East Cut, South of Market, South Beach, Mission Bay, the Design District, the 6th Street Corridor, and the Leather Cultural District, Treasure Island, Yerba Buena Island, Alcatraz.",
            race: "White: 39.84%; Asian: 38.20%; Latino: 11.37%; Black: 8.52%; Indigenous: 0.61%",
            population: "76,009",
            registeredVoters: "27,576",
            turnout: "74.3%",
            homeownership: "18.5%",
            policeMeeting: "<ul><li><span style='font-weight: 500'>Bayview Station</span>: The first Tuesday of the month, 5 - 6 p.m., held in-person at Bayview Station at 201 Williams Ave.</li><li><span style='font-weight: 500'>Mission Station</span>: Last Tuesday of the month, 5 - 6 p.m. In person at Mission Station at 630 Valencia St.</li><li><span style='font-weight: 500'>Tenderloin Station</span>: Last Tuesday of the month, 6 - 7 p.m. In person at Tenderloin Station at 301 Eddy St.</li><li><span style='font-weight: 500'>Northern Station</span>: The second Tuesday of the month, 5 - 6 p.m. In-person at Northern Station at 1125 Fillmore St.</li><li><span style='font-weight: 500'>Central Station</span>: The third Thursday of the month, 5 - 6 p.m. Call 415-315-2400 for the latest details.</li><li><span style='font-weight: 500'>Southern Station</span>: The third Wednesday of the month, 6 - 7 p.m. Call 415-575-6000 for the latest details.</li></ul>",
        },
        "7": {
            title: "District 7",
            photo: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/D7-Myrna-Melgar.png",
            supe: "Myrna Melgar",
            supeEmail: "melgarstaff@sfgov.org",
            supeLang: "English, Spanish, French, Swedish",
            supeHistory: "Elected on Nov.3, 2020 and re-elected on Nov. 5, 2024 for term until Jan. 8, 2029.",
            newsletter: "Sign up <a href='https://fe391570756406747d1571.pub.s10.sfmc-content.com/ntvxbnig5y1'>here</a>. Learn more about District 7 on its <a href='https://sites.google.com/view/supervisor-myrna-melgar/meet-district-7/neighborhoods'>website</a> and official <a href='https://sfbos.org/supervisor-melgar-district-7'>page</a>.",
            aide1: "Jen Low",
            aide1Email: "Jen.Low@sfgov.org",
            aide1Lang: "English, Cantonese, Toisanese, Mandarin, Burmese",
            aide1Work: "To be decided.",
            aide2: "Jennifer Fieber",
            aide2Email: "Jennifer.Fieber@sfgov.org",
            aide2Lang: "English",
            aide2Work: "To be decided.",
            aide3: "Michael Farrah",
            aide3Email: "Michael.Farrah@sfgov.org",
            aide3Lang: "English",
            aide3Work: "To be decided.",
            aide4: "Emma Heiken",
            aide4Email: "Emma.Heiken@sfgov.org",
            aide4Lang: "English, Spanish",
            aide4Work: "To be decided.",
            background: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/District-7-background-blank-1.png",
            neighborhoods: "West Portal, Westwood Park, Forest Hill, Parkmerced, Golden Gate Heights, Inner Sunset, St. Francis Woods, Miraloma, and Monterey Heights.",
            race: "White: 48.21%; Asian: 35%; Latino: 11.20%; Black: 4.01%; Indigenous: 0.40%",
            population: "78,689",
            registeredVoters: "43,048",
            turnout: "84.5%",
            homeownership: "50.7%",
            policeMeeting: "<ul><li><span style='font-weight: 500'>Ingleside Station</span>: The third Tuesday of the month, 6 - 7p.m. In person at Ingleside Station at 1 Sergeant John V. Young Lane.</li><li><span style='font-weight: 500'>Taraval Station</span>: The third Thursday of the month, 6 - 7 p.m. Call Taraval Station at 415-759-3100 for the latest details.</li><li><span style='font-weight: 500'>Park Station</span>: The fourth Wednesday of the month, 6:30 - 7:30 p.m., on <a href='https://www.sanfranciscopolice.org/stations/park-station'>Zoom</a>.</li><li><span style='font-weight: 500'>Richmond Station</span>: The fourth Tuesday of the month, 5 - 6 p.m. Call 415-666-8000 for the latest details.</li></ul>",
            moneyIcon: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/finance-icon.png",
            endorsements: "San Francisco Democratic Party, San Francisco Chronicle, San Francisco Labor Council, San Francisco Fire Fighters Local 798 and <a href'https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/Mynar_Melgar_D7_endorsements_nov2024.pdf'>others</a>.",
            outsideSpending: "<ul><li>Alice B. Toklas Lesbian and Gay Democratic Club PAC, a moderate-leaning Democratic club (<span style='font-weight: 500'>$2,006</span>)</li><li>San Francisco Labor Council Labor & Neighbor Independent Expenditure PAC, a pro-labor PAC (<span style='font-weight: 500'>$1,810</span>)</li>",
            oppositionSpending: "N/A",
        },
        "8": {
            title: "District 8",
            photo: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/D8-Rafael-Mandelman.png",
            supe: "Rafael Mandelman (Board President)",
            supeEmail: "mandelmanstaff@sfgov.org",
            supeLang: "English",
            supeHistory: "Elected on June 5, 2018 and then re-elected in 2022. Elected as Board President on Jan. 8, 2025.",
            newsletter: "Sign up <a href='https://mcnsxn3s-g-22dg52lr9gqs9xjf0.pub.sfmc-content.com/tiiy1hpzoxr'>here</a> and read archives <a href='https://sfbos.org/supervisor-mandelman-newsletter'>here</a>. District official <a href='https://sfbos.org/supervisor-mandelman-district-8'>page</a>.",
            aide1: "Calvin Ho",
            aide1Email: "Calvin.Ho@sfgov.org",
            aide1Lang: "English, Khmer (Cambodian)",
            aide1Work: "Transportation, land use, housing. Neighborhoods: Cole Valley, Duboce Triangle, Buena Vista Park, Corona Heights, Twin Peaks.",
            aide2: "Henry DeRuff",
            aide2Email: "Henry.DeRuff@sfgov.org",
            aide2Lang: "English, Spanish",
            aide2Work: "Education, budget, Sunshine Ordinance Task Force. Neighborhoods: Noe Valley, Diamond Heights.",
            aide3: "Anh Ha",
            aide3Email: "Anh.V.Ha@sfgov.org",
            aide3Lang: "English, Spanish, Vietnamese",
            aide3Work: "Public health, labor issues, LGBTQ, homelessness. Neighborhoods: Castro, Eureka Valley, Glen Park, Mission, Dolores.",
            aide4: "Melanie Mathewson",
            aide4Email: "melanie.mathewson@sfgov.org",
            aide4Lang: "English",
            aide4Work: "To be decided.",
            background: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/District-8-background-blank.png",
            neighborhoods: "The Castro, Glen Park, Noe Valley, Diamond Heights, Mission Dolores, and Cole Valley.",
            race: "White: 68.69%; Asian: 16.39%; Latino: 10.48%, Black: 3.59%, Indigenous: 0.57%",
            population: "83,420",
            registeredVoters: "52,350",
            turnout: "88.1%",
            homeownership: "34%",
            policeMeeting: "<ul><li><span style='font-weight: 500'>Ingleside Station</span>: The third Tuesday of the month, 6 - 7p.m. In person at Ingleside Station at 1 Sergeant John V. Young Lane.</li><li><span style='font-weight: 500'>Mission Station</span>: Last Tuesday of the month, 5 - 6 p.m. In person at Mission Station at 630 Valencia St.</li><li><span style='font-weight: 500'>Park Station</span>: The fourth Wednesday of the month, 6:30 - 7:30 p.m., on <a href='https://www.sanfranciscopolice.org/stations/park-station'>Zoom</a>.</li><li><span style='font-weight: 500'>Northern Station</span>: The second Tuesday of the month, 5 - 6 p.m. In-person at Northern Station at 1125 Fillmore St.</li><li><span style='font-weight: 500'>Southern Station</span>: The third Wednesday of the month, 6 - 7 p.m. Call 415-575-6000 for the latest details.</li></ul>",
        },
        "9": {
            title: "District 9",
            photo: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/D9-Jackie-Fielder.png",
            supe: "Jackie Fielder",
            supeEmail: "fielderstaff@sfgov.org",
            supeLang: "English, Spanish",
            supeHistory: "Elected Nov. 05, 2024 for the term from Jan. 8, 2025 to Jan. 8, 2029.",
            newsletter: "Sign up <a href='https://fe4015707564077f701771.pub.s10.sfmc-content.com/pplzt3rhgse'>here</a> and read archives <a href='https://sfbos.org/supervisor-fielder-newsletter'>here</a>. District official <a href='https://sfbos.org/supervisor-fielder-district-9'>page</a>.",
            aide1: "Jennifer Ferrigno",
            aide1Email: "Jennifer.Ferrigno@sfgov.org",
            aide1Lang: "English, Spanish",
            aide1Work: "Education, family homelessness, immigration, climate justice, rec & park, and Bernal constituent needs.",
            aide2: "Preston Kilgore",
            aide2Email: "Preston.Kilgore@sfgov.org",
            aide2Lang: "English, Spanish",
            aide2Work: "Land use, housing, MTA/transit. (Note: Ana Herrera holds this position but is currently on maternity leave.)",
            aide3: "Feng Han",
            aide3Email: "Feng.Han@sfgov.org",
            aide3Lang: "English, Cantonese",
            aide3Work: "Public health, behavioral health, tenants rights, budget, Portola constituent needs, labor.",
            aide4: "Sasha Gaona",
            aide4Email: "Sasha.Gaona@sfgov.org",
            aide4Lang: "English",
            aide4Work: "Mission conditions and constituent concerns, small business, street vending, public safety, homelessness.",
            background: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/District-9-background-blank-1.png",
            neighborhoods: "Mission District, Portola, and Bernal Heights.",
            race: "White: 41.87%; Latino: 26.24%; Asian: 25.34%; Black: 4.91%; Indigenous: 0.49%",
            population: "81,563",
            registeredVoters: "37,213",
            turnout: "77%",
            homeownership: "32.1%",
            policeMeeting: "<ul><li><span style='font-weight: 500'>Mission Station</span>: Last Tuesday of the month, 5 - 6 p.m. In person at Mission Station at 630 Valencia St.</li><li><span style='font-weight: 500'>Ingleside Station</span>: The third Tuesday of the month, 6 - 7p.m. In person at Ingleside Station at 1 Sergeant John V. Young Lane.</li><li><span style='font-weight: 500'>Bayview Station</span>: The first Tuesday of the month, 5 - 6 p.m., in-person at Bayview Station at 201 Williams Ave.</li><li><span style='font-weight: 500'>Southern Station</span>: The third Wednesday of the month, 6 - 7 p.m. Call 415-575-6000 for the latest details.</li></ul>",
            moneyIcon: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/finance-icon.png",
            endorsements: "SF League of Pissed Off Voters, San Francisco Tenants Union, United Educators of San Francisco and <a href='https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/Jackie_Fielder_D9_endorsements_nov2024.pdf'>others</a>.",
            outsideSpending: "Building a Working SF, a pro-labor PAC (<span style='font-weight: 500'>$54,309</span>)",
            oppositionSpending: "N/A",
        },
        "10": {
            title: "District 10",
            photo: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/D10-Shamann-Walton.png",
            supe: "Shamann Walton",
            supeEmail: "waltonstaff@sfgov.org",
            supeLang: "English",
            supeHistory: "Elected in November 2018 and re-elected in November 2022 and will term out in 2026. Served as Board President from Jan. 8, 2021 to Jan. 8, 2023",
            newsletter: "Sign up <a href='https://docs.google.com/forms/d/e/1FAIpQLSfWAlRG6fOmsaMleNoiYtGyMawMNeqJmU-IuP4WnEFOYXfwMw/viewform'>here</a> and read archives <a href='https://sfbos.org/supervisor-walton-newsletter'>here</a>. District official <a href='https://sfbos.org/supervisor-walton-district-10'>page</a>.",
            aide1: "Percy Burch",
            aide1Email: "Percy.Burch@sfgov.org",
            aide1Lang: "English",
            aide1Work: "Rules committee, appointments, public safety, housing relations, public housing (HOPE SF), land use & development, Hunters Point Shipyard, park & rec, open spaces, African American Cultural District, cannabis, violence prevention, transportation, small businesses, jobs and economic workforce development, food insecurity, San Francisco Public Utilities Commission.",
            aide2: "Tracy Gallardo",
            aide2Email: "Tracy.Gallardo@sfgov.org",
            aide2Lang: "English, Spanish",
            aide2Work: "Budget, women and girls issues, Juvenile Hall, healthcare, immigration, schools, education, children, youth, families, transitional aged youth, sheriff oversight, labor, evictions, public safety, San Francisco Polic Department, Latino issues.",
            aide3: "Natalie Gee",
            aide3Email: "Natalie.Gee@sfgov.org",
            aide3Lang: "English, Cantonese, Mandarin",
            aide3Work: "Chief of staff. Scheduling, legislation, press and communication, Chinese community, state legislation, public safety, women's issues, park & rec, open space, public health, health initiatives, language access, seniors, labor, transportation, jobs and economic workforce development, historic preservation, LGBTQ+.",
            aide4: "Lindsey Lopez-Weaver",
            aide4Email: "Lindsey.Lopez@sfgov.org",
            aide4Lang: "English",
            aide4Work: "Constituent management, homelessness, public safety, office management, interns & volunteers supervision, public works, San Francisco Public Utilities Commission, transportation, animal control, open spaces, fire, mental health, housing rules and policy.",
            background: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/District-10-background-blank.png",
            neighborhoods: "Potrero Hill, Central Waterfront, Dogpatch, Bayview-Hunters Point, Bayview Heights, India Basin, Silver Terrace, Candlestick Point, Visitacion Valley, Little Hollywood, Sunnydale, and McLaren Park.",
            race: "Asian: 42.16%; Black: 19.55%; White: 21.02%; Latino: 14.50%; Indigenous: 0.23%",
            population: "82,146",
            registeredVoters: "29,785",
            turnout: "66.7%",
            homeownership: "37.8%",
            policeMeeting: "<ul><li><span style='font-weight: 500'>Ingleside Station</span>:The third Tuesday of the month, 6 - 7p.m. In person at Ingleside Station at 1 Sergeant John V. Young Lane.</li><li><span style='font-weight: 500'>Bayview Station</span>: The first Tuesday of the month, 5 - 6 p.m., in-person at Bayview Station at 201 Williams Ave.</li><li><span style='font-weight: 500'>Mission Station</span>: Last Tuesday of the month, 5 - 6 p.m. In person at Mission Station at 630 Valencia St.</li><li><span style='font-weight: 500'>Southern Station</span>: The third Wednesday of the month, 6 - 7 p.m. Call 415-575-6000 for the latest details.</li></ul>",
        },
        "11": {
            title: "District 11",
            photo: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/D11-Chyanne-Chen.png",
            supe: "Chyanne Chen",
            supeEmail: "ChenStaff@sfgov.org",
            supeLang: "English, Cantonese, Mandarin",
            supeHistory: "Elected Nov. 5, 2024 for the term from Jan. 8, 2025 to Jan. 8, 2029.",
            newsletter: "Sign up <a href='https://mcnsxn3s-g-22dg52lr9gqs9xjf0.pub.sfmc-content.com/xpjvax3ymok'>here</a> and read archives <a href='https://sfbos.org/supervisor-chen-newsletter'>here</a>. District official <a href='https://sfbos.org/supervisor-chen-district-11'>page</a>.",
            aide1: "Jackie Prager",
            aide1Email: "Jackie.Prager@sfgov.org",
            aide1Lang: "English",
            aide1Work: "Public safety, public/behaviral health, homelessness, budget, scheduling, small businesses, LGBTQ+ policy, seniors.",
            aide2: "Charlie Sciammas",
            aide2Email: "Charlie.Sciammas@sfgov.org",
            aide2Lang: "English, Spanish, French, Turkish, Italian",
            aide2Work: "Land use, transportation, youth and families, housing, tenants, recreation and parks, environment.",
            aide3: "Linshao Chin",
            aide3Email: "linshao.chin@sfgov.org",
            aide3Lang: "English, Cantonese, Mandarin, Hokkien, Fuzhouness",
            aide3Work: "Early care and education, workforce and labor, small busiensses, immigration.",
            aide4: "KC Ho",
            aide4Email: "KC.Ho@sfgov.org",
            aide4Lang: "English, Cantonese, Mandarin",
            aide4Work: "Constiuent services.",
            background: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/District-11-background-blank-1.png",
            neighborhoods: "Mission Terrace, Cayuga Terrace, Excelsior, Balboa Park, Crocker-Amazon, Outer Mission, and Lakeview-OMI (Oceanview, Ingleside, Merced Height).",
            race: "Asian: 56.56%; Latino: 21.12%; White: 15.85%; Black: 5.39%; Indigenous: 0.19%",
            population: "82,684",
            registeredVoters: "32,487",
            turnout: "70.7%",
            homeownership: "51.8%",
            policeMeeting: "<ul><li><span style='font-weight: 500'>Ingleside Station</span>: The third Tuesday of the month, 6 - 7 p.m. In person at the Ingleside Station at 1 Sergeant John V. Young Lane.</li><li><span style='font-weight: 500'>Taraval Station</span>: The third Thursday of the month, 6 - 7 p.m. Call Taraval Station at 415-759-3100 for the latest details.</li></ul>",
            moneyIcon: "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/finance-icon.png",
            endorsements: "San Francisco District 11 Democratic Club, UESF, SEIU 1021, and <a href='https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/Chyanne_Chen_D11_endorsements_nov2024.pdf'>others</a>.",
            outsideSpending: "<ul><li>Building a Working SF, a pro-labor PAC (<span style='font-weight: 500'>$296,872</span>)</li><li>Fix our City SF, a PAC supported by various labor unions (<span style='font-weight: 500'>$60,000</span>)</li><li>Asian Americans for Representation, a PAC put together by former District 7 Supervisor Norman Yee to support Asian candidates (<span style='font-weight: 500'>$45,091</span>)</li><li>Tenants and Families United PAC, supported by various labor organizations (<span style='font-weight: 500'>$40,835</span>)</li><li>California Working Families Party, a progressive statewide group (<span style='font-weight: 500'>$1,778</span>)</li></ul>",
            oppositionSpending: "San Francisco Police Officers Association PAC, the local police officers union (<span style='font-weight: 500'>$1,149</span>)",
        },
    };

    // Hide all district-specific elements initially
    function hideAllElements() {
        const elementsToHide = [
            'about-district', 'about-aides', 'about-campaign',
            'photo', 'background', 'moneyIcon',
            'neighborhoods', 'population', 'registeredVoters', 'race',
            'turnout', 'homeownership', 'policeMeeting',
            'endorsements', 'outsideSpending', 'oppositionSpending',
            'supe', 'supeEmail', 'supeLang', 'supeHistory', 'newsletter',
            'aide1', 'aide1Email', 'aide1Lang', 'aide1Work',
            'aide2', 'aide2Email', 'aide2Lang', 'aide2Work',
            'aide3', 'aide3Email', 'aide3Lang', 'aide3Work',
            'aide4', 'aide4Email', 'aide4Lang', 'aide4Work'
        ];

        document.querySelector('.supe-bio-card').style.display = 'none';
        document.querySelectorAll('.aide-bio-card').forEach(card => card.style.display = 'none');

        elementsToHide.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = 'none';
            }
        });
    }

    // Helper function to update an element
    function updateElement(id, district, labels) {
        const element = document.getElementById(id);
        if (!element || !districtInfo[district][id]) return;

        if (element.tagName === 'IMG') {
            element.src = districtInfo[district][id];
            element.style.display = 'block';
        } else {
            element.innerHTML = labels[id] ?
                `<strong>${labels[id]}</strong> ${districtInfo[district][id]}` :
                districtInfo[district][id];
            element.style.display = 'block';
        }
    }

    // Efficient district switching logic
    function updateDistrictDisplay(district) {
        const isDefaultView = district === "0";
        const isOddDistrict = !isDefaultView && parseInt(district) % 2 === 1;
        
        // Toggle visibility based on selection
        document.getElementById('intro-text').style.display = isDefaultView ? "block" : "none";

        if (isDefaultView) {
            // Hide all elements and reset title
            hideAllElements();
            document.getElementById('district-title').textContent = "San Francisco Supervisorial Districts";
            
            // Send height after resetting to default view
            setTimeout(() => {
                pymChild.sendHeight();
            }, 50);
            
            return; // Exit early for default view
        }

        document.getElementById('about-district').style.display = isDefaultView ? "none" : "block";
        document.getElementById('about-aides').style.display = isDefaultView ? "none" : "block";
        document.getElementById('about-campaign').style.display = isOddDistrict ? "block" : "none";
        
        document.querySelector('.supe-bio-card').style.display = isDefaultView ? "none" : "flex";
        document.querySelectorAll('.aide-bio-card').forEach(card => {
            card.style.display = isDefaultView ? "none" : "flex";
        });
        
        // Update titles
        if (!isDefaultView) {
            document.getElementById('about-district').textContent = `About District ${district}`;
            document.getElementById('district-title').textContent = districtInfo[district].title;
        } else {
            document.getElementById('district-title').textContent = "San Francisco Supervisorial Districts";
            return; // Exit early for default view
        }
        
        // Define content labels
        const labels = {
            'supeEmail': 'Email: ',
            'supeLang': 'Languages:',
            'supeHistory': 'Term:',
            'newsletter': 'Newsletter:',
            'aide1Email': 'Email:',
            'aide1Lang': 'Languages:',
            'aide1Work': 'Expertise:',
            'aide2Email': 'Email:',
            'aide2Lang': 'Languages:',
            'aide2Work': 'Expertise:',
            'aide3Email': 'Email:',
            'aide3Lang': 'Languages:',
            'aide3Work': 'Expertise:',
            'aide4Email': 'Email:',
            'aide4Lang': 'Languages:',
            'aide4Work': 'Expertise:',
            'neighborhoods': 'Neighborhoods:',
            'population': 'Population:',
            'registeredVoters': 'Registered voters:',
            'race': 'Registered voter racial breakdown:',
            'turnout': 'November 2024 election turnout:',
            'homeownership': 'Homeownership rate:',
            'policeMeeting': 'Police station community meeting:',
            'endorsements': 'Endorsements:',
            'outsideSpending': 'Top outside spending:',
            'oppositionSpending': 'Opposition spending:'
        };
        
        // Update standard elements
        const standardElements = [
            'photo', 'supe', 'supeEmail', 'supeLang', 'supeHistory', 'newsletter',
            'aide1', 'aide1Email', 'aide1Lang', 'aide1Work',
            'aide2', 'aide2Email', 'aide2Lang', 'aide2Work',
            'aide3', 'aide3Email', 'aide3Lang', 'aide3Work',
            'aide4', 'aide4Email', 'aide4Lang', 'aide4Work',
            'background', 'neighborhoods', 'population', 'registeredVoters',
            'race', 'turnout', 'homeownership', 'policeMeeting'
        ];
        
        // Add finance elements only for odd districts
        const financeElements = ['moneyIcon', 'endorsements', 'outsideSpending', 'oppositionSpending'];
        
        // Update all elements
        standardElements.forEach(id => updateElement(id, district, labels));
        
        // Only update finance elements for odd districts
        if (isOddDistrict) {
            financeElements.forEach(id => updateElement(id, district, labels));
        } else {
            financeElements.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    if (element.tagName === 'IMG') {
                        element.style.display = 'none';
                    } else {
                        element.innerHTML = '';
                        element.style.display = 'none';
                    }
                }
            });
        }

        // Force a height reset to ensure proper recalculation
        const infoContainer = document.querySelector('.info-cont');
        
        // Use a sequence of delayed height updates to ensure proper rendering
        setTimeout(() => {
            pymChild.sendHeight();
            
            // Send another height update after images may have loaded
            setTimeout(() => {
                pymChild.sendHeight();
            }, 300);
        }, 50);
    }

    // Call hideAllElements on initial page load
    hideAllElements();

    // Wait for map to load before adding data
    map.on('load', function () {
        loadGeoJSON('all.geojson'); // Load all.geojson by default

        map.on('mouseenter', 'districts-layer', () => {
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'districts-layer', () => {
            map.getCanvas().style.cursor = '';
        });

        map.on('click', 'districts-layer', (e) => {
            // Get the district number from the clicked feature
            const district = e.features[0].properties.district;

            // Update the dropdown to reflect the selected district
            document.getElementById('district-dropdown').value = district;

            // Trigger change event to update map and display
            const event = new Event('change');
            document.getElementById('district-dropdown').dispatchEvent(event);
        });

        // Event listener for dropdown changes
        document.getElementById('district-dropdown').addEventListener('change', function (event) {
            let district = event.target.value;
            let geojsonFile = district === "0" ? 'all.geojson' : `${district}.geojson`;
            loadGeoJSON(geojsonFile);

            // Define center and zoom levels for each district
            let center, zoom;
            switch (district) {
                case '0':
                    center = [-122.434, 37.764];  // All districts
                    zoom = 10.5;
                    break;
                case '1':
                    center = [-122.482, 37.781];  // Coordinates for District 1
                    zoom = 11.65;
                    break;
                case '2':
                    center = [-122.453, 37.796];  // Coordinates for District 2
                    zoom = 11.48;
                    break;
                case '3':
                    center = [-122.408, 37.798];  // Coordinates for District 3
                    zoom = 12.5;
                    break;
                case '4':
                    center = [-122.493, 37.750];  // Coordinates for District 4
                    zoom = 12.23;
                    break;
                case '5':
                    center = [-122.435, 37.773];  // Coordinates for District 5
                    zoom = 11.9;
                    break;
                case '6':
                    center = [-122.387, 37.795];  // Coordinates for District 6
                    zoom = 11.5;
                    break;
                case '7':
                    center = [-122.473, 37.736];  // Coordinates for District 7
                    zoom = 11.6;
                    break;
                case '8':
                    center = [-122.438, 37.752];  // Coordinates for District 8
                    zoom = 12;
                    break;
                case '9':
                    center = [-122.414, 37.745];  // Coordinates for District 9
                    zoom = 12;
                    break;
                case '10':
                    center = [-122.390, 37.736];  // Coordinates for District 10
                    zoom = 11.5;
                    break;
                case '11':
                    center = [-122.446, 37.718];  // Coordinates for District 11
                    zoom = 11.8;
                    break;
                default:
                    center = [-122.434, 37.764];   // All districts
                    zoom = 10.5;
                    break;
            }

            // Update the map's center and zoom
            map.flyTo({
                center: center,
                zoom: zoom,
                essential: true // This ensures the transition is smooth
            });

            // Update district display
            updateDistrictDisplay(district);
        });

        // Resize the map when the window is resized
        window.addEventListener('resize', () => {
            map.resize();
            // Send the map data to Pym.js for responsive design
            pymChild.sendHeight();
        });

    });

    // Function to load GeoJSON dynamically
    function loadGeoJSON(file) {
        fetch(`data/${file}`)
            .then(response => response.json())
            .then(data => {
                let source = map.getSource('districts');
    
                if (source) {
                    source.setData(data);
                } else {
                    map.addSource('districts', {
                        type: 'geojson',
                        data: data
                    });
    
                    map.addLayer({
                        id: 'districts-layer',
                        type: 'fill',
                        source: 'districts',
                        paint: {
                            'fill-color': [
                                'match',
                                ['to-string', ['get', 'district']], // GeoJSON must have a "district" property
                                "1", districtColors["1"],
                                "2", districtColors["2"],
                                "3", districtColors["3"],
                                "4", districtColors["4"],
                                "5", districtColors["5"],
                                "6", districtColors["6"],
                                "7", districtColors["7"],
                                "8", districtColors["8"],
                                "9", districtColors["9"],
                                "10", districtColors["10"],
                                "11", districtColors["11"],
                                "#CECECE" // Default color if district not found
                            ],
                            'fill-opacity': 0.5,
                            'fill-outline-color': '#ffffff'
                        }
                    });
                }
    
                // Send updated height after content changes with slight delay
                setTimeout(() => pymChild.sendHeight(), 50);
            })
            .catch(error => {
                console.error("Error loading GeoJSON:", error);
                // Still send height even if there's an error
                pymChild.sendHeight();
            });
    }

});