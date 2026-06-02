import React from "react";

// Flat metric card with a label, big value, optional progress bar + footnote.
export default function MetricCard({ label, icon, value, sub, accent = "#7F77DD", pct, footnote, delay = 0 }) {
  return (
    <div
      className="card-border bg-white/80 backdrop-blur rounded-xl p-5 anim-slide-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-ink/50">
        {icon}
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-display text-3xl leading-none" style={{ color: accent }}>
          {value}
        </span>
        {sub && <span className="text-sm text-ink/60">{sub}</span>}
      </div>
      {typeof pct === "number" && (
        <div className="mt-4 h-2 rounded-full bg-ink/5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.min(100, pct)}%`, background: accent }}
          />
        </div>
      )}
      {footnote && <div className="mt-2 text-xs text-ink/50">{footnote}</div>}
    </div>
  );
}
