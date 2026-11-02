# Ten Hour Timer

A long countdown timer for Chrome — set any duration up to 99 hours, keep counting down with the popup closed, and get pinged when time's up.

Ten Hour Timer is a countdown timer for long stretches: a work session, study block, laundry cycle, slow-cooker recipe, or anything else that outgrows the minutes you'd normally watch on your phone. Open the popup, set hours and minutes, and press **Start** — an analog-style progress ring plus a live `HH:MM:SS` display do the counting. Because the countdown is anchored to a stored end timestamp (not a live stopwatch), it stays accurate while the popup is closed, while Chrome restarts, and across days. It defaults to its namesake 10 hours, but any duration works.

## Features

- **Countdown from any duration** — type hours (0–99) and minutes (0–59) into the popup; the display, progress ring, and toolbar badge all update live.
- **Start / Pause / Resume / Reset** — pausing freezes the countdown and stores the exact remaining time, so the Start button turns into **Resume** and picks up precisely where you left off. Reset stops the timer and returns to your configured duration.
- **Survives everything** — the countdown is stored as an end timestamp in `chrome.storage.local`, so closing the popup, switching tabs or windows, or restarting Chrome doesn't lose it.
- **Toolbar badge** — remaining time shows as `XhMM` on the extension icon: blue while running, amber while paused, red `0h00` when time is up.
- **"Ends at" status** — while running, the popup shows the clock time the countdown will finish, so you know when without doing math.
- **Finish notification** — a desktop notification ("Time's up — your Xh Ym timer has completed.") fires when the countdown hits zero, even if the popup has been closed for hours.
- **Remembered duration** — your hours/minutes inputs are saved, so after the timer finishes (or an accidental reset) one click on Start reruns the same duration.
- **Offline by design** — no network requests, no tracking, no analytics.

## Install (desktop Chrome)

1. Download or clone this repository.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and select this folder.
5. Click the Ten Hour Timer icon in your toolbar and set a duration.

## Usage

1. Click the toolbar icon to open the popup.
2. Type a duration into the **hrs** and **min** fields (it starts at `10:00:00`).
3. Press **Start**. The ring fills backwards and the status line shows "Ends at <time>".
4. Press **Pause** to freeze the countdown — the button becomes **Resume** and the badge turns amber. Press **Resume** to continue from the exact moment you paused.
5. Press **Reset** to stop and return to your configured duration.
6. Close the popup whenever you like: the timer keeps counting, the badge keeps showing remaining time, and a notification appears when it finishes. Reopen the popup at any time to see the live countdown.

## Privacy

- Only "storage", "alarms", and "notifications" permissions are used — there are no host permissions and no content scripts, so the extension never touches any web page.
- The only data stored is the timer's own state (end timestamp, remaining/total milliseconds, paused flag, and your hours/minutes inputs) in `chrome.storage.local` on your machine.
- No network requests are made, nothing is uploaded, and there is no tracking, analytics, or advertising.

## How it works

A Manifest V3 extension with two moving parts:

- **Popup** (`popup.html` / `popup.js`) — the UI: SVG progress ring, live time display, duration inputs, and Start/Pause/Reset buttons. Every state change is persisted to `chrome.storage.local`, and the popup re-renders from storage on open (and every 250 ms while open), so it's always in sync with the real countdown.
- **Background service worker** (`background.js`) — owns a pair of Chrome alarms: a repeating tick every minute and a finish alarm set exactly at the configured end time. The tick keeps the toolbar badge accurate while the popup is closed; the finish alarm fires the "Time's up" notification. Alarms are recreated from the stored end timestamp on startup and install, so the timer picks up seamlessly after Chrome restarts.

## Files

```
manifest.json    MV3 manifest: action popup, service worker, storage/alarms/notifications permissions
popup.html       Popup UI: ring, timer display, duration inputs, action buttons
popup.css        Popup styling
popup.js         Countdown state machine, rendering, badge in popup, storage persistence
background.js    Service worker: alarms, toolbar badge, finish notification
icons/           Toolbar and extension icons (16/32/48/128 px)
```
