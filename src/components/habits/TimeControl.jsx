import React from "react";
import { Clock, CheckCircle2 } from "lucide-react";

// Pretty-print "HH:MM" (24h) -> "6:00 AM"
function pretty(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${String(m).padStart(2, "0")} ${ampm}`;
}

// A time chip: a label overlaid by a transparent native time input.
// Single click target (the input) = no double-trigger, opens the picker everywhere.
function TimeChip({ value, onChange, icon, label, tone = "muted" }) {
  const toneCls = tone === "done"
    ? "text-[#1D9E75] bg-[#E1F5EE] dark:bg-[#0A2E25]"
    : value
      ? "text-purple-600 bg-purple-50 dark:bg-purple-900/30"
      : "text-ink-hint bg-black/[0.04] dark:bg-white/[0.06]";

  return (
    <span className={`relative inline-flex items-center gap-1 pl-1.5 pr-2 py-0.5 rounded-full text-[11px] font-medium ${toneCls}`}>
      {icon}
      <span>{value ? pretty(value) : label}</span>
      <input
        type="time" value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </span>
  );
}

// Shows target time (always) and actual time (when done). Both editable.
export default function TimeControl({ habit, dateKey, done, onSetTarget, onSetActual }) {
  const actual = (habit.actualTimes || {})[dateKey] || "";
  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
      <TimeChip
        value={habit.targetTime} onChange={(t) => onSetTarget(habit.id, t)}
        icon={<Clock size={12} />} label="Set target"
      />
      {done && (
        <TimeChip
          value={actual} onChange={(t) => onSetActual(habit.id, t, dateKey)}
          icon={<CheckCircle2 size={12} />} label="Add time" tone="done"
        />
      )}
    </div>
  );
}
