import React from "react";
import { getStreakCount, getToday, lastNDays, isCompleted, isScheduled, fromKey } from "../utils/dates.js";
import { categoryColor, categorySoft } from "../utils/constants.js";

// Mini 14-day sparkline of completions.
function Sparkline({ habit }) {
  const days = lastNDays(14);
  return (
    <div className="flex items-end gap-0.5 h-6">
      {days.map((dKey) => {
        const scheduled = isScheduled(habit, dKey);
        const done = isCompleted(habit, dKey);
        const h = done ? 100 : scheduled ? 35 : 15;
        return (
          <div
            key={dKey}
            className="w-1.5 rounded-sm"
            style={{
              height: `${h}%`,
              background: done ? categoryColor(habit.category) : "rgba(28,26,46,0.12)",
            }}
          />
        );
      })}
    </div>
  );
}

export default function StreaksView({ store }) {
  const { habits } = store;
  const today = getToday();
  const ranked = [...habits]
    .map((h) => ({ h, streak: getStreakCount(h, today) }))
    .sort((a, b) => b.streak - a.streak);

  const medal = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl text-ink">Streak Leaderboard</h2>
      <div className="space-y-2.5">
        {ranked.map(({ h, streak }, i) => (
          <div
            key={h.id}
            className="card-border bg-white/80 backdrop-blur rounded-xl px-4 py-3.5 flex items-center gap-4 anim-slide-in"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="w-8 text-center font-display text-lg text-ink/40">
              {i < 3 ? medal[i] : i + 1}
            </div>
            <div
              className="w-10 h-10 rounded-lg grid place-items-center text-lg"
              style={{ background: categorySoft(h.category) }}
            >
              {h.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-ink truncate">{h.name}</div>
              <div className="text-xs font-medium" style={{ color: categoryColor(h.category) }}>{h.category}</div>
            </div>
            <Sparkline habit={h} />
            <div
              className={`flex items-center gap-1 font-bold px-3 py-1.5 rounded-full ${streak >= 7 ? "anim-pulse-glow" : ""}`}
              style={{ background: categorySoft(h.category), color: categoryColor(h.category) }}
            >
              🔥 {streak}
            </div>
          </div>
        ))}
        {ranked.length === 0 && (
          <div className="card-border bg-white/70 rounded-xl p-8 text-center text-ink/50">No habits yet.</div>
        )}
      </div>
    </div>
  );
}
