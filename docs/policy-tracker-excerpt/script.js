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



// function filterSlides() {
//     const noResultsEl = document.getElementById("no-results");

//     if (selectedTags.size === 0) {
//         renderSlides(rawData, 10);
//         noResultsEl.style.display = "none"; // 👈 hide message when filters are cleared
//         return;
//     }

//     const filteredData = rawData.filter(d => {
//         if (!d.tags || typeof d.tags !== "string") return false;
//         let tagsArray = d.tags.split(/,\s*/).map(tag => tag.trim().toLowerCase());
//         return Array.from(selectedTags).every(tag => tagsArray.includes(tag));
//     });

//     if (filteredData.length === 0) {
//         noResultsEl.style.display = "block";
//     } else {
//         noResultsEl.style.display = "none";
//     }

//     renderSlides(filteredData, 10);
// }




// // Attach event listeners to filter buttons at the top
// function attachTopFilterListeners() {
//     document.querySelectorAll(".tag-button-top").forEach(button => {
//         button.removeEventListener("click", handleTopFilterClick); // Ensure no duplicates
//         button.addEventListener("click", handleTopFilterClick);
//     });
// }

// function generateId(text) {
//     return text.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""); // Convert spaces to hyphens & remove special chars
// }

// function handleTopFilterClick(event) {
//     let tag = event.target.id.replace(/-/g, " "); // Convert hyphens back to spaces
//     console.log(`Clicked: ${tag}`); // Debugging output

//     if (!tag) {
//         console.error("No ID found for clicked button!");
//         return;
//     }

//     if (selectedTags.has(tag)) {
//         selectedTags.delete(tag);
//         event.target.classList.remove("selected");
//         console.log(`Deselected: ${tag}`);
//     } else {
//         selectedTags.add(tag);
//         event.target.classList.add("selected");
//         console.log(`Selected: ${tag}`);
//     }

//     filterSlides(); // Update the slides
// }

// // Attach event listener to all top filter buttons
// document.querySelectorAll(".tag-button-top").forEach(button => {
//     button.addEventListener("click", handleTopFilterClick);
// });

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

// document.addEventListener("DOMContentLoaded", function () {
//     function updateRemoveButtonVisibility(card) {
//         const removeButton = card.querySelector(".tag-button-top[id^='remove-']");
//         const anySelected = card.querySelector(".tag-button-top.selected");
//         removeButton.style.display = anySelected ? "inline-block" : "none";
//     }

//     // Function to update visibility after slides have been rendered
//     function updateVisibility() {
//         const selectedTags = Array.from(document.querySelectorAll(".tag-button-top.selected"))
//             .map(btn => btn.id); // get tag ids as an array

//         // Ensure slides have been rendered before filtering
//         const slides = document.querySelectorAll("#slides-container .slide");

//         if (slides.length === 0) {
//             // Wait for slides to be rendered
//             setTimeout(updateVisibility, 100);  // Retry after a short delay
//             return;
//         }

//         // Loop through all slides and check if they match the selected tags
//         slides.forEach(slide => {
//             // Get the tags from the slide (split into an array)
//             const slideTags = slide.dataset.tags ? slide.dataset.tags.split(",") : [];

//             // Debugging: log the slide's tags to confirm it's read properly
//             console.log('Slide Tags:', slideTags);

//             // Check if the slide contains all selected tags (AND condition)
//             const allTagsMatch = selectedTags.every(tag => slideTags.includes(tag));

//             // Show the slide if it contains all selected tags, otherwise hide it
//             slide.style.display = allTagsMatch ? "block" : "none";
//         });
//     }
//     function toggleSelection(event) {
//         let button = event.target;

//         if (button.id.startsWith("remove-")) return;

//         const tag = button.id.replace(/-/g, " ");

//         button.classList.toggle("selected");

//         if (selectedTags.has(tag)) {
//             selectedTags.delete(tag);
//         } else {
//             selectedTags.add(tag);
//         }

//         const card = button.closest(".content-card");
//         updateRemoveButtonVisibility(card);

//         filterSlides(); // 👈 Re-filter based on updated selectedTags
//     }


//     function resetSection(event) {
//         let removeButton = event.target;
//         let card = removeButton.closest(".content-card");

//         document.getElementById("no-results").style.display = "none";

//         let buttonsInSection = card.querySelectorAll(".tag-button-top.selected");

//         buttonsInSection.forEach(button => {
//             let tag = button.id.replace(/-/g, " ");
//             selectedTags.delete(tag);
//             button.classList.remove("selected");
//         });

//         filterSlides(); // 👈 Always update slides

//         removeButton.style.display = "none";
//     }


//     // Add event listeners to tag buttons
//     document.querySelectorAll(".content-card .tag-button-top").forEach(button => {
//         button.addEventListener("click", toggleSelection);
//     });

//     // Add event listeners to the remove buttons
//     document.querySelectorAll(".tag-button-top[id^='remove-']").forEach(button => {
//         button.addEventListener("click", resetSection);
//     });

//     // Initially hide remove buttons
//     document.querySelectorAll(".tag-button-top[id^='remove-']").forEach(button => {
//         button.style.display = "none";
//     });

//     // Initially render the slides (ensure this is done before filtering)
//     renderSlides(rawData);  // Make sure this function renders your slides

//     // Initial visibility update after rendering slides
//     updateVisibility();
// });
// // setTimeout(() => {
// //     console.log(document.getElementById("slides-container").innerHTML);
// // }, 1000);
