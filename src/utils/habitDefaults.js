// Starter packs for onboarding. customDays use JS day indices (0=Sun..6=Sat).
export const STARTER_PACKS = [
  {
    id: "morning",
    emoji: "🌅",
    title: "Morning Routine",
    description: "Wake up early, hydrate, meditate, journal",
    habits: [
      { name: "Wake up early", emoji: "🌅", category: "productivity", frequency: "daily", duration: "" },
      { name: "Drink water", emoji: "💧", category: "health", frequency: "daily", duration: "" },
      { name: "Meditate", emoji: "🧘", category: "mindfulness", frequency: "daily", duration: "10 min" },
      { name: "Journal", emoji: "✍️", category: "mindfulness", frequency: "daily", duration: "" },
    ],
  },
  {
    id: "fitness",
    emoji: "💪",
    title: "Fitness & Health",
    description: "Workout, drink water, walk 10k steps, sleep 8hrs",
    habits: [
      { name: "Workout", emoji: "🏋️", category: "fitness", frequency: "daily", duration: "30 min" },
      { name: "Drink water", emoji: "💧", category: "health", frequency: "daily", duration: "" },
      { name: "Walk 10k steps", emoji: "🚴", category: "fitness", frequency: "daily", duration: "" },
      { name: "Sleep 8 hours", emoji: "😴", category: "health", frequency: "daily", duration: "8 hrs" },
    ],
  },
  {
    id: "focus",
    emoji: "🧠",
    title: "Deep Focus",
    description: "Read 30 min, no social media, learn something new, reflect",
    habits: [
      { name: "Read", emoji: "📚", category: "learning", frequency: "daily", duration: "30 min" },
      { name: "No social media", emoji: "🎯", category: "productivity", frequency: "daily", duration: "" },
      { name: "Learn something new", emoji: "🧠", category: "learning", frequency: "daily", duration: "" },
      { name: "Reflect", emoji: "📝", category: "mindfulness", frequency: "daily", duration: "" },
    ],
  },
];

// 6 balanced default habits — one per category — seeded when a user finishes
// onboarding without choosing anything, so the app is never empty.
export const DEFAULT_HABITS = [
  { name: "Drink water",        emoji: "💧", category: "health",       frequency: "daily", targetType: "number",   goal: 8, unit: "glasses" },
  { name: "Meditate",           emoji: "🧘", category: "mindfulness",  frequency: "daily", targetType: "duration", goal: 10 },
  { name: "Read",               emoji: "📚", category: "learning",     frequency: "daily", targetType: "duration", goal: 20 },
  { name: "Workout",            emoji: "🏋️", category: "fitness",      frequency: "daily", targetType: "duration", goal: 30 },
  { name: "Plan your day",      emoji: "🎯", category: "productivity", frequency: "daily", targetType: "none" },
  { name: "Connect with someone", emoji: "💬", category: "social",     frequency: "daily", targetType: "none" },
];

export const EMOJI_OPTIONS = [
  "🧘", "💧", "📚", "🏃", "✍️", "🥗", "😴", "🎯",
  "💪", "🧠", "🎨", "🎵", "🌿", "🧹", "💊", "🏋️",
  "🚴", "📝", "🌅", "🍎", "☕", "🧘‍♂️", "🫁", "🏊",
];
