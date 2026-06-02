import { useMemo } from "react";
import { lastNDays, KEY } from "../utils/dates.js";
import { dayCompletion } from "../utils/streakLogic.js";

// 14-day heatmap data, memoized.
export function useHeatmap(habits, days = 14) {
  return useMemo(() => {
    return lastNDays(days).map((date) => {
      const { done, total, pct } = dayCompletion(habits, date);
      return { date, key: KEY(date), done, total, ratio: total ? done / total : 0, pct };
    });
  }, [habits, days]);
}
