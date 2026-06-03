import React from "react";
import { catColors } from "../../utils/colors.js";

export default function CategoryDot({ category, size = 8 }) {
  const c = catColors(category);
  return (
    <span
      className="inline-block rounded-full shrink-0"
      style={{ width: size, height: size, background: c.dot }}
    />
  );
}
