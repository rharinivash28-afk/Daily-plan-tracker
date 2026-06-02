import React, { useState } from "react";
import { format } from "date-fns";
import { heatmapColor, heatmapColorDark } from "../../utils/colors.js";
import { useTheme } from "../../hooks/useTheme.js";

export default function HeatmapCell({ cell }) {
  const { isDark } = useTheme();
  const [hover, setHover] = useState(false);
  const color = isDark ? heatmapColorDark(cell.ratio) : heatmapColor(cell.ratio);

  return (
    <div className="relative flex-1">
      <div
        className="aspect-square rounded-md w-full cursor-default transition-transform hover:scale-105"
        style={{ background: color }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      />
      {hover && (
        <div className="absolute z-20 bottom-full mb-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded-md text-[11px] font-medium bg-ink text-white dark:bg-white dark:text-ink">
          {format(cell.date, "EEE MMM d")} · {cell.done}/{cell.total} habits
        </div>
      )}
    </div>
  );
}
