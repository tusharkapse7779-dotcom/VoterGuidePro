export function loadMap() {
    const map = L.map('map').setView([18.5204,73.8567], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
        .addTo(map);

    L.marker([18.5204,73.8567])
        .addTo(map)
        .bindPopup("Pune");
}
