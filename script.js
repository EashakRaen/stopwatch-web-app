// ---------- Elements ----------
const timeEl = document.getElementById("time");
const centiEl = document.getElementById("centi");
const statusEl = document.getElementById("status");
const dial = document.getElementById("dial");
const toggleBtn = document.getElementById("toggleBtn");
const lapBtn = document.getElementById("lapBtn");
const resetBtn = document.getElementById("resetBtn");
const lapList = document.getElementById("lapList");
const lapHead = document.getElementById("lapHead");
const lapStats = document.getElementById("lapStats");
const emptyMsg = document.getElementById("emptyMsg");
const bestEl = document.getElementById("bestLap");
const avgEl = document.getElementById("avgLap");
const worstEl = document.getElementById("worstLap");

// ---------- State ----------
let startTime = 0;
let elapsed = 0;
let timerId = null;
let lastLapTotal = 0;
let laps = [];

// ---------- Helpers ----------
const pad = n => String(n).padStart(2, "0");

function split(ms) {
    return {
        h: Math.floor(ms / 3600000),
        m: Math.floor(ms / 60000) % 60,
        s: Math.floor(ms / 1000) % 60,
        c: Math.floor(ms / 10) % 100
    };
}

function formatShort(ms) {
    const { h, m, s, c } = split(ms);
    const base = `${pad(m)}:${pad(s)}.${pad(c)}`;
    return h > 0 ? `${h}:${base}` : base;
}

function isRunning() {
    return timerId !== null;
}

// ---------- Display ----------
function render() {
    const { h, m, s, c } = split(elapsed);
    timeEl.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
    centiEl.textContent = "." + pad(c);
    dial.style.setProperty("--deg", ((elapsed % 60000) / 60000) * 360 + "deg");
}

function updateButtons() {
    const running = isRunning();

    toggleBtn.textContent = running ? "Pause" : (elapsed > 0 ? "Resume" : "Start");
    toggleBtn.className = "btn " + (running ? "btn-pause" : "btn-start");

    lapBtn.disabled = !running;
    resetBtn.disabled = !running && elapsed === 0;

    statusEl.textContent = running ? "Running" : (elapsed > 0 ? "Paused" : "Ready");
    dial.classList.toggle("running", running);
}

// ---------- Stopwatch functions ----------
function tick() {
    elapsed = performance.now() - startTime;
    render();
    document.title = `${timeEl.textContent}${centiEl.textContent} | Stopwatch`;
}

function startPause() {
    if (isRunning()) {
        clearInterval(timerId);
        timerId = null;
        elapsed = performance.now() - startTime;
        render();
    } else {
        startTime = performance.now() - elapsed;
        timerId = setInterval(tick, 10);
    }
    updateButtons();
}

function reset() {
    clearInterval(timerId);
    timerId = null;
    elapsed = 0;
    lastLapTotal = 0;
    laps = [];
    document.title = "Chronos | Online Stopwatch";
    render();
    renderLaps();
    updateButtons();
}

function addLap() {
    if (!isRunning()) return;

    const total = elapsed;
    laps.push({ n: laps.length + 1, lap: total - lastLapTotal, total });
    lastLapTotal = total;
    renderLaps();
}

// ---------- Lap list ----------
function renderLaps() {
    lapList.innerHTML = "";
    emptyMsg.hidden = laps.length > 0;
    lapHead.hidden = laps.length === 0;
    lapStats.hidden = laps.length < 2;

    let best = null, worst = null;
    if (laps.length >= 2) {
        const times = laps.map(l => l.lap);
        best = Math.min(...times);
        worst = Math.max(...times);
        const avg = times.reduce((a, b) => a + b, 0) / times.length;

        bestEl.textContent = formatShort(best);
        worstEl.textContent = formatShort(worst);
        avgEl.textContent = formatShort(avg);
    }

    [...laps].reverse().forEach(l => {
        const li = document.createElement("li");
        if (l.lap === best) li.className = "best";
        else if (l.lap === worst) li.className = "worst";

        li.innerHTML = `<span>Lap ${l.n}</span>
                        <span>${formatShort(l.lap)}</span>
                        <span>${formatShort(l.total)}</span>`;
        lapList.appendChild(li);
    });
}

// ---------- Events ----------
toggleBtn.addEventListener("click", startPause);
lapBtn.addEventListener("click", addLap);
resetBtn.addEventListener("click", reset);

// Keyboard shortcuts: Space = start/pause, L = lap, R = reset
document.addEventListener("keydown", e => {
    if (e.target.closest("button") && e.code === "Space") return;

    if (e.code === "Space") {
        e.preventDefault();
        startPause();
    } else if (e.key.toLowerCase() === "l") {
        addLap();
    } else if (e.key.toLowerCase() === "r") {
        reset();
    }
});

// ---------- Initial state ----------
render();
updateButtons();
renderLaps();