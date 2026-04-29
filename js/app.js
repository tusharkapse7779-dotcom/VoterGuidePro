import { loadChart } from './chart.js';
import { loadMap } from './map.js';
import { castVote } from './evm.js';
import { triggerVoiceReport } from './voice.js';

window.castVote = castVote;
window.triggerVoiceReport = triggerVoiceReport;

window.onload = () => {
    loadChart();
    loadMap();
};
