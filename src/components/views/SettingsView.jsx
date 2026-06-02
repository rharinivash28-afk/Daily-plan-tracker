import React, { useState, useRef } from "react";
import { Sun, Moon, Download, Upload, Trash2 } from "lucide-react";
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
  const [confirmText, setConfirmText] = useState("");
  const fileRef = useRef(null);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "habitflow-data.json"; a.click();
    URL.revokeObjectURL(url);
    onToast && onToast.success("Data exported! ✨");
  };

  const importData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        dispatch({ type: "IMPORT", data });
        onToast && onToast.success("Data imported! ✨");
      } catch (err) {
        onToast && onToast.error("Couldn't read that file 😕");
      }
    };
    reader.readAsText(file);
  };

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

      <Section title="Data">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportData}><Download size={16} /> Export</Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload size={16} /> Import</Button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={importData} />
        </div>
        <div className="mt-4 pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
          <p className="text-sm text-ink-muted mb-2">Reset all data — type <b>DELETE</b> to confirm.</p>
          <div className="flex gap-2">
            <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="DELETE"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-bg-light dark:bg-bg-dark text-ink dark:text-ink-dark focus:outline-none focus:ring-2 focus:ring-[#D85A30]" />
            <Button variant="danger" disabled={confirmText !== "DELETE"}
              onClick={() => { dispatch({ type: "RESET" }); setConfirmText(""); onToast && onToast.info("All data reset."); }}>
              <Trash2 size={16} /> Reset
            </Button>
          </div>
        </div>
      </Section>

      <Section title="About">
        <p className="text-sm text-ink-muted">Habitflow v{VERSION}</p>
        <p className="text-sm text-ink-muted mt-1">Built with care to help you build better days. ✨</p>
      </Section>
    </div>
  );
}
