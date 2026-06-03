import {
  format, subDays, addDays, startOfWeek, eachDayOfInterval,
  isSameDay, parseISO, getDay,
} from "date-fns";

export const KEY = (date) => format(date, "yyyy-MM-dd");
export const today = () => new Date();
export const todayKey = () => KEY(new Date());

export { format, subDays, addDays, startOfWeek, eachDayOfInterval, isSameDay, parseISO, getDay };

export function fromKey(key) {
  return parseISO(key);
}

// Week (array of Date), respecting weekStartsOn (0=Sun, 1=Mon).
export function weekDays(date, weekStartsOn = 1) {
  const start = startOfWeek(date, { weekStartsOn });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

// Last N days as Date[] (oldest first), ending today.
export function lastNDays(n, end = new Date()) {
  return Array.from({ length: n }, (_, i) => subDays(end, n - 1 - i));
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function prettyDate(date = new Date()) {
  return format(date, "EEEE, MMMM d");
}

export function uuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Day-of-week labels Mon-first.
export const DOW_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
export const DOW_FULL = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// Month grid as flat array of { date, key, inMonth }, aligned to weekStartsOn.
export function getMonthGrid(year, month, weekStartsOn = 1) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() - weekStartsOn + 7) % 7;
  const gridStart = addDays(first, -offset);
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = addDays(gridStart, i);
    cells.push({ date: d, key: KEY(d), inMonth: d.getMonth() === month });
    if (i >= 27 && d.getMonth() !== month && (i + 1) % 7 === 0) break;
  }
  return cells;
}
