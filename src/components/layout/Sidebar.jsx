import React from "react";
import {
  Sparkles, LayoutDashboard, CalendarDays, CalendarRange, BarChart2, Flame, BookOpen, Settings,
} from "lucide-react";
import { CATEGORIES, CATEGORY_KEYS } from "../../utils/colors.js";
import { useHabits } from "../../hooks/useHabits.js";

const NAV = [
  { id: "today", label: "Today", icon: LayoutDashboard },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "weekly", label: "Weekly", icon: CalendarRange },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
  { id: "streaks", label: "Streaks", icon: Flame },
  { id: "journal", label: "Journal", icon: BookOpen },
];

export default function Sidebar({ view, setView, categoryFilter, setCategoryFilter }) {
  const { user } = useHabits();
  const initials = (user.name || "U").slice(0, 1).toUpperCase();

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0 border-r border-black/[0.08] dark:border-white/[0.08] bg-card-light dark:bg-card-dark px-4 py-5">
      <div className="flex items-center gap-2 px-2">
        <Sparkles className="text-purple-600" size={20} />
        <span className="font-medium text-[15px] text-ink dark:text-ink-dark">Habitflow</span>
      </div>
      <div className="my-4 border-t border-black/[0.06] dark:border-white/[0.08]" />

      <nav className="flex flex-col gap-0.5">
        {NAV.map(({ id, label, icon: Icon }) => {
          const on = view === id;
          return (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
                on ? "bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-100 font-medium" : "text-ink-muted hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              <Icon size={18} /> {label}
            </button>
          );
        })}
      </nav>

      <div className="mt-6 px-3 text-xs font-semibold uppercase tracking-wide text-ink-hint">Categories</div>
      <div className="mt-2 flex flex-col gap-0.5">
        <button
          onClick={() => setCategoryFilter(null)}
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${categoryFilter === null ? "text-purple-600 dark:text-purple-100 font-medium" : "text-ink-muted hover:bg-black/5 dark:hover:bg-white/10"}`}
        >
          <span className="w-2 h-2 rounded-full bg-purple-400" /> All habits
        </button>
        {CATEGORY_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => setCategoryFilter(key)}
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${categoryFilter === key ? "text-purple-600 dark:text-purple-100 font-medium" : "text-ink-muted hover:bg-black/5 dark:hover:bg-white/10"}`}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: CATEGORIES[key].dot }} /> {CATEGORIES[key].label}
          </button>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-3 pt-4">
        <div className="w-8 h-8 rounded-full bg-purple-600 text-white grid place-items-center text-sm font-semibold">{initials}</div>
        <span className="flex-1 text-sm text-ink dark:text-ink-dark truncate">{user.name || "You"}</span>
        <button onClick={() => setView("settings")} className="p-1.5 rounded-lg text-ink-muted hover:bg-black/5 dark:hover:bg-white/10" aria-label="Settings">
          <Settings size={18} />
        </button>
      </div>
    </aside>
  );
}
