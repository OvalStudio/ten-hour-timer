const DEFAULT_HOURS = 10;
const DEFAULT_MINUTES = 0;

const timeEl = document.getElementById("time");
const statusEl = document.getElementById("status");
const progressEl = document.getElementById("progress");
const ringEl = document.querySelector(".ring");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const resetBtn = document.getElementById("reset");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");

let endTime = null;
let remainingMs = null;
let totalMs = null;
let paused = false;
let ready = false;
let lastBadge = null;

function readInt(el, max) {
  const n = parseInt(el.value, 10);
  if (Number.isNaN(n) || n < 0) return 0;
  return Math.min(n, max);
}

function inputTotalMs() {
  const hours = readInt(hoursEl, 99);
  const minutes = readInt(minutesEl, 59);
  return (hours * 3600 + minutes * 60) * 1000;
}

function getRemaining() {
  if (endTime !== null) {
    return Math.max(0, endTime - Date.now());
  }
  return remainingMs;
}

function formatTime(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, "0")).join(":");
}

function formatEndTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function badgeText(remaining) {
  const totalMinutes = Math.max(0, Math.ceil(remaining / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h${String(minutes).padStart(2, "0")}`;
}

function setBadge(remaining, running, isPaused) {
  let text = "";
  if (running) {
    chrome.action.setBadgeBackgroundColor({ color: "#0ea5e9" });
    text = badgeText(remaining);
  } else if (isPaused) {
    chrome.action.setBadgeBackgroundColor({ color: "#f59e0b" });
    text = badgeText(remaining);
  } else if (remaining <= 0) {
    chrome.action.setBadgeBackgroundColor({ color: "#ef4444" });
    text = "0h00";
  }
  if (text === lastBadge) return;
  lastBadge = text;
  chrome.action.setBadgeText({ text });
}

function persist() {
  return chrome.storage.local.set({
    endTime,
    remainingMs,
    totalMs,
    paused,
    hours: readInt(hoursEl, 99),
    minutes: readInt(minutesEl, 59),
  });
}

function finish() {
  endTime = null;
  remainingMs = 0;
  paused = false;
  persist();
}

function render() {
  if (!ready) return;

  let remaining = getRemaining();
  if (endTime !== null && remaining <= 0) {
    finish();
    remaining = 0;
  }

  const running = endTime !== null;
  const isPaused = !running && paused && remaining > 0;
  const configured = inputTotalMs();
  const denominator = running || isPaused ? totalMs || configured || 1 : configured > 0 ? configured : 1;

  timeEl.textContent = formatTime(remaining);
  progressEl.style.strokeDashoffset = String(100 - Math.min(1, remaining / denominator) * 100);
  ringEl.classList.toggle("finished", remaining <= 0 && configured > 0);
  statusEl.classList.remove("running", "paused", "finished");

  if (running) {
    statusEl.textContent = `Ends at ${formatEndTime(endTime)}`;
    statusEl.classList.add("running");
  } else if (isPaused) {
    statusEl.textContent = "Paused";
    statusEl.classList.add("paused");
  } else if (remaining <= 0 && configured > 0) {
    statusEl.textContent = "Time's up!";
    statusEl.classList.add("finished");
  } else if (configured <= 0) {
    statusEl.textContent = "Set a duration";
    statusEl.classList.add("finished");
  } else {
    statusEl.textContent = "Ready";
  }

  hoursEl.disabled = running;
  minutesEl.disabled = running;
  startBtn.textContent = isPaused ? "Resume" : "Start";
  startBtn.disabled = running || (!isPaused && configured <= 0);
  pauseBtn.disabled = !running;
  setBadge(remaining, running, isPaused);
}

function onDurationInput() {
  if (endTime === null) {
    const configured = inputTotalMs();
    remainingMs = configured;
    totalMs = configured;
    paused = false;
    persist();
  }
  render();
}

startBtn.addEventListener("click", () => {
  if (endTime !== null) return;
  if (paused && remainingMs > 0) {
    endTime = Date.now() + remainingMs;
    paused = false;
  } else {
    const configured = inputTotalMs();
    if (configured <= 0) return;
    remainingMs = configured;
    totalMs = configured;
    endTime = Date.now() + configured;
  }
  lastBadge = null;
  persist();
  render();
});

pauseBtn.addEventListener("click", () => {
  if (endTime === null) return;
  remainingMs = Math.max(0, endTime - Date.now());
  endTime = null;
  paused = remainingMs > 0;
  lastBadge = null;
  persist();
  render();
});

resetBtn.addEventListener("click", () => {
  const configured = inputTotalMs();
  endTime = null;
  remainingMs = configured;
  totalMs = configured;
  paused = false;
  lastBadge = null;
  persist();
  render();
});

hoursEl.addEventListener("input", onDurationInput);
minutesEl.addEventListener("input", onDurationInput);

hoursEl.addEventListener("blur", () => {
  hoursEl.value = String(readInt(hoursEl, 99));
  onDurationInput();
});

minutesEl.addEventListener("blur", () => {
  minutesEl.value = String(readInt(minutesEl, 59));
  onDurationInput();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if ("endTime" in changes) endTime = changes.endTime.newValue;
  if ("remainingMs" in changes) remainingMs = changes.remainingMs.newValue;
  if ("totalMs" in changes) totalMs = changes.totalMs.newValue;
  if ("paused" in changes) paused = !!changes.paused.newValue;
  render();
});

chrome.storage.local.get(
  {
    endTime: null,
    remainingMs: null,
    totalMs: null,
    paused: false,
    hours: DEFAULT_HOURS,
    minutes: DEFAULT_MINUTES,
  },
  (state) => {
    endTime = state.endTime;
    paused = !!state.paused;
    hoursEl.value = String(state.hours);
    minutesEl.value = String(state.minutes);
    const configured = inputTotalMs();
    totalMs = state.totalMs ?? configured;
    remainingMs = state.remainingMs ?? configured;
    ready = true;
    render();
    setInterval(render, 250);
  }
);
