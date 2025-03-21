// Define colors for each tag
const tagColors = {
    "public safety": "#f67cf6",  
    "budget": "#efbe25",         
    "fire department": "#ff9da6",     
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

// Function to render slides with unique date headers
function renderSlides(data) {
    const container = d3.select("#slides-container");
    container.html(""); // Clear previous slides

    let lastDisplayedDate = null; // Track last displayed date

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

        let dateHTML = "";
        let hrHTML = "";
        
        if (d.date !== lastDisplayedDate) {
            dateHTML = `<h4 class="content-title">${d.date_formatted} &nbsp;&nbsp;&nbsp; <span style="color: gray;">Day ${d.day}</span></h4>`;
            hrHTML = `<hr class="solid-line">`; // Solid line when date is displayed
            lastDisplayedDate = d.date; 
        } else {
            hrHTML = ``; // Dotted line if date is not displayed
        }
        

        let tagsHTML = tagsArray.map(tag => {
            let color = tagColors[tag] || defaultColor;
            return `<div class="tag-button" data-tag="${tag}" style="background-color: ${color};">${tag}</div>`;
        }).join("");

        let slideHTML = `
            <div class="box" data-tags="${tagsArray.join(",")}">
                <div class="content slide">
                    ${dateHTML} <!-- Only show date if it's new -->
                    <div class="content-card">
                    ${hrHTML} <!-- Only show date if it's new -->

                        ${tagsHTML}
                        <h3>${d.title}</h3>
                        <p>${d.description} <a style="color: gray;" target="_blank" href="${d.link}">Read more</a>.</p>
                    </div>
                </div>
            </div>
        `;

        container.html(container.html() + slideHTML);

    });

    attachTopFilterListeners(); // Ensure top filters remain functional


    // Reinitialize pym.js to adjust iframe height after content changes
    if (typeof pym !== "undefined") {
        new pym.Child();
    }
}

function filterSlides() {
    if (selectedTags.size === 0) {
        console.log("No filters selected, showing all slides.");
        renderSlides(rawData); // Show all slides
        return;
    }

    const filteredData = rawData.filter(d => {
        if (!d.tags || typeof d.tags !== "string") return false;
        let tagsArray = d.tags.split(/,\s*/).map(tag => tag.trim().toLowerCase());
        return tagsArray.some(tag => selectedTags.has(tag));
    });

    if (filteredData.length === 0) {
        console.log("No matching slides found.");
    }

    renderSlides(filteredData);
}



// Attach event listeners to filter buttons at the top
function attachTopFilterListeners() {
    document.querySelectorAll(".tag-button-top").forEach(button => {
        button.removeEventListener("click", handleTopFilterClick); // Ensure no duplicates
        button.addEventListener("click", handleTopFilterClick);
    });
}

function generateId(text) {
    return text.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""); // Convert spaces to hyphens & remove special chars
}

function handleTopFilterClick(event) {
    let tag = event.target.id.replace(/-/g, " "); // Convert hyphens back to spaces
    console.log(`Clicked: ${tag}`); // Debugging output

    if (!tag) {
        console.error("No ID found for clicked button!");
        return;
    }

    if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
        event.target.classList.remove("selected");
        console.log(`Deselected: ${tag}`);
    } else {
        selectedTags.add(tag);
        event.target.classList.add("selected");
        console.log(`Selected: ${tag}`);
    }

    filterSlides(); // Update the slides
}

// Attach event listener to all top filter buttons
document.querySelectorAll(".tag-button-top").forEach(button => {
    button.addEventListener("click", handleTopFilterClick);
});

// Initialize pym.js on document load
document.addEventListener("DOMContentLoaded", () => {
    if (typeof pym !== "undefined") {
        new pym.Child();
    }
});

document.addEventListener("DOMContentLoaded", function () {
    function updateRemoveButtonVisibility(card) {
        const removeButton = card.querySelector(".tag-button-top[id^='remove-']");
        const anySelected = card.querySelector(".tag-button-top.selected");
        removeButton.style.display = anySelected ? "inline-block" : "none";
    }

    function updateVisibility() {
        const selectedCategories = Array.from(document.querySelectorAll(".content-card:first-of-type .tag-button-top.selected"))
            .map(btn => btn.id);
        const selectedTypes = Array.from(document.querySelectorAll(".content-card:last-of-type .tag-button-top.selected"))
            .map(btn => btn.id);

        document.querySelectorAll("#slides-container .slide").forEach(slide => {
            let categoryMatch = selectedCategories.length === 0 || selectedCategories.some(cat => slide.dataset.category.includes(cat));
            let typeMatch = selectedTypes.length === 0 || selectedTypes.some(type => slide.dataset.type.includes(type));

            slide.style.display = (categoryMatch && typeMatch) ? "block" : "none";
        });
    }

    function toggleSelection(event) {
        let button = event.target;

        if (button.id.startsWith("remove-")) return;

        button.classList.toggle("selected");

        const card = button.closest(".content-card");
        updateRemoveButtonVisibility(card);
        updateVisibility();
    }
    
    function resetSection(event) {
        let removeButton = event.target;
        let card = removeButton.closest(".content-card");
    
        // Get the selected buttons in this section
        let buttonsInSection = card.querySelectorAll(".tag-button-top.selected");
    
        // Remove only the selected tags from `selectedTags` that belong to this section
        buttonsInSection.forEach(button => {
            let tag = button.id.replace(/-/g, " ");
            selectedTags.delete(tag);
            button.classList.remove("selected");
        });
    
        // If no tags are selected, reset everything
        if (selectedTags.size === 0) {
            console.log("All filters cleared, showing all slides.");
            renderSlides(rawData);
        } else {
            filterSlides(); // Update the slides properly
        }
    
        // Hide the remove button
        removeButton.style.display = "none";
    }
    
    
    

    document.querySelectorAll(".content-card .tag-button-top").forEach(button => {
        button.addEventListener("click", toggleSelection);
    });

    document.querySelectorAll(".tag-button-top[id^='remove-']").forEach(button => {
        button.addEventListener("click", resetSection);
    });

    document.querySelectorAll(".tag-button-top[id^='remove-']").forEach(button => {
        button.style.display = "none";
    });
});
