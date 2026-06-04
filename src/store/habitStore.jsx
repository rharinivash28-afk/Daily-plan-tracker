import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import { uuid } from "../utils/dates.js";
import { setCustomCategories, CATEGORY_PALETTE } from "../utils/colors.js";

const STORAGE_KEY = "habitflow_data";

const emptyState = () => ({
  user: {
    name: "",
    joinedAt: new Date().toISOString(),
    weekStartsOn: 1,
    darkMode: typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false,
    reminderTime: "08:00",
    remindersEnabled: false,
    accent: "#534AB7",
    textSize: "normal", // "normal" | "large"
    categories: {},     // custom: key -> { label, dot, bg, text, darkBg, darkText }
    onboardingDone: false,
  },
  habits: [],
  journal: {},
});

// Color helpers for the accent variable.
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function shade(hex, amt) {
  const { r, g, b } = hexToRgb(hex);
  const f = (c) => Math.max(0, Math.min(255, Math.round(c + c * amt)));
  return `#${[f(r), f(g), f(b)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}
// Mix a hex toward white (t>0) or black (t<0), |t| in 0..1.
function mix(hex, t) {
  const { r, g, b } = hexToRgb(hex);
  const target = t >= 0 ? 255 : 0;
  const a = Math.abs(t);
  const f = (c) => Math.round(c + (target - c) * a);
  return `#${[f(r), f(g), f(b)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}
// Build a Tailwind-like 50..900 ramp from a base accent (treated as ~600).
function accentRamp(hex) {
  return {
    50: mix(hex, 0.88), 100: mix(hex, 0.74), 200: mix(hex, 0.55),
    300: mix(hex, 0.36), 400: mix(hex, 0.18), 500: mix(hex, 0.06),
    600: hex, 700: mix(hex, -0.12), 800: mix(hex, -0.24), 900: mix(hex, -0.40),
  };
}

// Build a custom-category object from a name + palette index.
function makeCategory(name, paletteIndex = 0) {
  const p = CATEGORY_PALETTE[paletteIndex % CATEGORY_PALETTE.length];
  return { label: name.trim(), ...p };
}

// Push the user's custom categories into the colors registry so catColors() sees them.
function syncCategories(user) {
  setCustomCategories(user?.categories || {});
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // merge + normalize to tolerate older/partial shapes
      const state = {
        user: { ...emptyState().user, ...(parsed.user || {}) },
        habits: Array.isArray(parsed.habits) ? parsed.habits.map(makeHabit) : [],
        journal: parsed.journal || {},
      };
      syncCategories(state.user);
      return state;
    }
  } catch (e) {}
  const s = emptyState();
  syncCategories(s.user);
  return s;
}

// Normalizes a habit into the full schema (backward compatible).
// Guess a sensible target type/goal from a habit's name (for migration + suggestions).
function guessTarget(name = "", existing = {}) {
  // If already typed, keep it.
  if (existing.targetType) return existing;
  const n = name.toLowerCase();
  if (/\bwake|wake up|sleep|bed|rise|morning\b/.test(n) || existing.targetTime)
    return { targetType: "time", targetTime: existing.targetTime || "" };
  // numeric: water/glasses/steps/cups/pages/reps + "8 glasses"
  const numMatch = n.match(/(\d+)\s*(glass|glasses|cup|cups|step|steps|page|pages|rep|reps|km|mile|liter|litre|ml|oz)?/);
  if (/water|glass|cup|step|drink|pages?|reps?|km|miles?/.test(n))
    return { targetType: "number", goal: numMatch ? Number(numMatch[1]) || 8 : 8, unit: (numMatch && numMatch[2]) ? numMatch[2] : "" };
  // duration: "30 min", "read 30 minutes", workout, meditate, exercise
  const durMatch = (existing.duration || n).match(/(\d+)\s*(min|minute|hr|hour)/);
  if (durMatch || /meditat|workout|exercise|read|study|walk|run|yoga|journal/.test(n))
    return { targetType: "duration", goal: durMatch ? Number(durMatch[1]) || 10 : 10 };
  return { targetType: "none" };
}

function makeHabit(h = {}) {
  const guessed = guessTarget(h.name, h);
  return {
    id: h.id || uuid(),
    name: (h.name || "Untitled").trim(),
    emoji: h.emoji || "🎯",
    category: h.category || "health",
    frequency: h.frequency || "daily",
    customDays: h.customDays || [],
    duration: h.duration || "",
    reminderTime: h.reminderTime || "",
    // target: type + value
    targetType: h.targetType || guessed.targetType || "none", // none | time | number | duration
    targetTime: h.targetTime ?? guessed.targetTime ?? "",       // for type "time"
    goal: h.goal ?? guessed.goal ?? "",                         // for number/duration
    unit: h.unit ?? guessed.unit ?? "",                         // for number (e.g. glasses)
    completions: h.completions && typeof h.completions === "object" ? h.completions : {},
    actualTimes: h.actualTimes && typeof h.actualTimes === "object" ? h.actualTimes : {}, // dateKey -> "HH:MM"
    values: h.values && typeof h.values === "object" ? h.values : {}, // dateKey -> number (for number/duration)
    createdAt: h.createdAt || new Date().toISOString(),
    archived: !!h.archived,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: { ...state.user, ...action.patch } };

    case "ADD_CATEGORY": {
      const name = (action.name || "").trim();
      if (!name) return state;
      // key from name; ensure unique
      let key = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "cat";
      const existing = state.user.categories || {};
      if (existing[key]) key = `${key}-${Date.now().toString(36).slice(-3)}`;
      const idx = action.paletteIndex ?? Object.keys(existing).length;
      return {
        ...state,
        user: { ...state.user, categories: { ...existing, [key]: makeCategory(name, idx) } },
      };
    }

    case "RENAME_CATEGORY": {
      const cats = { ...(state.user.categories || {}) };
      if (!cats[action.key]) return state;
      cats[action.key] = { ...cats[action.key], label: (action.name || cats[action.key].label).trim() };
      return { ...state, user: { ...state.user, categories: cats } };
    }

    case "DELETE_CATEGORY": {
      const cats = { ...(state.user.categories || {}) };
      delete cats[action.key];
      // reassign any habits using it back to "health"
      const habits = state.habits.map((h) => (h.category === action.key ? { ...h, category: "health" } : h));
      return { ...state, user: { ...state.user, categories: cats }, habits };
    }

    case "ADD_HABIT":
      return { ...state, habits: [...state.habits, makeHabit(action.habit)] };

    case "ADD_HABITS":
      return { ...state, habits: [...state.habits, ...action.habits.map(makeHabit)] };

    case "UPDATE_HABIT":
      return {
        ...state,
        habits: state.habits.map((h) =>
          h.id === action.id
            ? { ...h, ...action.patch, id: h.id, completions: h.completions, actualTimes: h.actualTimes, values: h.values, createdAt: h.createdAt }
            : h
        ),
      };

    case "DELETE_HABIT":
      return { ...state, habits: state.habits.filter((h) => h.id !== action.id) };

    case "ARCHIVE_HABIT":
      return {
        ...state,
        habits: state.habits.map((h) => (h.id === action.id ? { ...h, archived: true } : h)),
      };

    case "TOGGLE_COMPLETION": {
      const { id, dateKey, nowTime } = action;
      return {
        ...state,
        habits: state.habits.map((h) => {
          if (h.id !== id) return h;
          const completions = { ...(h.completions || {}) };
          const actualTimes = { ...(h.actualTimes || {}) };
          if (completions[dateKey]) {
            delete completions[dateKey];
            delete actualTimes[dateKey]; // clearing a check clears its logged time
          } else {
            completions[dateKey] = true;
            // stamp the current time as the actual time, if provided
            if (nowTime && !actualTimes[dateKey]) actualTimes[dateKey] = nowTime;
          }
          return { ...h, completions, actualTimes };
        }),
      };
    }

    // Set/clear the actual time a habit was done on a given date.
    case "SET_ACTUAL_TIME": {
      const { id, dateKey, time } = action;
      return {
        ...state,
        habits: state.habits.map((h) => {
          if (h.id !== id) return h;
          const actualTimes = { ...(h.actualTimes || {}) };
          if (time) actualTimes[dateKey] = time;
          else delete actualTimes[dateKey];
          return { ...h, actualTimes };
        }),
      };
    }

    // Set a numeric/duration value for a date; completion derives from reaching the goal.
    case "SET_VALUE": {
      const { id, dateKey, value } = action;
      return {
        ...state,
        habits: state.habits.map((h) => {
          if (h.id !== id) return h;
          const values = { ...(h.values || {}) };
          const completions = { ...(h.completions || {}) };
          const v = Number(value) || 0;
          if (v <= 0) { delete values[dateKey]; delete completions[dateKey]; }
          else {
            values[dateKey] = v;
            const goal = Number(h.goal) || 1;
            if (v >= goal) completions[dateKey] = true;
            else delete completions[dateKey];
          }
          return { ...h, values, completions };
        }),
      };
    }

    case "SET_JOURNAL":
      return {
        ...state,
        journal: { ...state.journal, [action.dateKey]: action.entry },
      };

    case "IMPORT":
      return {
        user: { ...emptyState().user, ...(action.data.user || {}) },
        habits: action.data.habits || [],
        journal: action.data.journal || {},
      };

    case "RESET":
      return emptyState();

    default:
      return state;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  // Keep the colors registry in sync synchronously so catColors() is correct on first paint.
  syncCategories(state.user);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }, [state]);

  // Apply appearance (accent + text size) to CSS vars.
  useEffect(() => {
    const root = document.documentElement;
    const accent = state.user.accent || "#534AB7";
    root.style.setProperty("--accent", accent);
    const { r, g, b } = hexToRgb(accent);
    root.style.setProperty("--accent-rgb", `${r} ${g} ${b}`);
    root.style.setProperty("--accent-dark", shade(accent, -0.18));
    root.style.setProperty("--accent-soft", `rgba(${r}, ${g}, ${b}, 0.12)`);
    // Full ramp so every purple-* utility follows the accent app-wide.
    const ramp = accentRamp(accent);
    Object.entries(ramp).forEach(([k, v]) => root.style.setProperty(`--accent-${k}`, v));
    root.style.fontSize = state.user.textSize === "large" ? "17px" : "16px";
  }, [state.user.accent, state.user.textSize]);

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
