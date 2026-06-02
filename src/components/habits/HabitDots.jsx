import React from "react";
import { Check } from "lucide-react";
import { weekDays, KEY, isSameDay, DOW_LABELS } from "../../utils/dates.js";
import { isHabitScheduledOn, isCompletedOn } from "../../utils/streakLogic.js";
import { catColors } from "../../utils/colors.js";
import { useTheme } from "../../hooks/useTheme.js";

// 7-day dot row (Mon–Sun).
export default function HabitDots({ habit, weekStartsOn = 1 }) {
  const { isDark } = useTheme();
  const c = catColors(habit.category, isDark);
  const days = weekDays(new Date(), weekStartsOn);
  const now = new Date();

  return (
    <div className="flex items-center gap-1.5">
      {days.map((d, i) => {
        const scheduled = isHabitScheduledOn(habit, d);
        const done = isCompletedOn(habit, d);
        const isToday = isSameDay(d, now);

        let inner = null;
        let style = {};
        let cls = "border";

        if (done) {
          style = { background: c.dot, borderColor: c.dot };
          inner = <Check size={10} className="text-white" strokeWidth={3} />;
        } else if (isToday) {
          cls = "border-2 border-purple-400";
        } else if (!scheduled) {
          cls = "border border-black/10 dark:border-white/10 opacity-40";
        } else {
          cls = "border border-black/15 dark:border-white/15";
        }

        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className={`w-[18px] h-[18px] rounded-full grid place-items-center ${cls}`} style={style}>
              {inner}
            </div>
            <span className="text-[9px] text-ink-hint">{DOW_LABELS[i]}</span>
          </div>
        );
      })}
    </div>
  );
}
