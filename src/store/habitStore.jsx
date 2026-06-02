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
      // merge to tolerate older/partial shapes
      return {
        user: { ...emptyState().user, ...(parsed.user || {}) },
        habits: parsed.habits || [],
        journal: parsed.journal || {},
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
      const h = action.habit;
      return {
        ...state,
        habits: [
          ...state.habits,
          {
            id: uuid(),
            name: (h.name || "Untitled").trim(),
            emoji: h.emoji || "🎯",
            category: h.category || "health",
            frequency: h.frequency || "daily",
            customDays: h.customDays || [],
            duration: h.duration || "",
            reminderTime: h.reminderTime || "",
            completions: {},
            createdAt: new Date().toISOString(),
            archived: false,
          },
        ],
      };
    }

    case "ADD_HABITS": {
      const created = action.habits.map((h) => ({
        id: uuid(),
        name: (h.name || "Untitled").trim(),
        emoji: h.emoji || "🎯",
        category: h.category || "health",
        frequency: h.frequency || "daily",
        customDays: h.customDays || [],
        duration: h.duration || "",
        reminderTime: h.reminderTime || "",
        completions: {},
        createdAt: new Date().toISOString(),
        archived: false,
      }));
      return { ...state, habits: [...state.habits, ...created] };
    }

    case "UPDATE_HABIT":
      return {
        ...state,
        habits: state.habits.map((h) =>
          h.id === action.id
            ? { ...h, ...action.patch, id: h.id, completions: h.completions, createdAt: h.createdAt }
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
