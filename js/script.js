// Initialize Map
let map = L.map('map').setView([19.8762, 75.3433], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
L.marker([19.8762, 75.3433]).addTo(map).bindPopup("Chhatrapati Sambhajinagar");

// Initialize Chart
const ctx = document.getElementById('resultsChart').getContext('2d');
const resultsChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['NDA', 'INDIA', 'Others'],
        datasets: [{
            data: [293, 234, 16], // Verified 2024 Data
            backgroundColor: ['#00c6ff', '#7c3aed', '#00ff9f'],
            borderWidth: 0
        }]
    },
    options: { cutout: '72%', plugins: { legend: { labels: { color: '#fff' } } } }
});

// History & Demo Logic
function updateDemoData() {
    const newData = [280, 240, 23];
    resultsChart.data.datasets[0].data = newData;
    resultsChart.update();
    addHistory("Data Updated", "Chart data refreshed with demo values.");
}

function addHistory(title, detail) {
    const historyList = document.getElementById('history-list');
    const entry = document.createElement('div');
    entry.style.fontSize = '0.7rem';
    entry.style.margin = '5px 0';
    entry.innerHTML = `<b>${new Date().toLocaleTimeString()}</b>: ${title}`;
    historyList.prepend(entry);
    
    // Save to LocalStorage
    let logs = JSON.parse(localStorage.getItem('logs') || '[]');
    logs.push({title, detail, time: new Date()});
    localStorage.setItem('logs', JSON.stringify(logs));
}

function sendMessage() {
    const input = document.getElementById('user-input');
    if(!input.value) return;
    const chat = document.getElementById('chat-box');
    chat.innerHTML += `<p style="color:var(--primary)"><b>You:</b> ${input.value}</p>`;
    addHistory("AI Query", input.value);
    input.value = '';
}
