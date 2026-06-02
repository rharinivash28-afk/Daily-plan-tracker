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

export const EMOJI_OPTIONS = [
  "🧘", "💧", "📚", "🏃", "✍️", "🥗", "😴", "🎯",
  "💪", "🧠", "🎨", "🎵", "🌿", "🧹", "💊", "🏋️",
  "🚴", "📝", "🌅", "🍎", "☕", "🧘‍♂️", "🫁", "🏊",
];
