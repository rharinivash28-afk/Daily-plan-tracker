import { useMemo } from "react";
import { getStreak, getLongestStreak } from "../utils/streakLogic.js";

export function useStreak(habit) {
  return useMemo(() => {
    const current = getStreak(habit);
    const longest = getLongestStreak(habit);
    return { current, longest: Math.max(longest, current) };
  }, [habit]);
}
