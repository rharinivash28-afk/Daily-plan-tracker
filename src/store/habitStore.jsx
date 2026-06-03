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
    accent: "#534AB7",
    textSize: "normal", // "normal" | "large"
    categories: {},     // custom: key -> { label, dot, bg, text, darkBg, darkText }
    onboardingDone: false,
  },
  habits: [],
  journal: {},
});

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
function makeHabit(h = {}) {
  return {
    id: h.id || uuid(),
    name: (h.name || "Untitled").trim(),
    emoji: h.emoji || "🎯",
    category: h.category || "health",
    frequency: h.frequency || "daily",
    customDays: h.customDays || [],
    duration: h.duration || "",
    reminderTime: h.reminderTime || "",
    targetTime: h.targetTime || "",            // planned time, e.g. "06:00"
    completions: h.completions && typeof h.completions === "object" ? h.completions : {},
    actualTimes: h.actualTimes && typeof h.actualTimes === "object" ? h.actualTimes : {}, // dateKey -> "HH:MM"
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
            ? { ...h, ...action.patch, id: h.id, completions: h.completions, actualTimes: h.actualTimes, createdAt: h.createdAt }
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
    root.style.setProperty("--accent", state.user.accent || "#534AB7");
    root.style.fontSize = state.user.textSize === "large" ? "17px" : "16px";
  }, [state.user.accent, state.user.textSize]);

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
