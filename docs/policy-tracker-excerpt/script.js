// Define colors for each tag
const tagColors = {
    "public safety": "#f67cf6",
    "budget": "#46c134",
    "fire department": "#ff9da6",
    "culture": "#f36e57",
    "housing": "#ade8f4",
    "transit": "#8ad6ce",
    "homelessness": "#efbe25",
    "business": "#ef9f6a",
    "downtown": "#0dd6c7",
    "public health": "#57a4ea"
};

const defaultColor = "#dddddd"; // Gray
let selectedTags = new Set(); // Store selected filters
let rawData = []; // Store full dataset

d3.csv("data.csv").then(data => {
    console.log("Loaded data:", data); // Debugging: check if data loads correctly
    rawData = data.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort data in reverse chronological order
    renderSlides(rawData, 3);
    attachTopFilterListeners(); // Attach event listeners to top filter buttons
}).catch(error => console.error("Error loading CSV:", error));

function renderSlides(data, limit) {
    const container = d3.select("#slides-container");
    container.html(""); // Clear previous slides

    // Apply filtering
    const filteredData = applyFilters(data);

    // Create or update the tally display element
    d3.select("#tally").text(`Total results: ${filteredData.length}`);

    // Limit the number of items before grouping
    const limitedData = limit ? filteredData.slice(0, limit) : filteredData;

    // Group limited data by date
    const groupedByDate = d3.group(limitedData, d => d.date_formatted);

    let slideHTML = `<div class="box"><div class="content slide"><div class="content-card">`;

    for (const [dateFormatted, items] of groupedByDate.entries()) {
        const day = items[0].day;
        slideHTML += `<h4 class="content-title">${dateFormatted} &nbsp;&nbsp;&nbsp; <span style="color: gray;">Day ${day}</span></h4>`;
        slideHTML += `<ul>`;
        items.forEach(d => {
            slideHTML += `<li><strong>${d.title}</strong>`;
        });
        slideHTML += `</ul><hr class="solid-line">`;
    }

    slideHTML += `</div></div></div>`;
    container.html(slideHTML);

    if (typeof pym !== "undefined") {
        new pym.Child();
    }
}

// Function to apply the current filters
function applyFilters(data) {
    return data.filter(d => {
        if (!d.tags || typeof d.tags !== "string") return false;
        let tagsArray = d.tags.split(/,\s*/).map(tag => tag.trim().toLowerCase());

        // Ensure every selected tag is present in the tags array
        return Array.from(selectedTags).every(tag => tagsArray.includes(tag));
    });
}


// Function to apply the current filters
function applyFilters(data) {
    return data.filter(d => {
        if (!d.tags || typeof d.tags !== "string") return false;
        let tagsArray = d.tags.split(/,\s*/).map(tag => tag.trim().toLowerCase());

        // Ensure every selected tag is present in the tags array
        return Array.from(selectedTags).every(tag => tagsArray.includes(tag));
    });
}

// Initialize pym.js on document load
document.addEventListener("DOMContentLoaded", () => {
    if (typeof pym !== "undefined") {
        new pym.Child();
    }
});

// add a pym clause to account for a window resize

window.addEventListener("resize", () => {
    if (typeof pym !== "undefined") {
        pym.Child.sendHeight();
    }
});

document.body.addEventListener('click', function () {
    window.open('https://missionlocal.org/sf-mayor-lurie-policy-tracker/', '_blank', 'noopener,noreferrer');
  });
