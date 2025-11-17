document.addEventListener('DOMContentLoaded', () => {

mapboxgl.accessToken ="pk.eyJ1IjoibWxub3ciLCJhIjoiY21ncjMxM2QwMnhjajJvb3ZobnllcDdmOSJ9.dskkEmEIuRIhKPkTh5o_Iw";

const map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/mapbox/light-v11', 
center: [-122.4183, 37.7599],   
zoom: 12.5                     
});

map.on('load', () => {

// 1. Add your GeoJSON (local or Mapbox URL)
map.addSource('sales_tax', {
type: 'geojson',
data: 'mission.geojson' 
});

// 2. Add polygon fill (simple)
map.addLayer({
id: 'sales-fill',
type: 'fill',
source: 'sales_tax',
paint: {
'fill-color': '#F67CF6',
'fill-opacity': 0.4
}
});

// 3. Outline
map.addLayer({
id: 'sales-outline',
type: 'line',
source: 'sales_tax',
paint: {
'line-color': '#000',
'line-width': 0.5
}
});

});

});