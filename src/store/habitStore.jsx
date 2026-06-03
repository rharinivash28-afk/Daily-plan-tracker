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
        journal: parsed.journal || {},
      };
    }
  } catch (e) {}
  return emptyState();
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
