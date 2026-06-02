// Date helpers. All date keys are local "YYYY-MM-DD" strings.

export function toKey(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getToday() {
  return toKey(new Date());
}

export function fromKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// JS day index 0=Sun..6=Sat.
export function jsDay(date) {
  return new Date(date).getDay();
}

// Monday-based index 0=Mon..6=Sun (for UI columns).
export function mondayIndex(date) {
  return (jsDay(date) + 6) % 7;
}

// Is the habit scheduled on this date?
export function isScheduled(habit, date) {
  const day = jsDay(date);
  if (habit.frequency === "daily") return true;
  if (habit.frequency === "weekdays") return day >= 1 && day <= 5;
  if (habit.frequency === "custom") return (habit.customDays || []).includes(day);
  return true;
}

export function isCompleted(habit, dateOrKey) {
  const key = typeof dateOrKey === "string" ? dateOrKey : toKey(dateOrKey);
  return !!(habit.completions && habit.completions[key]);
}

// Current streak: consecutive scheduled days completed, counting back from today.
// If today is scheduled but not yet done, the streak is the run ending yesterday.
export function getStreakCount(habit, todayKey = getToday()) {
  const today = fromKey(todayKey);
  let streak = 0;
  let cursor = new Date(today);

  // If today is scheduled and not done, start counting from yesterday.
  if (isScheduled(habit, cursor) && !isCompleted(habit, cursor)) {
    cursor = addDays(cursor, -1);
  }

  // Walk backwards. Skip non-scheduled days (they don't break a streak).
  // A scheduled-but-missed day breaks it. Cap lookback to avoid infinite loops.
  for (let i = 0; i < 730; i++) {
    if (!isScheduled(habit, cursor)) {
      cursor = addDays(cursor, -1);
      continue;
    }
    if (isCompleted(habit, cursor)) {
      streak++;
      cursor = addDays(cursor, -1);
    } else {
      break;
    }
  }
  return streak;
}

// Did the streak break *yesterday*? (scheduled yesterday, missed, but had a run before)
export function brokeYesterday(habit, todayKey = getToday()) {
  const today = fromKey(todayKey);
  const yesterday = addDays(today, -1);
  if (!isScheduled(habit, yesterday)) return false;
  if (isCompleted(habit, yesterday)) return false;
  // had at least one completion before yesterday?
  const dayBefore = addDays(yesterday, -1);
  for (let i = 0; i < 30; i++) {
    const c = addDays(dayBefore, -i);
    if (isScheduled(habit, c) && isCompleted(habit, c)) return true;
    if (isScheduled(habit, c) && !isCompleted(habit, c)) return false;
  }
  return false;
}

// Last N day keys ending today (oldest first).
export function lastNDays(n, todayKey = getToday()) {
  const today = fromKey(todayKey);
  const out = [];
  for (let i = n - 1; i >= 0; i--) out.push(toKey(addDays(today, -i)));
  return out;
}

// Dates of the week containing `date` (Mon..Sun), as keys.
export function getWeekDates(date = new Date()) {
  const d = new Date(date);
  const offset = mondayIndex(d);
  const monday = addDays(d, -offset);
  return Array.from({ length: 7 }, (_, i) => toKey(addDays(monday, i)));
}

// Month grid: array of weeks, each week an array of 7 { key, inMonth } (Mon-first).
export function getMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const startOffset = mondayIndex(first);
  const gridStart = addDays(first, -startOffset);
  const weeks = [];
  let cursor = new Date(gridStart);
  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      week.push({ key: toKey(cursor), inMonth: cursor.getMonth() === month });
      cursor = addDays(cursor, 1);
    }
    weeks.push(week);
    // stop early if the next row is entirely next month and we've passed the month
    if (cursor.getMonth() !== month && cursor > new Date(year, month + 1, 1)) break;
  }
  return weeks;
}

export function formatLong(dateOrKey) {
  const d = typeof dateOrKey === "string" ? fromKey(dateOrKey) : dateOrKey;
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

export function formatShort(dateOrKey) {
  const d = typeof dateOrKey === "string" ? fromKey(dateOrKey) : dateOrKey;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function uuid() {
  if (crypto && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}
