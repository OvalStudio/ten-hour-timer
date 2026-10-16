const TOTAL_MS = 10 * 60 * 60 * 1000;

const timeEl = document.getElementById("time");
const statusEl = document.getElementById("status");
const progressEl = document.getElementById("progress");
const ringEl = document.querySelector(".ring");
const startBtn = document.getElementById("start");
const resetBtn = document.getElementById("reset");

let endTime = null;
let remainingMs = TOTAL_MS;
let ready = false;

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

let lastBadge = null;

function setBadge(remaining, running) {
  let text = "";
  if (running) {
    const totalMinutes = Math.ceil(remaining / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    chrome.action.setBadgeBackgroundColor({ color: "#0ea5e9" });
    text = `${hours}h${String(minutes).padStart(2, "0")}`;
  } else if (remaining <= 0) {
    chrome.action.setBadgeBackgroundColor({ color: "#ef4444" });
    text = "0h00";
  }
  if (text === lastBadge) return;
  lastBadge = text;
  chrome.action.setBadgeText({ text });
}

async function persist() {
  await chrome.storage.local.set({ endTime, remainingMs });
}

function finish() {
  endTime = null;
  remainingMs = 0;
  persist();
}

function render() {
  if (!ready) return;

  let remaining = getRemaining();
  if (endTime !== null && remaining <= 0) {
    finish();
    remaining = 0;
  }

  const running = endTime !== null && remaining > 0;

  timeEl.textContent = formatTime(remaining);
  progressEl.style.strokeDashoffset = String(100 - (remaining / TOTAL_MS) * 100);
  ringEl.classList.toggle("finished", remaining <= 0);
  statusEl.classList.remove("running", "finished");

  if (running) {
    statusEl.textContent = `Ends at ${formatEndTime(endTime)}`;
    statusEl.classList.add("running");
  } else if (remaining <= 0) {
    statusEl.textContent = "Time's up!";
    statusEl.classList.add("finished");
  } else {
    statusEl.textContent = "Ready";
  }

  startBtn.disabled = running;
  setBadge(remaining, running);
}

startBtn.addEventListener("click", () => {
  let remaining = getRemaining();
  if (endTime !== null && remaining > 0) return;
  if (remaining <= 0) remaining = TOTAL_MS;
  endTime = Date.now() + remaining;
  remainingMs = remaining;
  persist();
  render();
});

resetBtn.addEventListener("click", () => {
  endTime = null;
  remainingMs = TOTAL_MS;
  persist();
  render();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if ("endTime" in changes) endTime = changes.endTime.newValue;
  if ("remainingMs" in changes) remainingMs = changes.remainingMs.newValue;
  render();
});

chrome.storage.local.get({ endTime: null, remainingMs: TOTAL_MS }, (state) => {
  endTime = state.endTime;
  remainingMs = state.remainingMs;
  ready = true;
  render();
  setInterval(render, 250);
});
