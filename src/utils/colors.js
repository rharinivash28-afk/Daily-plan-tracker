// Category color map. Light + dark variants for full dark-mode support.
export const CATEGORIES = {
  health:       { label: "Health",       bg: "#EEEDFE", text: "#3C3489", dot: "#7F77DD", darkBg: "#26215C", darkText: "#CECBF6" },
  mindfulness:  { label: "Mindfulness",  bg: "#E1F5EE", text: "#085041", dot: "#1D9E75", darkBg: "#0A2E25", darkText: "#7FD6B9" },
  learning:     { label: "Learning",     bg: "#E6F1FB", text: "#0C447C", dot: "#378ADD", darkBg: "#0C2944", darkText: "#9CC8F2" },
  fitness:      { label: "Fitness",      bg: "#FAECE7", text: "#712B13", dot: "#D85A30", darkBg: "#3E1B0F", darkText: "#F0A98C" },
  productivity: { label: "Productivity", bg: "#FAEEDA", text: "#633806", dot: "#BA7517", darkBg: "#352005", darkText: "#E5BE78" },
  social:       { label: "Social",       bg: "#FBEAF0", text: "#72243E", dot: "#D4537E", darkBg: "#3D1421", darkText: "#EFA3BD" },
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES);

export function catColors(key, isDark = false) {
  const c = CATEGORIES[key] || CATEGORIES.health;
  return {
    bg: isDark ? c.darkBg : c.bg,
    text: isDark ? c.darkText : c.text,
    dot: c.dot,
    label: c.label,
  };
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
