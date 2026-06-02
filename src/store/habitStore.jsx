import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import { uuid } from "../utils/dates.js";

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
    onboardingDone: false,
  },
  habits: [],
  journal: {},
});

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // merge + normalize to tolerate older/partial shapes
      return {
        user: { ...emptyState().user, ...(parsed.user || {}) },
        habits: Array.isArray(parsed.habits) ? parsed.habits.map(makeHabit) : [],
        journal: parsed.journal && typeof parsed.journal === "object" ? parsed.journal : {},
      };
    }
  } catch (e) {}
  return emptyState();
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: { ...state.user, ...action.patch } };

    case "ADD_HABIT": {
      return { ...state, habits: [...state.habits, makeHabit(action.habit)] };
    }

    case "ADD_HABITS": {
      const created = action.habits.map(makeHabit);
      return { ...state, habits: [...state.habits, ...created] };
    }

    case "UPDATE_HABIT":
      return {
        ...state,
        habits: state.habits.map((h) =>
          h.id === action.id
            ? { ...h, ...action.patch, id: h.id, completions: h.completions, values: h.values, createdAt: h.createdAt }
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
      const { id, dateKey } = action;
      return {
        ...state,
        habits: state.habits.map((h) => {
          if (h.id !== id) return h;
          const completions = { ...(h.completions || {}) };
          if (completions[dateKey]) delete completions[dateKey];
          else completions[dateKey] = true;
          return { ...h, completions };
        }),
      };
    }

    // Set a typed value for a date (numeric/mood/notes). Completion is derived.
    case "SET_VALUE": {
      const { id, dateKey, value } = action;
      return {
        ...state,
        habits: state.habits.map((h) => {
          if (h.id !== id) return h;
          const values = { ...(h.values || {}) };
          const completions = { ...(h.completions || {}) };
          const empty = value === "" || value === null || value === undefined;
          if (empty) { delete values[dateKey]; delete completions[dateKey]; }
          else {
            values[dateKey] = value;
            // derive completion: numeric meets target; mood/notes -> any value counts
            if (h.type === "numeric") {
              completions[dateKey] = Number(value) >= Number(h.target || 1);
              if (!completions[dateKey]) delete completions[dateKey];
            } else {
              completions[dateKey] = true;
            }
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

    case "IMPORT": {
      const d = action.data || {};
      // Validate basic shape; ignore garbage. Keep onboarding done so we don't trap the user.
      if (!d || typeof d !== "object" || !Array.isArray(d.habits)) return state;
      return {
        user: { ...emptyState().user, ...(d.user || {}), onboardingDone: true },
        habits: d.habits.map(makeHabit),
        journal: d.journal && typeof d.journal === "object" ? d.journal : {},
      };
    }

    case "RESET":
      // Reset data but keep the user past onboarding (and their name/theme prefs).
      return {
        user: { ...emptyState().user, name: state.user.name, darkMode: state.user.darkMode, weekStartsOn: state.user.weekStartsOn, onboardingDone: true },
        habits: [],
        journal: {},
      };

    default:
      return state;
  }
}

// Normalizes any habit-ish object into the full schema (backward compatible).
function makeHabit(h = {}) {
  return {
    id: h.id || uuid(),
    name: (h.name || "Untitled").trim(),
    emoji: h.emoji || "🎯",
    category: h.category || "health",
    type: h.type || "boolean", // boolean | numeric | mood | notes
    target: h.target ?? "",     // numeric goal
    unit: h.unit || "",         // numeric unit label
    frequency: h.frequency || "daily",
    customDays: h.customDays || [],
    duration: h.duration || "",
    reminderTime: h.reminderTime || "",
    completions: h.completions && typeof h.completions === "object" ? h.completions : {},
    values: h.values && typeof h.values === "object" ? h.values : {},
    createdAt: h.createdAt || new Date().toISOString(),
    archived: !!h.archived,
  };
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }, [state]);

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
