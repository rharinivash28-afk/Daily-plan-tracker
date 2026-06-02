// Category definitions — name -> color token + tailwind-ready hex.
export const CATEGORIES = {
  Health:       { color: "#7F77DD", soft: "#EEEDFE" },
  Mindfulness:  { color: "#1D9E75", soft: "#E3F5EE" },
  Learning:     { color: "#378ADD", soft: "#E2EFFB" },
  Fitness:      { color: "#D85A30", soft: "#FBE8E0" },
  Productivity: { color: "#BA7517", soft: "#F8EEDC" },
  Social:       { color: "#D4537E", soft: "#FBE5ED" },
};

export const CATEGORY_NAMES = Object.keys(CATEGORIES);

export const categoryColor = (name) => (CATEGORIES[name] || CATEGORIES.Health).color;
export const categorySoft = (name) => (CATEGORIES[name] || CATEGORIES.Health).soft;

// Emoji palette for the picker.
export const EMOJIS = [
  "🧘", "💧", "📚", "🏃", "✍️", "🥗", "😴", "🎯", "💪", "🧠",
  "🎨", "🎵", "🌿", "🧹", "💊", "🏋️", "🚴", "📝", "🌅", "🍎",
];

// 5-emoji mood scale for the Journal.
export const MOODS = ["😔", "😐", "🙂", "😊", "🤩"];

// Day labels — week starts Monday for the UI; JS Date uses 0=Sun.
export const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
export const DAY_FULL = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Frequency options.
export const FREQUENCIES = [
  { id: "daily", label: "Daily" },
  { id: "weekdays", label: "Weekdays" },
  { id: "custom", label: "Custom days" },
];

// Seed habits on first load. customDays use JS day index (0=Sun..6=Sat).
export const DEFAULT_HABITS = [
  { name: "Morning meditation", emoji: "🧘", category: "Mindfulness", frequency: "daily", customDays: [0,1,2,3,4,5,6], duration: "10 min" },
  { name: "Drink 8 glasses of water", emoji: "💧", category: "Health", frequency: "daily", customDays: [0,1,2,3,4,5,6], duration: "" },
  { name: "Read for 30 minutes", emoji: "📚", category: "Learning", frequency: "daily", customDays: [0,1,2,3,4,5,6], duration: "30 min" },
  { name: "30 min workout", emoji: "🏃", category: "Fitness", frequency: "custom", customDays: [1,3,5], duration: "30 min" },
  { name: "Journal entry", emoji: "✍️", category: "Mindfulness", frequency: "daily", customDays: [0,1,2,3,4,5,6], duration: "" },
];

export const NAV_ITEMS = [
  { id: "today", label: "Today", icon: "LayoutDashboard" },
  { id: "calendar", label: "Calendar", icon: "CalendarDays" },
  { id: "weekly", label: "Weekly", icon: "CalendarRange" },
  { id: "analytics", label: "Analytics", icon: "BarChart3" },
  { id: "streaks", label: "Streaks", icon: "Flame" },
  { id: "journal", label: "Journal", icon: "NotebookPen" },
];
