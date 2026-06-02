import React from "react";
import {
  Sparkles, LayoutDashboard, CalendarDays, CalendarRange,
  BarChart3, Flame, NotebookPen, Settings,
} from "lucide-react";
import { NAV_ITEMS, CATEGORIES, CATEGORY_NAMES } from "../utils/constants.js";

const ICONS = { LayoutDashboard, CalendarDays, CalendarRange, BarChart3, Flame, NotebookPen };

export default function Sidebar({ active, onNavigate, onOpenSettings }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-[220px] shrink-0 h-screen sticky top-0 px-4 py-6 border-r border-ink/10 bg-white/60 backdrop-blur z-10"
      >
        <div className="flex items-center gap-2 px-2 mb-8">
          <div className="w-8 h-8 rounded-lg grid place-items-center" style={{ background: "linear-gradient(135deg,#7F77DD,#534AB7)" }}>
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-display text-xl font-semibold text-ink">Habitflow</span>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = ICONS[item.icon];
            const on = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  on ? "bg-purple-light text-purple-dark" : "text-ink/60 hover:bg-ink/5 hover:text-ink"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-8 px-3 text-[11px] font-bold uppercase tracking-wider text-ink/35">
          Categories
        </div>
        <ul className="mt-2 flex flex-col gap-0.5">
          {CATEGORY_NAMES.map((name) => (
            <li key={name} className="flex items-center gap-2.5 px-3 py-1.5 text-sm text-ink/65">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: CATEGORIES[name].color }} />
              {name}
            </li>
          ))}
        </ul>

        <button
          onClick={onOpenSettings}
          className="mt-auto flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-ink/55 hover:bg-ink/5 hover:text-ink transition-colors"
        >
          <Settings size={18} />
          Settings
        </button>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-ink/10 flex justify-around px-2 py-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon];
          const on = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-md text-[10px] font-medium ${
                on ? "text-purple-dark" : "text-ink/45"
              }`}
            >
              <Icon size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </>
  );
}
