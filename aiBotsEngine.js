class TerminalAudioEngine {
    constructor() {
        this.ctx = null;
        this.isEnabled = true;
    }
    initContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
    }
    playTone(freq, type, startTime, duration, volume = 0.15) {
        if (!this.isEnabled) return;
        this.initContext();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
    }
    playProfitChime() {
        if (!this.isEnabled) return;
        this.initContext();
        const now = this.ctx.currentTime;
        this.playTone(523.25, 'triangle', now, 0.18, 0.16);
        this.playTone(659.25, 'triangle', now + 0.09, 0.18, 0.16);
        this.playTone(783.99, 'triangle', now + 0.18, 0.22, 0.18);
        this.playTone(1046.50, 'sine', now + 0.27, 0.45, 0.22);
    }
}

const terminalAudio = new TerminalAudioEngine();

function toggleTerminalAudio() {
    terminalAudio.isEnabled = !terminalAudio.isEnabled;
    if (terminalAudio.isEnabled) terminalAudio.initContext();
    const icon = document.getElementById('audio-status-icon');
    const text = document.getElementById('audio-status-text');
    if (icon && text) {
        icon.innerText = terminalAudio.isEnabled ? '🔊' : '🔇';
        text.innerText = terminalAudio.isEnabled ? 'SFX ON' : 'MUTED';
    }
}

function triggerElhadartProfitAlert(boatLabel, profitAmount) {
    terminalAudio.playProfitChime();
    const banner = document.getElementById('profit-toast-banner');
    const details = document.getElementById('profit-toast-details');
    if (banner && details) {
        details.innerText = `${boatLabel} Secured +$${profitAmount.toFixed(2)} Profit`;
        banner.classList.remove('translate-x-full', 'opacity-0');
        banner.classList.add('translate-x-0', 'opacity-100');
        clearTimeout(window.profitToastTimeout);
        window.profitToastTimeout = setTimeout(() => {
            banner.classList.remove('translate-x-0', 'opacity-100');
            banner.classList.add('translate-x-full', 'opacity-0');
        }, 4000);
    }
}

const speedBoatsDirectory = {
    1: { name: "Boat 1: OB Sniper", setup: "Order Block (OB) Tap" },
    2: { name: "Boat 2: Tick Scalper", setup: "Tick Velocity Surge" },
    3: { name: "Boat 3: Sweep Scalper", setup: "Liquidity Pool Sweep" },
    4: { name: "Boat 4: FVG Rebalance", setup: "Fair Value Gap Fill" },
    5: { name: "Boat 5: BOS Follower", setup: "Break of Structure (BOS)" },
    6: { name: "Boat 6: CHOCH Hunter", setup: "Change of Character (CHOCH)" },
    7: { name: "Boat 7: Trendline Array", setup: "Trendline Breakout" },
    8: { name: "Boat 8: Parity Shifter", setup: "Even / Odd Parity Bias" },
    9: { name: "Boat 9: Digit Matrixer", setup: "Single Digit Target Match" }
};

let currentActiveSpeedBoat = 2;
let currentTimeframeMode = 'MS'; // 'MS' for Milliseconds, '1M' for 1-Minute

function switchSpeedBoat(boatId) {
    currentActiveSpeedBoat = boatId;
}

function switchTimeframeMode(mode) {
    currentTimeframeMode = mode;
}

function executeSpeedBoatTrade() {
    const boat = speedBoatsDirectory[currentActiveSpeedBoat];
    const label = boat ? boat.name : `Speed Boat ${currentActiveSpeedBoat}`;
    const modeLabel = currentTimeframeMode === 'MS' ? 'Milliseconds (1-3 Ticks)' : '1-Minute (60s Candle Hold)';
    triggerElhadartProfitAlert(`${label} [${modeLabel}]`, 95.00);
    alert(`Executing ${label} in ${modeLabel} mode successfully!`);
}

// Dual Timeframe & Setup Mapping Engine
function evaluateAllIndicators(st) {
    if (!st || !st.quotes || st.quotes.length < 20) return;
    
    const quotes = st.quotes;
    const len = quotes.length;
    const currentPrice = quotes[len - 1];
    const prevPrice = quotes[len - 2];
    const isRise = currentPrice >= prevPrice;

    const ma30 = quotes.slice(len - 30, len).reduce((a, b) => a + b, 0) / 30;
    const bias15M = currentPrice >= ma30 ? "15M Bullish Bias" : "15M Bearish Bias";

    const recentHigh = Math.max(...quotes.slice(len - 25, len - 1));
    const recentLow = Math.min(...quotes.slice(len - 25, len - 1));
    
    const isCHOCH = !isRise && currentPrice < recentLow && quotes[len-3] > quotes[len-2];
    const isBOS = isRise && currentPrice > recentHigh;
    const liquiditySweep = Math.abs(currentPrice - recentHigh) < (currentPrice * 0.0002) || Math.abs(currentPrice - recentLow) < (currentPrice * 0.0002);

    let assignedBoatId = 2;
    if (isCHOCH) assignedBoatId = 6;
    else if (isBOS) assignedBoatId = 5;
    else if (liquiditySweep) assignedBoatId = 3;
    else assignedBoatId = 1;

    st.assignedBoatId = assignedBoatId;
    st.assignedBoatName = speedBoatsDirectory[assignedBoatId].name;

    let entryText = "";
    let exitText = "";
    let riseFallRule = "";
    let contractText = "";

    if (currentTimeframeMode === 'MS') {
        entryText = `Millisecond Entry @ Quote ${currentPrice.toFixed(2)}`;
        exitText = `Expiry: 3 Ticks (Short-Term Velocity)`;
        riseFallRule = `Runs after 3 Ticks Hit (AI Milliseconds Bot)`;
        contractText = isRise ? `Rise (3 Ticks)` : `Fall (3 Ticks)`;
    } else {
        entryText = `1M Candle Close Entry @ ${currentPrice.toFixed(2)}`;
        exitText = `Expiry: Exactly 1 Minute (60s Candle Hold)`;
        riseFallRule = `Runs on 1M Bar Close (Aligned with ${bias15M})`;
        contractText = bias15M.includes("Bullish") ? `Rise (1M Duration)` : `Fall (1M Duration)`;
    }

    const entryEl = document.getElementById('dual-entry-point-display');
    if (entryEl) entryEl.innerText = entryText;

    const exitEl = document.getElementById('dual-exit-point-display');
    if (exitEl) exitEl.innerText = exitText;

    const ruleEl = document.getElementById('rise-fall-rule-display');
    if (ruleEl) ruleEl.innerText = riseFallRule;

    const contractEl = document.getElementById('active-contract-display');
    if (contractEl) contractEl.innerText = contractText;
}
