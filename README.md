# Ten Hour Timer

A dead-simple countdown timer for Chrome. Set your hours and minutes, press **Start**, and it counts backwards with a progress ring and live `HH:MM:SS` display. Defaults to 10 hours. Press **Reset** to stop and go back to the duration you set.

## Features

- Count down from any duration you type in (defaults to `10:00:00`)
- Set hours & minutes once — they're remembered, so after an accidental **Reset** one click on **Start** runs your exact duration again
- Only two buttons: **Start** and **Reset**
- Keeps running when the popup is closed, when you switch tabs or windows, and even if Chrome restarts — the countdown is based on a stored end timestamp, never a live stopwatch
- Remaining time shows as a badge on the toolbar icon
- Desktop notification when the timer finishes
- Offline, no tracking, no network requests

## Install (desktop Chrome)

1. Download or clone this repository.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and select the `ten-hour-timer` folder.
5. Click the timer icon in your toolbar — you're done.

## How it works

- The timer stores an end timestamp in `chrome.storage.local`, so the countdown is accurate even while the popup is closed.
- A background service worker updates the toolbar badge once a minute and fires a notification when time is up.

## Files

```
manifest.json    Chrome extension manifest (MV3)
popup.html       Timer UI
popup.css        Styles
popup.js         Countdown logic + UI state
background.js    Badge updates + finish notification
icons/           Toolbar and store icons
```
