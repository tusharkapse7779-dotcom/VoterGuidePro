/**
 * Election Guide Pro - Main Application Module
 * @version 1.0.0
 * @author Election Guide Team
 * @license MIT
 */

// ============================================
// Application State (Encapsulated)
// ============================================
const AppState = (function() {
    let instance = null;
    
    class StateManager {
        constructor() {
            this.data = {
                electionData: {
                    totalSeats: 543,
                    totalVoters: "97.2Cr",
                    alliances: {
                        nda: 298,
                        india: 230,
                        others: 15
                    }
                },
                evmCounts: [128, 112, 43], // NDA, INDIA, Others
                activeView: 'dashboard',
                isVoicePlaying: false,
                maps: {
                    miniMap: null,
                    fullMap: null
                },
                charts: {
                    allianceChart: null
                }
            };
            this.listeners = new Map();
        }
        
        static getInstance() {
            if (!instance) {
                instance = new StateManager();
            }
            return instance;
        }
        
        get(key) {
            return key ? this.data[key] : this.data;
        }
        
        set(key, value) {
            const oldValue = this.data[key];
            this.data[key] = value;
            this.notify(key, value, oldValue);
        }
        
        subscribe(key, callback) {
            if (!this.listeners.has(key)) {
                this.listeners.set(key, []);
            }
            this.listeners.get(key).push(callback);
        }
        
        notify(key, newValue, oldValue) {
            if (this.listeners.has(key)) {
                this.listeners.get(key).forEach(callback => callback(newValue, oldValue));
            }
        }
    }
    
    return StateManager;
})();

// ============================================
// Logger Service
// ============================================
const Logger = (function() {
    const logContainer = document.getElementById('log-feed');
    
    function addLog(message, type = 'info') {
        if (!logContainer) return;
        
        const timestamp = new Date().toLocaleTimeString('en-IN');
        const icons = { info: '📢', alert: '⚠️', success: '✅', error: '❌' };
        const icon = icons[type] || icons.info;
        
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.innerHTML = `${icon} [${timestamp}] ${message}`;
        
        logContainer.insertBefore(logEntry, logContainer.firstChild);
        
        // Limit log entries to 15
        while (logContainer.children.length > 15) {
            logContainer.removeChild(logContainer.lastChild);
        }
    }
    
    return { addLog };
})();

// ============================================
// Audio Service
// ============================================
const AudioService = (function() {
    let audioContext = null;
    
    async function initAudioContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }
        return audioContext;
    }
    
    async function playBeep(frequency = 880, duration = 0.3) {
        try {
            const ctx = await initAudioContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.value = frequency;
            gainNode.gain.value = 0.3;
            
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
            oscillator.stop(ctx.currentTime + duration);
        } catch (error) {
            console.warn('Audio playback failed:', error);
        }
    }
    
    async function speak(text, onEnd = null) {
        return new Promise((resolve, reject) => {
            if (!window.speechSynthesis) {
                reject(new Error('Speech synthesis not supported'));
                return;
            }
            
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.95;
            utterance.pitch = 1.0;
            utterance.lang = 'en-IN';
            
            utterance.onend = () => {
                if (onEnd) onEnd();
                resolve();
            };
            
            utterance.onerror = reject;
            window.speechSynthesis.speak(utterance);
        });
    }
    
    return { playBeep, speak, initAudioContext };
})();

// ============================================
// Chart Service
// ============================================
const ChartService = (function() {
    let currentChart = null;
    
    function createDoughnutChart(canvasId, data, labels, colors) {
        const ctx = document.getElementById(canvasId)?.getContext('2d');
        if (!ctx) return null;
        
        if (currentChart) {
            currentChart.destroy();
        }
        
        currentChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 0,
                    hoverOffset: 8,
                    cutout: '65%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#cbd5e1',
                            font: { size: 11, family: 'Inter' },
                            padding: 12
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        titleColor: '#38bdf8',
                        bodyColor: '#cbd5e1'
                    }
                }
            }
        });
        
        return currentChart;
    }
    
    function updateChart(chart, newData) {
        if (chart) {
            chart.data.datasets[0].data = newData;
            chart.update();
        }
    }
    
    return { createDoughnutChart, updateChart };
})();

// ============================================
// Map Service
// ============================================
const MapService = (function() {
    let maps = {};
    
    function initMiniMap(containerId, center = [22.5726, 78.389], zoom = 5) {
        if (maps.miniMap) {
            maps.miniMap.remove();
        }
        
        maps.miniMap = L.map(containerId).setView(center, zoom);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
            subdomains: 'abcd'
        }).addTo(maps.miniMap);
        
        // Add marker points
        const hotspots = [
            { coords: [28.6139, 77.2090], name: 'Delhi NCR', color: '#38bdf8' },
            { coords: [19.0760, 72.8777], name: 'Mumbai', color: '#818cf8' },
            { coords: [22.7196, 75.8577], name: 'Indore', color: '#34d399' }
        ];
        
        hotspots.forEach(hotspot => {
            L.marker(hotspot.coords)
                .addTo(maps.miniMap)
                .bindPopup(`<b>${hotspot.name}</b><br>High voter activity`);
        });
        
        return maps.miniMap;
    }
    
    function initFullMap(containerId, center = [23.2599, 77.4126], zoom = 5) {
        if (maps.fullMap) {
            maps.fullMap.remove();
        }
        
        maps.fullMap = L.map(containerId).setView(center, zoom);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: 'Election GeoReference'
        }).addTo(maps.fullMap);
        
        // Add constituency booths
        const booths = [
            [28.7041, 77.1025, 'New Delhi'],
            [22.7196, 75.8577, 'Indore'],
            [12.9716, 77.5946, 'Bangalore South'],
            [26.8467, 80.9462, 'Lucknow']
        ];
        
        booths.forEach(booth => {
            L.circleMarker(booth.slice(0, 2), {
                radius: 8,
                color: '#38bdf8',
                fillColor: '#38bdf8',
                fillOpacity: 0.6,
                weight: 2
            }).addTo(maps.fullMap)
              .bindPopup(`<b>${booth[2]}</b><br>EVM Unit Active<br>Turnout: 70%+`);
        });
        
        return maps.fullMap;
    }
    
    function invalidateMap(map) {
        if (map) {
            setTimeout(() => map.invalidateSize(), 100);
        }
    }
    
    return { initMiniMap, initFullMap, invalidateMap };
})();

// ============================================
// UI Components
// ============================================
const UIComponents = (function() {
    let currentView = 'dashboard';
    
    function renderSidebar() {
        return `
            <div class="logo-container">
                <div class="flag-indicator"></div>
                <span class="logo-text">ElectionGuide<span style="color:#38bdf8">Pro</span></span>
            </div>
            <nav class="nav-menu">
                <div class="nav-item ${currentView === 'dashboard' ? 'active' : ''}" data-view="dashboard">
                    <i class="fas fa-chart-pie"></i>
                    <span>Intelligence Hub</span>
                </div>
                <div class="nav-item ${currentView === 'evm' ? 'active' : ''}" data-view="evm">
                    <i class="fas fa-microchip"></i>
                    <span>EVM Secure Demo</span>
                </div>
                <div class="nav-item ${currentView === 'mapview' ? 'active' : ''}" data-view="mapview">
                    <i class="fas fa-map-marked-alt"></i>
                    <span>Geo Booth Monitor</span>
                </div>
            </nav>
            <div class="insights-panel">
                <div class="section-header">
                    <i class="fas fa-bolt"></i>
                    <span>QUICK INSIGHTS</span>
                </div>
                <div class="insight-card" data-insight="turnout">
                    <div class="insight-icon"><i class="fas fa-chart-line" style="color:#34d399"></i></div>
                    <span>📊 Turnout: 68.4%</span>
                </div>
                <div class="insight-card" data-insight="security">
                    <div class="insight-icon"><i class="fas fa-shield-alt" style="color:#facc15"></i></div>
                    <span>🛡️ EVM V4.2 Encrypted</span>
                </div>
                <div class="insight-card" data-insight="schedule">
                    <div class="insight-icon"><i class="fas fa-calendar-week"></i></div>
                    <span>🗓️ Phase 7: Counting</span>
                </div>
                <div class="insight-card" data-insight="predict">
                    <div class="insight-icon"><i class="fas fa-robot"></i></div>
                    <span>🤖 AI Swing Predictor</span>
                </div>
            </div>
            <div id="log-feed" class="log-feed"></div>
        `;
    }
    
    function renderDashboard(state) {
        const electionData = state.get('electionData');
        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${electionData.totalSeats}</div>
                    <div class="stat-label">LOK SABHA SEATS</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${electionData.totalVoters}</div>
                    <div class="stat-label">ELECTORS</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${electionData.alliances.nda}</div>
                    <div class="stat-label">NDA LEADING</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${electionData.alliances.india}</div>
                    <div class="stat-label">INDIA ALLIANCE</div>
                </div>
            </div>
            <div class="double-grid">
                <div class="glass-card">
                    <h3><i class="fas fa-chart-simple"></i> Coalition Projection</h3>
                    <div class="chart-container">
                        <canvas id="allianceChart" height="200"></canvas>
                    </div>
                    <p style="font-size:0.75rem; text-align:center; margin-top:12px;">
                        <span class="status-badge success">Live</span> Updated in real-time
                    </p>
                </div>
                <div class="glass-card">
                    <div class="mic-container">
                        <div id="micButton" class="mic-button">
                            <i class="fas fa-microphone-alt"></i>
                        </div>
                        <p style="font-size:0.75rem; color:#94a3b8;">
                            🎙️ AI Election Summary | Tap to hear live briefing
                        </p>
                    </div>
                    <div style="background:#0f172a; border-radius:20px; padding:16px;">
                        <h4 style="font-size:0.85rem;"><i class="fas fa-brain"></i> Contextual Assistant</h4>
                        <p id="assistantMessage" style="font-size:0.8rem; margin-top:8px;">
                            Hello, I'm ElectionGuide AI. I provide real-time election updates, security insights, and EVM simulations. Tap the microphone for a full briefing.
                        </p>
                    </div>
                </div>
            </div>
            <div class="glass-card">
                <h4><i class="fas fa-map"></i> Hotspot Constituency Tracker</h4>
                <div id="miniMap" class="map-container"></div>
            </div>
        `;
    }
    
    function renderEVM(state) {
        const evmCounts = state.get('evmCounts');
        return `
            <div class="glass-card">
                <h2><i class="fas fa-vote-yield"></i> Virtual EVM (Secure Election Simulator)</h2>
                <p style="font-size:0.75rem; margin-bottom:20px;">
                    🔒 Secure ballot unit | One tap = one vote | Audible beep + visual confirmation
                </p>
                <div class="evm-container">
                    <div class="candidate-row">
                        <span><i class="fas fa-flag-checkered"></i> <strong>National Democratic Alliance (NDA)</strong></span>
                        <div id="lampNDA" class="party-lamp"></div>
                        <button class="evm-button" data-party="NDA" data-index="0">CAST VOTE</button>
                    </div>
                    <div class="candidate-row">
                        <span><i class="fas fa-hand-fist"></i> <strong>INDIA Alliance</strong></span>
                        <div id="lampINDIA" class="party-lamp"></div>
                        <button class="evm-button" data-party="INDIA" data-index="1">CAST VOTE</button>
                    </div>
                    <div class="candidate-row">
                        <span><i class="fas fa-balance-scale"></i> <strong>Other Regional + Independents</strong></span>
                        <div id="lampOTHER" class="party-lamp"></div>
                        <button class="evm-button" data-party="OTHER" data-index="2">CAST VOTE</button>
                    </div>
                </div>
                <div style="margin-top:24px; background:#020617; border-radius:24px; padding:16px;">
                    <p><i class="fas fa-chart-simple"></i> Simulated Booth Tally (Real-time):</p>
                    <div style="display: flex; gap: 16px; justify-content: space-between; flex-wrap: wrap; margin-top:12px;">
                        <span>🔵 NDA: <strong id="simNDA">${evmCounts[0]}</strong></span>
                        <span>🟣 INDIA: <strong id="simINDIA">${evmCounts[1]}</strong></span>
                        <span>🟢 OTHERS: <strong id="simOTH">${evmCounts[2]}</strong></span>
                    </div>
                    <button id="resetEVMBtn" class="evm-button" style="margin-top:16px; background:#334155;">Reset Booth Unit</button>
                </div>
            </div>
        `;
    }
    
    function renderMapView() {
        return `
            <div class="glass-card">
                <h3><i class="fas fa-location-dot"></i> Constituency Watch | Interactive Booth Map</h3>
                <div id="fullMapView" class="map-container map-full"></div>
                <div class="stats-grid" style="grid-template-columns: repeat(3,1fr); margin-top:16px;">
                    <div class="stat-card">
                        <div class="stat-number">78%</div>
                        <div class="stat-label">Booth Turnout</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">Active</div>
                        <div class="stat-label">EVM Unit Status</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">12</div>
                        <div class="stat-label">Micro Observers</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    return { renderSidebar, renderDashboard, renderEVM, renderMapView };
})();

// ============================================
// Event Handlers
// ============================================
const EventHandlers = (function() {
    let state = null;
    
    function initialize(stateManager) {
        state = stateManager;
        
        // Navigation handlers
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const view = item.dataset.view;
                if (view) switchView(view);
            });
        });
        
        // Insight card handlers
        document.querySelectorAll('.insight-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const insight = card.dataset.insight;
                if (insight) handleInsight(insight);
            });
        });
    }
    
    async function switchView(view) {
        const mainContainer = document.getElementById('mainContainer');
        if (!mainContainer) return;
        
        state.set('activeView', view);
        
        let content = '';
        switch(view) {
            case 'dashboard':
                content = UIComponents.renderDashboard(state);
                break;
            case 'evm':
                content = UIComponents.renderEVM(state);
                break;
            case 'mapview':
                content = UIComponents.renderMapView();
                break;
            default:
                content = UIComponents.renderDashboard(state);
        }
        
        mainContainer.innerHTML = content;
        Logger.addLog(`Switched to ${view} view`, 'info');
        
        // Re-initialize components based on view
        if (view === 'dashboard') {
            initializeDashboardComponents();
        } else if (view === 'evm') {
            initializeEVMComponents();
        } else if (view === 'mapview') {
            initializeMapComponents();
        }
        
        // Update active nav state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === view);
        });
    }
    
    function initializeDashboardComponents() {
        const electionData = state.get('electionData');
        const allianceData = [electionData.alliances.nda, electionData.alliances.india, electionData.alliances.others];
        
        ChartService.createDoughnutChart('allianceChart', allianceData, ['NDA Alliance', 'INDIA Bloc', 'Others'], ['#38bdf8', '#818cf8', '#34d399']);
        MapService.initMiniMap('miniMap');
        
        const micButton = document.getElementById('micButton');
        if (micButton) {
            micButton.addEventListener('click', handleVoiceReport);
        }
    }
    
    function initializeEVMComponents() {
        document.querySelectorAll('.evm-button[data-party]').forEach(btn => {
            btn.addEventListener('click', () => handleEVMCast(btn.dataset.party, parseInt(btn.dataset.index)));
        });
        
        const resetBtn = document.getElementById('resetEVMBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', handleEVMReset);
        }
    }
    
    function initializeMapComponents() {
        MapService.initFullMap('fullMapView');
    }
    
    async function handleVoiceReport() {
        const micButton = document.getElementById('micButton');
        const electionData = state.get('electionData');
        
        micButton.classList.add('active');
        
        const reportText = `Election Guide Pro AI Report. National Democratic Alliance is currently leading in ${electionData.alliances.nda} seats, while the INDIA alliance is at ${electionData.alliances.india} seats. Total voter turnout is 68.4 percent across major constituencies. The EVM simulation demonstrates secure and transparent voting mechanisms.`;
        
        await AudioService.speak(reportText);
        
        micButton.classList.remove('active');
        Logger.addLog('Voice report delivered successfully', 'success');
    }
    
    async function handleEVMCast(party, index) {
        const lampId = `lamp${party}`;
        const lamp = document.getElementById(lampId);
        
        if (lamp) {
            lamp.classList.add('active');
            await AudioService.playBeep(880, 0.3);
            
            const evmCounts = state.get('evmCounts');
            evmCounts[index] += 1;
            state.set('evmCounts', evmCounts);
            
            updateEVMTally();
            Logger.addLog(`Vote cast for ${party} via Virtual EVM`, 'success');
            
            setTimeout(() => lamp.classList.remove('active'), 400);
        }
    }
    
    function updateEVMTally() {
        const evmCounts = state.get('evmCounts');
        const elements = ['simNDA', 'simINDIA', 'simOTH'];
        elements.forEach((id, idx) => {
            const el = document.getElementById(id);
            if (el) el.innerText = evmCounts[idx];
        });
    }
    
    function handleEVMReset() {
        state.set('evmCounts', [128, 112, 43]);
        updateEVMTally();
        Logger.addLog('EVM booth simulator reset to baseline', 'info');
    }
    
    function handleInsight(type) {
        const insights = {
            turnout: { msg: '📈 Voter Turnout: 68.4% overall. Urban: 72%, Rural: 65%', log: 'Turnout analysis requested' },
            security: { msg: '🔒 Security Protocol: Voter Verifiable Paper Audit Trail (VVPAT) integrated. M3 encryption active.', log: 'Security protocol consulted' },
            schedule: { msg: '📅 Election Calendar: Phase 7 concluded. Counting ongoing. Final results expected within 72 hours.', log: 'Schedule information accessed' },
            predict: { msg: '🧠 AI FORECAST: Based on sentiment analysis, NDA expected to reach 310-315 seats, INDIA bloc 210-220.', log: 'AI prediction model consulted' }
        };
        
        const insightData = insights[type];
        if (insightData) {
            alert(insightData.msg);
            Logger.addLog(insightData.log, 'info');
        }
    }
    
    return { initialize, switchView };
})();

// ============================================
// Application Bootstrap
// ============================================
class ElectionApp {
    constructor() {
        this.state = AppState.getInstance();
        this.isInitialized = false;
    }
    
    async init() {
        if (this.isInitialized) return;
        
        try {
            // Render initial UI
            this.renderApp();
            
            // Initialize event handlers
            EventHandlers.initialize(this.state);
            
            // Set up real-time updates
            this.setupRealTimeUpdates();
            
            // Hide loading screen
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
            
            this.isInitialized = true;
            Logger.addLog('Election Guide Pro initialized successfully', 'success');
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            Logger.addLog(`Initialization error: ${error.message}`, 'error');
        }
    }
    
    renderApp() {
        const appContainer = document.getElementById('app');
        if (!appContainer) return;
        
        appContainer.innerHTML = `
            <div class="app-container">
                <aside class="sidebar">
                    ${UIComponents.renderSidebar()}
                </aside>
                <main class="main-content" id="mainContainer">
                    ${UIComponents.renderDashboard(this.state)}
                </main>
            </div>
        `;
        
        // Initialize dashboard components after render
        setTimeout(() => {
            const mainContainer = document.getElementById('mainContainer');
            if (mainContainer) {
                EventHandlers.switchView('dashboard');
            }
        }, 0);
    }
    
    setupRealTimeUpdates() {
        // Simulate real-time seat updates every 30 seconds
        setInterval(() => {
            const electionData = this.state.get('electionData');
            if (Math.random() > 0.7) {
                const change = Math.floor(Math.random() * 3) - 1;
                electionData.alliances.nda = Math.max(200, Math.min(400, electionData.alliances.nda + change));
                electionData.alliances.india = Math.max(150, Math.min(350, electionData.alliances.india - change));
                electionData.alliances.others = 543 - electionData.alliances.nda - electionData.alliances.india;
                
                this.state.set('electionData', electionData);
                
                // Update chart if on dashboard
                const currentView = this.state.get('activeView');
                if (currentView === 'dashboard') {
                    const allianceData = [electionData.alliances.nda, electionData.alliances.india, electionData.alliances.others];
                    const chart = ChartService.createDoughnutChart('allianceChart', allianceData, ['NDA', 'INDIA', 'Others'], ['#38bdf8', '#818cf8', '#34d399']);
                }
                
                Logger.addLog(`Live update: NDA ${electionData.alliances.nda} | INDIA ${electionData.alliances.india}`, 'info');
            }
        }, 30000);
        
        // Rotate assistant messages
        const messages = [
            "💡 Did you know? Tap Quick Insights for AI predictions.",
            "📢 EVM Demo: Try casting votes with realistic beep feedback.",
            "🗺️ Booth map shows active EVM units across key constituencies.",
            "🔒 All EVM transactions are encrypted and verifiable.",
            "🎙️ Voice AI provides live election summaries on demand."
        ];
        
        let msgIndex = 0;
        setInterval(() => {
            const msgElement = document.getElementById('assistantMessage');
            if (msgElement) {
                msgElement.innerHTML = messages[msgIndex % messages.length];
                msgIndex++;
            }
        }, 25000);
    }
}

// ============================================
// Start Application
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const app = new ElectionApp();
    app.init();
});
