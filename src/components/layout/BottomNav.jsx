import React from "react";
import { Home, Calendar, BarChart2, Menu } from "lucide-react";

const TABS = [
  { id: "today", label: "Today", icon: Home },
  { id: "weekly", label: "Weekly", icon: Calendar },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
  { id: "more", label: "More", icon: Menu },
];

export default function BottomNav({ view, setView }) {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-card-light dark:bg-card-dark border-t border-black/[0.08] dark:border-white/[0.08] flex"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TABS.map(({ id, label, icon: Icon }) => {
        const on = view === id || (id === "more" && ["calendar", "streaks", "journal", "settings"].includes(view));
        return (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] ${on ? "text-accent" : "text-ink-hint"}`}
          >
            <Icon size={22} /> {label}
          </button>
        );
      })}
    </nav>
  );
}
