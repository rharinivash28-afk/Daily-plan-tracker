import React, { useMemo } from "react";
import { Flame } from "lucide-react";
import { lastNDays } from "../../utils/dates.js";
import { getStreak, getLongestStreak, isHabitScheduledOn, isCompletedOn } from "../../utils/streakLogic.js";
import { catColors } from "../../utils/colors.js";
import { useTheme } from "../../hooks/useTheme.js";

function MiniDots({ habit }) {
  const days = lastNDays(14);
  return (
    <div className="flex gap-1">
      {days.map((d, i) => {
        const done = isCompletedOn(habit, d);
        const scheduled = isHabitScheduledOn(habit, d);
        return <span key={i} className={`w-2 h-2 rounded-full ${done ? "bg-purple-600" : scheduled ? "bg-black/15 dark:bg-white/15" : "bg-black/5 dark:bg-white/5"}`} />;
      })}
    </div>
  );
}

export default function StreaksView({ habits }) {
  const { isDark } = useTheme();
  const active = habits.filter((h) => !h.archived);
  const ranked = useMemo(
    () => active.map((h) => ({ h, cur: getStreak(h), longest: getLongestStreak(h) })).sort((a, b) => b.cur - a.cur),
    [active]
  );
  const top = ranked[0];

  if (active.length === 0) {
    return (
      <div className="grid place-items-center text-center py-20">
        <Flame size={48} className="text-purple-400 mb-3" />
        <p className="text-ink-muted">Complete a habit 2 days in a row to start a streak.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-ink dark:text-ink-dark">Streaks</h1>

      <div className="p-6 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card-light dark:bg-card-dark flex items-center gap-4">
        <Flame size={40} className="text-[#D85A30]" />
        <div>
          <div className="text-sm text-ink-muted">Your longest active streak</div>
          <div className="text-3xl font-bold text-ink dark:text-ink-dark">{top ? top.cur : 0} days</div>
          {top && top.cur > 0 && <div className="text-sm text-ink-muted">{top.h.emoji} {top.h.name}</div>}
        </div>
      </div>

      <div className="space-y-2.5">
        {ranked.map(({ h, cur, longest }, i) => {
          const c = catColors(h.category, isDark);
          const glow = cur >= 30;
          return (
            <div key={h.id} className={`flex items-center gap-3 sm:gap-4 p-4 rounded-2xl bg-card-light dark:bg-card-dark ${glow ? "streak-gradient-border" : "border border-black/[0.08] dark:border-white/[0.08]"}`}>
              <span className="w-6 text-center font-bold text-ink-hint">#{i + 1}</span>
              <span className="text-xl">{h.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-ink dark:text-ink-dark truncate">{h.name}</div>
                <div className="text-xs text-ink-muted">Longest ever: {longest} days</div>
              </div>
              <div className="hidden sm:block"><MiniDots habit={h} /></div>
              <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cur >= 7 ? "bg-[#FAEEDA] text-[#633806]" : ""}`}
                style={cur < 7 ? { background: c.bg, color: c.text } : {}}>
                🔥 {cur}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
