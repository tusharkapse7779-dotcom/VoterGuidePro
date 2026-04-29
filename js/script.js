// --- 1. INITIALIZE CHART ---
const ctx = document.getElementById('mainChart').getContext('2d');
const mainChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['NDA', 'INDIA', 'Others'],
        datasets: [{
            data: [293, 234, 16],
            backgroundColor: ['#00d2ff', '#7c3aed', '#00ff9f'],
            borderWidth: 0
        }]
    },
    options: { cutout: '78%', plugins: { legend: { position: 'bottom', labels: { color: '#fff' } } } }
});

// --- 2. EVM VOTE & BEEP LOGIC ---
function castVote(id, party) {
    const lamp = document.getElementById(`lp${id}`);
    lamp.classList.add('active');

    // Web Audio Beep
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 1); // 1-second EVM beep

    setTimeout(() => {
        lamp.classList.remove('active');
        addLog(`Vote cast for ${party}`);
    }, 1200);
}

// --- 3. VOICE REPORTING ---
function triggerVoiceReport() {
    const btn = document.getElementById('mic');
    btn.classList.add('active');
    document.getElementById('mic-status').innerText = "Generating Speech...";

    const report = new SpeechSynthesisUtterance();
    report.text = "Hello. This is your Election Guide Intelligence report. NDA is currently leading in 293 seats, while the INDIA alliance is at 234 seats. Total turnout is 96.8 percent across all states.";
    
    report.onend = () => {
        btn.classList.remove('active');
        document.getElementById('mic-status').innerText = "Report Complete.";
        addLog("Voice report played.");
    };
    window.speechSynthesis.speak(report);
}

// --- 4. MAP & LOGGING ---
const map = L.map('map').setView([19.8762, 75.3433], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
L.marker([19.8762, 75.3433]).addTo(map).bindPopup("Current Booth Region");

function addLog(msg) {
    const feed = document.getElementById('log-feed');
    feed.innerHTML = `<div>[${new Date().toLocaleTimeString()}] ${msg}</div>` + feed.innerHTML;
}

function showDemo(title, detail) {
    alert(`${title}: ${detail}`);
    addLog(`Consulted ${title}`);
}

function switchView(view) {
    addLog(`Switched to ${view} view.`);
}
