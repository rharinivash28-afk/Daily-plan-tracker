import React, { useState, useMemo } from "react";
import { CheckCircle2, Flame, TrendingUp, Sparkles } from "lucide-react";
import MetricCard from "./MetricCard.jsx";
import HabitCard from "./HabitCard.jsx";
import Heatmap from "./Heatmap.jsx";
import { isCompleted } from "../utils/dates.js";

export default function TodayView({ store, onEdit, onDelete, onSelectDate }) {
  const { habitsForDate, dayProgress, today, bestStreak, weekPct, prevWeekPct, recoveryHabits, toggle, todayKey } = store;
  const [focusMode, setFocusMode] = useState(false);

  const dueHabits = habitsForDate(todayKey);
  const incomplete = dueHabits.filter((h) => !isCompleted(h, todayKey));

  const visible = useMemo(() => {
    if (focusMode) return incomplete.slice(0, 3);
    return dueHabits;
  }, [focusMode, incomplete, dueHabits]);

  const aboveAvg = weekPct >= prevWeekPct;

  return (
    <div className="space-y-6">
      {/* Recovery banner */}
      {recoveryHabits.length > 0 && (
        <div className="card-border rounded-xl px-4 py-3 flex items-center gap-3 anim-slide-in" style={{ background: "#FBE8E0" }}>
          <span className="text-xl">💪</span>
          <div className="text-sm">
            <span className="font-semibold text-coral">Streak broken</span>
            <span className="text-ink/70"> — fresh start today. {recoveryHabits.map((h) => h.name).slice(0, 2).join(", ")}{recoveryHabits.length > 2 ? "…" : ""}</span>
          </div>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Today" icon={<CheckCircle2 size={14} />}
          value={`${today.done}/${today.total}`} pct={today.pct}
          footnote={`${today.pct}% complete`} accent="#7F77DD" delay={0}
        />
        <MetricCard
          label="Best Streak" icon={<Flame size={14} />}
          value={`${bestStreak.count}`} sub={`${bestStreak.emoji} ${bestStreak.name}`}
          footnote="days in a row 🔥" accent="#D85A30" delay={80}
        />
        <MetricCard
          label="This Week" icon={<TrendingUp size={14} />}
          value={`${weekPct}%`} pct={weekPct}
          footnote={aboveAvg ? "↑ Above avg" : "↓ Below avg"} accent="#1D9E75" delay={160}
        />
      </div>

      {/* Habit list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl text-ink flex items-center gap-2">
            <Sparkles size={18} className="text-purple-mid" />
            Today's Habits
          </h2>
          <button
            onClick={() => setFocusMode((v) => !v)}
            className={`text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
              focusMode ? "bg-purple-dark text-white" : "text-purple-dark hover:bg-purple-light"
            }`}
          >
            {focusMode ? "Exit focus" : "Focus mode"}
          </button>
        </div>

        {visible.length === 0 ? (
          <div className="card-border bg-white/70 rounded-xl p-8 text-center text-ink/50">
            {focusMode ? "🎉 Nothing left — all caught up!" : "No habits scheduled for today."}
          </div>
        ) : (
          <div className="space-y-2.5">
            {visible.map((h, i) => (
              <HabitCard
                key={h.id} habit={h} dateKey={todayKey}
                onToggle={toggle} onEdit={onEdit} onDelete={onDelete} delay={i * 50}
              />
            ))}
          </div>
        )}
      </div>

      {/* Heatmap */}
      <Heatmap dayProgress={dayProgress} onSelectDate={onSelectDate} />
    </div>
  );
}
