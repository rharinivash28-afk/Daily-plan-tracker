# 🌅 Daily Life Tracker

A warm, premium daily life tracker built as a **single React component** with
persistent storage. Track your habits, mood, learning, gratitude and anything
else you dream up — for any day of your life.

![dark warm theme](https://img.shields.io/badge/theme-dark%20%26%20warm-ff8a5c) ![single artifact](https://img.shields.io/badge/single-React%20artifact-ffb84d)

## ✨ Features

- **Master progress bar** — overall day completion %, auto-calculated from every section.
- **Per-section progress** — every tracker shows its own bar + percentage.
- **Date navigation** — move day-by-day or jump to any date; data is saved per day.
- **Persistent storage** — uses the `window.storage` artifact API with an automatic
  `localStorage` fallback, so your data survives across sessions anywhere it runs.

### Trackers included

| Section | Type |
| --- | --- |
| Wake Up | toggle |
| Water Intake | counter (goal 8 glasses) |
| Skincare | toggle with morning / night split |
| Exercise / Movement | toggle + duration |
| Mood Check-in | emoji selector |
| To-Do List | add / check off tasks |
| Learned in Class | text entry |
| Learned Beyond Class | text entry |
| Gratitude Note | journal entry |
| **Custom Trackers** | add your own — toggle, counter, or text |

### Design

- Animated aurora / gradient-blob background (respects `prefers-reduced-motion`).
- Distinctive type: **Fraunces** (display serif) + **Space Grotesk** (UI).
- Dark, warm amber-and-rose theme with glassmorphism, smooth animations and micro-interactions.
- Fully responsive / mobile-friendly.

## 🚀 Run locally

```bash
npm install
npm run dev
```

Then open the printed local URL.

## 🧩 Single-artifact note

The entire application lives in [`src/App.jsx`](src/App.jsx). It is written to drop
straight into a Claude artifact: when `window.storage` is available it uses that for
cross-session persistence, otherwise it falls back to `localStorage`. The surrounding
Vite scaffold (`index.html`, `src/main.jsx`) only exists so the same file can run as a
normal web app.
