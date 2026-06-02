import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage.js";
import { DEFAULT_HABITS } from "../utils/constants.js";
import {
  uuid, getToday, toKey, isScheduled, isCompleted,
  getStreakCount, brokeYesterday, lastNDays, jsDay,
} from "../utils/dates.js";

function seed() {
  const now = new Date().toISOString();
  return DEFAULT_HABITS.map((h) => ({
    id: uuid(),
    name: h.name,
    emoji: h.emoji,
    category: h.category,
    frequency: h.frequency,
    customDays: h.customDays,
    duration: h.duration || "",
    completions: {},
    createdAt: now,
  }));
}

export function useHabits() {
  const [habits, setHabits] = useLocalStorage("habitflow.habits", seed);

  const addHabit = useCallback((data) => {
    setHabits((prev) => [
      ...prev,
      {
        id: uuid(),
        name: data.name.trim() || "Untitled habit",
        emoji: data.emoji || "🎯",
        category: data.category || "Health",
        frequency: data.frequency || "daily",
        customDays: data.customDays || [0, 1, 2, 3, 4, 5, 6],
        duration: data.duration || "",
        completions: {},
        createdAt: new Date().toISOString(),
      },
    ]);
  }, [setHabits]);

  const updateHabit = useCallback((id, data) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...data, id: h.id, completions: h.completions } : h))
    );
  }, [setHabits]);

  const deleteHabit = useCallback((id) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }, [setHabits]);

  // Toggle completion for a given date (defaults to today).
  const toggle = useCallback((id, dateKey = getToday()) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const completions = { ...(h.completions || {}) };
        if (completions[dateKey]) delete completions[dateKey];
        else completions[dateKey] = true;
        return { ...h, completions };
      })
    );
  }, [setHabits]);

  // ---- Derived helpers ----

  const habitsForDate = useCallback(
    (dateKey) => habits.filter((h) => isScheduled(h, dateKey)),
    [habits]
  );

  const dayProgress = useCallback(
    (dateKey) => {
      const due = habitsForDate(dateKey);
      const done = due.filter((h) => isCompleted(h, dateKey)).length;
      return { done, total: due.length, pct: due.length ? Math.round((done / due.length) * 100) : 0 };
    },
    [habitsForDate]
  );

  const todayKey = getToday();
  const today = useMemo(() => dayProgress(todayKey), [dayProgress, todayKey]);

  const bestStreak = useMemo(() => {
    let best = { name: "—", emoji: "✨", count: 0 };
    for (const h of habits) {
      const c = getStreakCount(h, todayKey);
      if (c > best.count) best = { name: h.name, emoji: h.emoji, count: c };
    }
    return best;
  }, [habits, todayKey]);

  // This week's average completion %.
  const weekPct = useMemo(() => {
    const days = lastNDays(7, todayKey);
    const vals = days.map((d) => dayProgress(d).pct);
    const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    return avg;
  }, [dayProgress, todayKey]);

  // Previous week avg, for "above/below avg".
  const prevWeekPct = useMemo(() => {
    const days = lastNDays(14, todayKey).slice(0, 7);
    const vals = days.map((d) => dayProgress(d).pct);
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  }, [dayProgress, todayKey]);

  // Analytics aggregates.
  const analytics = useMemo(() => {
    const last30 = lastNDays(30, todayKey).map((d) => ({ date: d, pct: dayProgress(d).pct }));

    // completions by day-of-week (Mon..Sun)
    const dowCounts = [0, 0, 0, 0, 0, 0, 0]; // index 0=Mon
    let totalCompletions = 0;
    let bestEver = 0;
    for (const h of habits) {
      for (const key of Object.keys(h.completions || {})) {
        if (!h.completions[key]) continue;
        totalCompletions++;
        const idx = (jsDay(key) + 6) % 7;
        dowCounts[idx]++;
      }
      const s = getStreakCount(h, todayKey);
      if (s > bestEver) bestEver = s;
    }

    const avgDaily = last30.length
      ? Math.round(last30.reduce((a, b) => a + b.pct, 0) / last30.length)
      : 0;

    return { last30, dowCounts, totalCompletions, bestEver, avgDaily, activeCount: habits.length };
  }, [habits, dayProgress, todayKey]);

  const recoveryHabits = useMemo(
    () => habits.filter((h) => brokeYesterday(h, todayKey)),
    [habits, todayKey]
  );

  return {
    habits, setHabits,
    addHabit, updateHabit, deleteHabit, toggle,
    habitsForDate, dayProgress,
    today, bestStreak, weekPct, prevWeekPct,
    analytics, recoveryHabits, todayKey,
  };
}
