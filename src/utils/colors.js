// Category color map. Light + dark variants for full dark-mode support.
export const CATEGORIES = {
  health:       { label: "Health",       bg: "#EEEDFE", text: "#3C3489", dot: "#7F77DD", darkBg: "#26215C", darkText: "#CECBF6" },
  mindfulness:  { label: "Mindfulness",  bg: "#E1F5EE", text: "#085041", dot: "#1D9E75", darkBg: "#0A2E25", darkText: "#7FD6B9" },
  learning:     { label: "Learning",     bg: "#E6F1FB", text: "#0C447C", dot: "#378ADD", darkBg: "#0C2944", darkText: "#9CC8F2" },
  fitness:      { label: "Fitness",      bg: "#FAECE7", text: "#712B13", dot: "#D85A30", darkBg: "#3E1B0F", darkText: "#F0A98C" },
  productivity: { label: "Productivity", bg: "#FAEEDA", text: "#633806", dot: "#BA7517", darkBg: "#352005", darkText: "#E5BE78" },
  social:       { label: "Social",       bg: "#FBEAF0", text: "#72243E", dot: "#D4537E", darkBg: "#3D1421", darkText: "#EFA3BD" },
};

export const BUILTIN_KEYS = Object.keys(CATEGORIES);

// Palette for user-created categories (pick a dot color; bg/text derived).
export const CATEGORY_PALETTE = [
  { dot: "#7F77DD", bg: "#EEEDFE", text: "#3C3489", darkBg: "#26215C", darkText: "#CECBF6" },
  { dot: "#1D9E75", bg: "#E1F5EE", text: "#085041", darkBg: "#0A2E25", darkText: "#7FD6B9" },
  { dot: "#378ADD", bg: "#E6F1FB", text: "#0C447C", darkBg: "#0C2944", darkText: "#9CC8F2" },
  { dot: "#D85A30", bg: "#FAECE7", text: "#712B13", darkBg: "#3E1B0F", darkText: "#F0A98C" },
  { dot: "#BA7517", bg: "#FAEEDA", text: "#633806", darkBg: "#352005", darkText: "#E5BE78" },
  { dot: "#D4537E", bg: "#FBEAF0", text: "#72243E", darkBg: "#3D1421", darkText: "#EFA3BD" },
  { dot: "#0EA5A5", bg: "#DEF6F5", text: "#0A4D4D", darkBg: "#0A2E2E", darkText: "#79D4D0" },
  { dot: "#8B5CF6", bg: "#F0EAFE", text: "#4C1D95", darkBg: "#2A1959", darkText: "#C4B0F5" },
  { dot: "#E8632B", bg: "#FBE9DF", text: "#7A2E0E", darkBg: "#3D1908", darkText: "#F2A883" },
  { dot: "#16A34A", bg: "#DEF7E6", text: "#0A4F23", darkBg: "#0A2E16", darkText: "#7CD79A" },
];

// Registry of custom categories, kept in sync by the store.
let CUSTOM = {}; // key -> { label, dot, bg, text, darkBg, darkText }
export function setCustomCategories(map) { CUSTOM = map || {}; }
export function getCustomCategories() { return CUSTOM; }

// All categories (built-in + custom) as a list, for menus/sidebars.
export function allCategories() {
  const builtins = BUILTIN_KEYS.map((key) => ({ key, ...CATEGORIES[key] }));
  const customs = Object.entries(CUSTOM).map(([key, v]) => ({ key, ...v }));
  return [...builtins, ...customs];
}

function resolve(key) {
  return CATEGORIES[key] || CUSTOM[key] || CATEGORIES.health;
}

export const CATEGORY_KEYS = BUILTIN_KEYS; // kept for compatibility

export function catColors(key, isDark = false) {
  const c = resolve(key);
  return {
    bg: isDark ? c.darkBg : c.bg,
    text: isDark ? c.darkText : c.text,
    dot: c.dot,
    label: c.label,
  };
}

export function catLabel(key) {
  return resolve(key).label;
}

export const PURPLE = {
  50: "#EEEDFE", 100: "#CECBF6", 200: "#AFA9EC",
  400: "#7F77DD", 600: "#534AB7", 800: "#3C3489", 900: "#26215C",
};

// Heatmap intensity scale (0..7 completions).
export function heatmapColor(ratio) {
  // ratio is completed/total in 0..1
  if (ratio <= 0) return "#F1EFE8";
  if (ratio < 0.3) return "#CECBF6";
  if (ratio < 0.6) return "#AFA9EC";
  if (ratio < 0.86) return "#7F77DD";
  return "#534AB7";
}

export function heatmapColorDark(ratio) {
  if (ratio <= 0) return "#1F1F1F";
  if (ratio < 0.3) return "#26215C";
  if (ratio < 0.6) return "#3C3489";
  if (ratio < 0.86) return "#534AB7";
  return "#7F77DD";
}
