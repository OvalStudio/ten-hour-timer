# Ten Hour Timer

A dead-simple 10-hour countdown timer for Chrome. Press **Start**, and it counts backwards from `10:00:00`. Press **Reset** to go back to ten hours. That's the whole UI — two buttons.

## Features

- 10-hour countdown with a progress ring and live `HH:MM:SS` display
- Only two buttons: **Start** and **Reset**
- Keeps running when the popup is closed — the remaining time shows as a badge on the toolbar icon
- Desktop notification when the timer finishes
- Survives browser restarts (state is stored locally)
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
