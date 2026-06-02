import React from "react";
import { lastNDays, formatShort, mondayIndex, fromKey } from "../utils/dates.js";
import { DAY_LABELS } from "../utils/constants.js";

// 14-day activity heatmap. Intensity = habits completed that day / max.
export default function Heatmap({ dayProgress, onSelectDate }) {
  const days = lastNDays(14);
  const cells = days.map((key) => {
    const { done, total } = dayProgress(key);
    return { key, done, total };
  });
  const maxDone = Math.max(1, ...cells.map((c) => c.done));

  const shade = (done) => {
    if (done === 0) return "#EFEEF6";
    const t = done / maxDone; // 0..1
    // interpolate from light purple to dark purple
    const lerp = (a, b) => Math.round(a + (b - a) * t);
    const r = lerp(0xc5, 0x53), g = lerp(0xbf, 0x4a), b = lerp(0xf0, 0xb7);
    return `rgb(${r},${g},${b})`;
  };

  return (
    <div className="card-border bg-white/80 backdrop-blur rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-lg text-ink">2-Week Activity</h3>
        <div className="flex items-center gap-1.5 text-[11px] text-ink/45">
          Less
          {["#EFEEF6", "#D5D0F3", "#B0A6E6", "#7F77DD", "#534AB7"].map((c) => (
            <span key={c} className="w-3 h-3 rounded-sm" style={{ background: c }} />
          ))}
          More
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {DAY_LABELS.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-semibold text-ink/35">{d}</div>
        ))}
        {cells.map((c) => (
          <button
            key={c.key}
            onClick={() => onSelectDate && onSelectDate(c.key)}
            title={`${formatShort(c.key)} — ${c.done}/${c.total} done`}
            className="aspect-square rounded-md transition-transform hover:scale-110 hover:ring-2 hover:ring-purple-mid/40"
            style={{ background: shade(c.done) }}
          />
        ))}
      </div>
    </div>
  );
}
