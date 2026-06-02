import { format, subDays, getDay } from "date-fns";

// Is the habit scheduled on the given date?
// frequency: "daily" | "weekdays" | "custom" (customDays: JS day indices 0=Sun..6=Sat)
export function isHabitScheduledOn(habit, date) {
  const day = getDay(date); // 0=Sun..6=Sat
  if (habit.frequency === "daily") return true;
  if (habit.frequency === "weekdays") return day >= 1 && day <= 5;
  if (habit.frequency === "custom") return (habit.customDays || []).includes(day);
  return true;
}

export function isCompletedOn(habit, date) {
  const key = format(date, "yyyy-MM-dd");
  return !!(habit.completions && habit.completions[key]);
}

// Current streak per spec. If today isn't completed yet, counts up to yesterday's run.
export function getStreak(habit, today = new Date()) {
  let streak = 0;
  let date = new Date(today);

  // If today is scheduled but not done, begin from yesterday so an unchecked
  // today doesn't zero the streak.
  if (isHabitScheduledOn(habit, date) && !isCompletedOn(habit, date)) {
    date = subDays(date, 1);
  }

  for (let guard = 0; guard < 1000; guard++) {
    if (!isHabitScheduledOn(habit, date)) {
      date = subDays(date, 1);
      continue;
    }
    if (isCompletedOn(habit, date)) {
      streak++;
      date = subDays(date, 1);
    } else {
      break;
    }
  }
  return streak;
}

// Longest streak ever recorded across all completions.
export function getLongestStreak(habit, today = new Date()) {
  const keys = Object.keys(habit.completions || {}).filter((k) => habit.completions[k]);
  if (keys.length === 0) return 0;
  keys.sort();
  const earliest = new Date(keys[0] + "T00:00:00");
  let longest = 0;
  let run = 0;
  let date = new Date(earliest);
  const end = new Date(today);
  for (let guard = 0; guard < 5000 && date <= end; guard++) {
    if (isHabitScheduledOn(habit, date)) {
      if (isCompletedOn(habit, date)) {
        run++;
        if (run > longest) longest = run;
      } else {
        run = 0;
      }
    }
    date = new Date(date.getTime() + 86400000);
  }
  return longest;
}

// Did a streak (>= minStreak) break *yesterday*?
export function streakBrokeYesterday(habit, today = new Date(), minStreak = 3) {
  const yesterday = subDays(today, 1);
  if (!isHabitScheduledOn(habit, yesterday)) return false;
  if (isCompletedOn(habit, yesterday)) return false;
  // Count the run that ended the day before yesterday.
  const streakBefore = getStreak(habit, subDays(today, 1));
  // getStreak from yesterday with yesterday incomplete -> counts up to 2 days ago.
  return streakBefore >= minStreak;
}

// completions count / scheduled count for a date.
export function dayCompletion(habits, date) {
  const scheduled = habits.filter((h) => !h.archived && isHabitScheduledOn(h, date));
  const done = scheduled.filter((h) => isCompletedOn(h, date)).length;
  return { done, total: scheduled.length, pct: scheduled.length ? Math.round((done / scheduled.length) * 100) : 0 };
}
