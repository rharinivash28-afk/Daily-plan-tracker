import React, { useState } from "react";
import { Sun, Moon, Sparkles, Heart } from "lucide-react";
import Button from "../ui/Button.jsx";
import { useStore } from "../../store/habitStore.jsx";
import { useTheme } from "../../hooks/useTheme.js";

const VERSION = "2.0.0";

function Section({ title, children }) {
  return (
    <div className="p-5 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card-light dark:bg-card-dark">
      <h3 className="text-sm font-semibold text-ink dark:text-ink-dark mb-3">{title}</h3>
      {children}
    </div>
  );
}

export default function SettingsView({ onToast }) {
  const { state, dispatch } = useStore();
  const { isDark, toggle } = useTheme();
  const [name, setName] = useState(state.user.name);

  return (
    <div className="space-y-5 max-w-xl">
      <h1 className="text-2xl font-bold text-ink dark:text-ink-dark">Settings</h1>

      <Section title="Profile">
        <label className="block text-sm text-ink-muted mb-1.5">Your name</label>
        <div className="flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-bg-light dark:bg-bg-dark text-ink dark:text-ink-dark focus:outline-none focus:ring-2 focus:ring-purple-400" />
          <Button onClick={() => { dispatch({ type: "SET_USER", patch: { name: name.trim() || "friend" } }); onToast && onToast.success("Saved! ✨"); }}>Save</Button>
        </div>
      </Section>

      <Section title="Preferences">
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-ink dark:text-ink-dark flex items-center gap-2">{isDark ? <Moon size={16} /> : <Sun size={16} />} Dark mode</span>
          <button onClick={toggle} className={`w-11 h-6 rounded-full transition-colors relative ${isDark ? "bg-purple-600" : "bg-black/15"}`}>
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${isDark ? "left-[22px]" : "left-0.5"}`} />
          </button>
        </div>
        <div className="flex items-center justify-between py-1 mt-2">
          <span className="text-sm text-ink dark:text-ink-dark">Week starts on</span>
          <div className="flex gap-1">
            {[["Sun", 0], ["Mon", 1]].map(([lbl, val]) => (
              <button key={val} onClick={() => dispatch({ type: "SET_USER", patch: { weekStartsOn: val } })}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${state.user.weekStartsOn === val ? "bg-purple-600 text-white" : "border border-black/[0.08] dark:border-white/[0.08] text-ink-muted"}`}>
                {lbl}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between py-1 mt-2">
          <span className="text-sm text-ink dark:text-ink-dark">Default reminder</span>
          <input type="time" value={state.user.reminderTime} onChange={(e) => dispatch({ type: "SET_USER", patch: { reminderTime: e.target.value } })}
            className="px-3 py-1.5 rounded-lg border border-black/[0.08] dark:border-white/[0.08] bg-bg-light dark:bg-bg-dark text-ink dark:text-ink-dark text-sm" />
        </div>
      </Section>

      <Section title="About">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl grid place-items-center shrink-0" style={{ background: "#534AB7" }}>
            <Sparkles size={22} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-ink dark:text-ink-dark">Habitflow</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-100">v{VERSION}</span>
            </div>
            <p className="text-sm text-ink-muted mt-0.5">Build better days, one habit at a time.</p>
          </div>
        </div>

        <p className="text-sm text-ink-muted mt-4 leading-relaxed">
          Habitflow helps you build lasting routines with gentle nudges, streaks, and a little
          celebration when you finish your day. Your data stays private — everything is stored
          right here on your device, never on a server.
        </p>

        <div className="flex items-center gap-1.5 text-xs text-ink-hint mt-4 pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
          Made with <Heart size={12} className="text-pink fill-pink" /> for people building better days.
        </div>
      </Section>
    </div>
  );
}
