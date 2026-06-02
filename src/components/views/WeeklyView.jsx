import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { weekDays, addDays, KEY, isSameDay, DOW_FULL } from "../../utils/dates.js";
import { isHabitScheduledOn, isCompletedOn, dayCompletion } from "../../utils/streakLogic.js";

export default function WeeklyView({ habits, weekStartsOn, onToggle }) {
  const [anchor, setAnchor] = useState(new Date());
  const days = useMemo(() => weekDays(anchor, weekStartsOn), [anchor, weekStartsOn]);
  const active = habits.filter((h) => !h.archived);
  const now = new Date();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink dark:text-ink-dark">Weekly</h1>
        <div className="flex items-center gap-1">
          <button onClick={() => setAnchor((d) => addDays(d, -7))} className="p-2 rounded-lg text-ink-muted hover:bg-black/5 dark:hover:bg-white/10"><ChevronLeft size={18} /></button>
          <button onClick={() => setAnchor(new Date())} className="px-3 py-1.5 text-sm rounded-lg text-ink-muted hover:bg-black/5 dark:hover:bg-white/10">This week</button>
          <button onClick={() => setAnchor((d) => addDays(d, 7))} className="p-2 rounded-lg text-ink-muted hover:bg-black/5 dark:hover:bg-white/10"><ChevronRight size={18} /></button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {days.map((d, i) => {
          const isToday = isSameDay(d, now);
          const due = active.filter((h) => isHabitScheduledOn(h, d));
          const { pct } = dayCompletion(habits, d);
          return (
            <div key={i} className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] overflow-hidden bg-card-light dark:bg-card-dark">
              <div className={`px-3 py-2 text-center ${isToday ? "bg-purple-600 text-white" : "bg-bg-light dark:bg-white/5 text-ink dark:text-ink-dark"}`}>
                <div className="text-xs font-medium">{DOW_FULL[i]}</div>
                <div className="text-lg font-bold">{format(d, "d")}</div>
              </div>
              <div className="p-2 space-y-1.5 min-h-[80px]">
                {due.length === 0 && <div className="text-[11px] text-ink-hint text-center py-2">—</div>}
                {due.map((h) => {
                  const done = isCompletedOn(h, d);
                  return (
                    <button key={h.id} onClick={() => onToggle(h.id, KEY(d))}
                      className={`w-full flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium text-left transition-colors ${
                        done ? "bg-[#E1F5EE] text-[#085041] dark:bg-[#0A2E25] dark:text-[#7FD6B9]" : "border border-purple-200 text-purple-600 dark:border-purple-900"
                      }`}>
                      <span>{h.emoji}</span>
                      <span className={`truncate ${done ? "line-through" : ""}`}>{h.name}</span>
                    </button>
                  );
                })}
              </div>
              <div className="px-3 py-1.5 text-center text-[11px] text-ink-muted border-t border-black/[0.06] dark:border-white/[0.08]">{pct}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
