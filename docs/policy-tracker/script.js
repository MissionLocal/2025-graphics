// Define colors for each tag
const tagColors = {
    "public safety": "#f67cf6",  
    "budget": "#efbe25",         
    "fire dept.": "#ff9da6",     
    "culture": "#f36e57",        
    "governance": "#ade8f4",     
    "transit": "#8ad6ce",               
    "homelessness": "#fae9b6",   
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
    renderSlides(rawData); // Initial rendering
    attachTopFilterListeners(); // Attach event listeners to top filter buttons
}).catch(error => console.error("Error loading CSV:", error));

// Function to render slides
function renderSlides(data) {
    const container = d3.select("#slides-container");
    container.html(""); // Clear previous slides

    data.forEach(d => {
        if (!d.tags || typeof d.tags !== "string") {
            console.warn(`Skipping row due to missing or invalid tags:`, d);
            return;
        }

        let tagsArray = d.tags
            .split(/,\s*/) 
            .map(tag => tag.trim().toLowerCase())
            .filter(tag => tag.length > 0);

        console.log(`Processed tags for "${d.title}":`, tagsArray);

        let tagsHTML = tagsArray.map(tag => {
            let color = tagColors[tag] || defaultColor;
            return `<div class="tag-button" data-tag="${tag}" style="background-color: ${color};">${tag}</div>`;
        }).join("");

        let slideHTML = `
            <div class="box" data-tags="${tagsArray.join(",")}">
                <div class="content slide">
                    <h4 class="content-title">${d.date_formatted} &nbsp;&nbsp;&nbsp; <span style="color: gray;">Day ${d.day}</span></h4>
                    <div class="content-card">
                        <hr>
                        ${tagsHTML}
                        <h3>${d.title}</h3>
                        <p>${d.description} <a style="color: gray;" target="_blank" href="${d.link}">Read more</a>.</p>
                    </div>
                </div>
            </div>
        `;

        container.append("div").html(slideHTML);
    });

    attachTagEventListeners();
    attachTopFilterListeners(); // Ensure top filters remain functional
}

// Function to filter slides based on selected tags
function filterSlides() {
    if (selectedTags.size === 0) {
        renderSlides(rawData); // Show all if no tags selected
        return;
    }

    const filteredData = rawData.filter(d => {
        if (!d.tags || typeof d.tags !== "string") return false;
        let tagsArray = d.tags.split(/,\s*/).map(tag => tag.trim().toLowerCase());
        return tagsArray.some(tag => selectedTags.has(tag));
    });

    renderSlides(filteredData);
}

// Attach event listeners to tag buttons inside slides
function attachTagEventListeners() {
    document.querySelectorAll(".tag-button").forEach(button => {
        button.removeEventListener("click", handleTagClick); // Remove old listeners
        button.addEventListener("click", handleTagClick);
    });
}

// Attach event listeners to filter buttons at the top
function attachTopFilterListeners() {
    document.querySelectorAll(".tag-button-top").forEach(button => {
        button.removeEventListener("click", handleTopFilterClick); // Ensure no duplicates
        button.addEventListener("click", handleTopFilterClick);
    });
}

// Handle tag button clicks inside slides
function handleTagClick(event) {
    let tag = event.target.getAttribute("data-tag");

    // Toggle selection
    if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
        event.target.style.opacity = "1"; // Reset button appearance
    } else {
        selectedTags.add(tag);
        event.target.style.opacity = "0.6"; // Indicate selection
    }

    filterSlides(); // Update the slides
}

// Handle top filter button clicks
function handleTopFilterClick(event) {
    let tag = event.target.textContent.trim().toLowerCase();

    // Toggle selection
    if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
        event.target.style.opacity = "1"; // Reset button appearance
    } else {
        selectedTags.add(tag);
        event.target.style.opacity = "0.6"; // Indicate selection
    }

    filterSlides(); // Update the slides
}
