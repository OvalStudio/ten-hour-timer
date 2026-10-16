const TOTAL_MS = 10 * 60 * 60 * 1000;
const TICK_ALARM = "ten-hour-timer-tick";
const FINISH_ALARM = "ten-hour-timer-finish";
const NOTIFICATION_ID = "ten-hour-timer-done";

chrome.runtime.onInstalled.addListener(async () => {
  const state = await chrome.storage.local.get(["remainingMs"]);
  if (typeof state.remainingMs !== "number") {
    await chrome.storage.local.set({ endTime: null, remainingMs: TOTAL_MS });
  }
  await ensureAlarms();
  await updateBadge();
});

chrome.runtime.onStartup.addListener(() => {
  ensureAlarms();
  updateBadge();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local" || !("endTime" in changes)) return;
  ensureAlarms();
  updateBadge();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === TICK_ALARM || alarm.name === FINISH_ALARM) {
    tick();
  }
});

async function ensureAlarms() {
  const { endTime } = await chrome.storage.local.get({ endTime: null });
  await chrome.alarms.clear(TICK_ALARM);
  await chrome.alarms.clear(FINISH_ALARM);
  if (endTime !== null && endTime > Date.now()) {
    chrome.alarms.create(TICK_ALARM, { periodInMinutes: 1 });
    chrome.alarms.create(FINISH_ALARM, { when: endTime });
  }
}

async function tick() {
  const { endTime, remainingMs } = await chrome.storage.local.get({
    endTime: null,
    remainingMs: TOTAL_MS,
  });

  if (endTime === null) {
    await updateBadge();
    return;
  }

  const remaining = endTime - Date.now();
  if (remaining <= 0) {
    await chrome.storage.local.set({ endTime: null, remainingMs: 0 });
    await updateBadge();
    chrome.notifications.create(NOTIFICATION_ID, {
      type: "basic",
      iconUrl: "icons/icon128.png",
      title: "Ten Hour Timer",
      message: "Time's up — your 10 hour timer has finished.",
      priority: 2,
    });
  } else {
    await updateBadge();
  }
}

async function updateBadge() {
  const { endTime, remainingMs } = await chrome.storage.local.get({
    endTime: null,
    remainingMs: TOTAL_MS,
  });

  const remaining = endTime === null ? remainingMs : endTime - Date.now();

  if (remaining <= 0 && endTime === null && remainingMs <= 0) {
    chrome.action.setBadgeBackgroundColor({ color: "#ef4444" });
    chrome.action.setBadgeText({ text: "0h00" });
    return;
  }

  if (endTime === null) {
    chrome.action.setBadgeText({ text: "" });
    return;
  }

  const totalMinutes = Math.max(0, Math.ceil(remaining / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  chrome.action.setBadgeBackgroundColor({ color: "#0ea5e9" });
  chrome.action.setBadgeText({ text: `${hours}h${String(minutes).padStart(2, "0")}` });
}
