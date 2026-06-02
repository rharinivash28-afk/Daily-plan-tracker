import React from "react";
import HeatmapCell from "../ui/HeatmapCell.jsx";
import { useHeatmap } from "../../hooks/useHeatmap.js";
import { DOW_LABELS } from "../../utils/dates.js";

export default function Heatmap({ habits }) {
  const cells = useHeatmap(habits, 14);
  const labels = [...DOW_LABELS, ...DOW_LABELS];

  return (
    <div className="p-5 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card-light dark:bg-card-dark">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-ink dark:text-ink-dark">Last 2 weeks</h3>
        <div className="flex items-center gap-1.5 text-[11px] text-ink-muted">
          Less
          {["#F1EFE8", "#CECBF6", "#AFA9EC", "#7F77DD", "#534AB7"].map((c) => (
            <span key={c} className="w-3 h-3 rounded-sm" style={{ background: c }} />
          ))}
          More
        </div>
      </div>
      <div className="flex gap-1.5 mb-1.5">
        {labels.map((l, i) => <div key={i} className="flex-1 text-center text-[9px] text-ink-hint">{l}</div>)}
      </div>
      <div className="flex gap-1.5">
        {cells.map((cell) => <HeatmapCell key={cell.key} cell={cell} />)}
      </div>
    </div>
  );
}
