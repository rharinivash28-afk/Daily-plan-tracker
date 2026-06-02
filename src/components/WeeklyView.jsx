import React from "react";
import { getWeekDates, getToday, fromKey, isCompleted, isScheduled } from "../utils/dates.js";
import { DAY_FULL, categoryColor } from "../utils/constants.js";

export default function WeeklyView({ store }) {
  const week = getWeekDates(new Date());
  const today = getToday();
  const { habits, toggle } = store;

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl text-ink">This Week</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {week.map((dKey, i) => {
          const isToday = dKey === today;
          const dayNum = fromKey(dKey).getDate();
          const due = habits.filter((h) => isScheduled(h, dKey));
          return (
            <div
              key={dKey}
              className={`card-border rounded-xl p-3 anim-slide-in ${isToday ? "bg-purple-light" : "bg-white/75"}`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-baseline justify-between mb-2">
                <span className={`text-xs font-bold uppercase ${isToday ? "text-purple-dark" : "text-ink/45"}`}>{DAY_FULL[i]}</span>
                <span className={`font-display text-lg ${isToday ? "text-purple-dark" : "text-ink/70"}`}>{dayNum}</span>
              </div>
              <div className="space-y-1.5">
                {due.length === 0 && <div className="text-[11px] text-ink/30">—</div>}
                {due.map((h) => {
                  const done = isCompleted(h, dKey);
                  return (
                    <button
                      key={h.id}
                      onClick={() => toggle(h.id, dKey)}
                      className="w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium text-left transition-all"
                      style={
                        done
                          ? { background: categoryColor(h.category), color: "#fff" }
                          : { background: "rgba(28,26,46,0.05)", color: "rgba(28,26,46,0.6)" }
                      }
                    >
                      <span>{h.emoji}</span>
                      <span className={`truncate ${done ? "line-through" : ""}`}>{h.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
