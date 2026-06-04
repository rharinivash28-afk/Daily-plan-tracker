import React, { useState, useEffect } from "react";
import { Sun, Moon, Sparkles, Heart, Plus, Pencil, Trash2, ArchiveRestore, Check, X, Bell, AlertTriangle } from "lucide-react";
import Button from "../ui/Button.jsx";
import { useStore } from "../../store/habitStore.jsx";
import { useTheme } from "../../hooks/useTheme.js";
import { useHabits } from "../../hooks/useHabits.js";
import { requestNotificationPermission } from "../../hooks/useReminders.js";
import { allCategories, BUILTIN_KEYS, catColors } from "../../utils/colors.js";

const VERSION = "2.2.0";
const ACCENTS = ["#534AB7", "#1D9E75", "#378ADD", "#D85A30", "#BA7517", "#D4537E"];

function Section({ title, children }) {
  return (
    <div className="p-5 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card-light dark:bg-card-dark">
      <h3 className="text-sm font-semibold text-ink dark:text-ink-dark mb-3">{title}</h3>
      {children}
    </div>
  );
}

export default function SettingsView({ onToast, onAddCategory }) {
  const { state, dispatch } = useStore();
  const { isDark, toggle } = useTheme();
  const { habits, addCategory, renameCategory, deleteCategory, updateHabit, deleteHabit, setUser } = useHabits();
  const [name, setName] = useState(state.user.name);
  const [editingCat, setEditingCat] = useState(null); // key being renamed
  const [catDraft, setCatDraft] = useState("");
  const [perm, setPerm] = useState(typeof Notification !== "undefined" ? Notification.permission : "unsupported");
  const [confirmWipe, setConfirmWipe] = useState(false);

  const deleteAllData = () => {
    dispatch({ type: "RESET" });
    try { localStorage.removeItem("habitflow_data"); } catch (e) {}
    setConfirmWipe(false);
    onToast && onToast.info("All data deleted.");
  };

  const enableReminders = async () => {
    const p = await requestNotificationPermission();
    setPerm(p);
    if (p === "granted") {
      setUser({ remindersEnabled: true });
      onToast && onToast.success("Reminders on! ✨");
      try { new Notification("Habitflow ✨", { body: "Reminders are on. We'll nudge you at your set time." }); } catch (e) {}
    } else if (p === "denied") {
      onToast && onToast.error("Notifications blocked in your browser settings.");
    }
  };
  const disableReminders = () => { setUser({ remindersEnabled: false }); onToast && onToast.info("Reminders off."); };

  const customCats = allCategories().filter((c) => !BUILTIN_KEYS.includes(c.key));
  const archived = habits.filter((h) => h.archived);

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
          <span className="text-sm text-ink dark:text-ink-dark flex items-center gap-2"><Bell size={15} /> Daily reminder</span>
          <input type="time" value={state.user.reminderTime} onChange={(e) => dispatch({ type: "SET_USER", patch: { reminderTime: e.target.value } })}
            className="px-3 py-1.5 rounded-lg border border-black/[0.08] dark:border-white/[0.08] bg-bg-light dark:bg-bg-dark text-ink dark:text-ink-dark text-sm" />
        </div>
        <div className="mt-2">
          {perm === "unsupported" ? (
            <p className="text-xs text-ink-muted">Your browser doesn't support notifications.</p>
          ) : state.user.remindersEnabled && perm === "granted" ? (
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#1D9E75] font-medium">✓ Reminders on</span>
              <button onClick={disableReminders} className="text-xs font-medium text-ink-muted hover:text-ink dark:hover:text-ink-dark underline">Turn off</button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={enableReminders}><Bell size={14} /> Enable notifications</Button>
          )}
          <p className="text-[11px] text-ink-hint mt-1.5 leading-relaxed">
            Reminders nudge you at your set time about unfinished habits. They only fire while Habitflow is open in a browser tab.
          </p>
        </div>
      </Section>

      <Section title="Appearance">
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-ink dark:text-ink-dark">Accent color</span>
          <div className="flex gap-1.5">
            {ACCENTS.map((c) => (
              <button key={c} onClick={() => setUser({ accent: c })}
                className={`w-7 h-7 rounded-full transition-transform ${state.user.accent === c ? "ring-2 ring-offset-2 ring-offset-card-light dark:ring-offset-card-dark scale-110" : ""}`}
                style={{ background: c, boxShadow: state.user.accent === c ? `0 0 0 2px ${c}` : "none" }} aria-label="Accent" />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between py-1 mt-2">
          <span className="text-sm text-ink dark:text-ink-dark">Text size</span>
          <div className="flex gap-1">
            {[["Normal", "normal"], ["Large", "large"]].map(([lbl, val]) => (
              <button key={val} onClick={() => setUser({ textSize: val })}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${(state.user.textSize || "normal") === val ? "bg-purple-600 text-white" : "border border-black/[0.08] dark:border-white/[0.08] text-ink-muted"}`}>
                {lbl}
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Categories">
        <div className="space-y-1.5">
          {allCategories().map((c) => {
            const isCustom = !BUILTIN_KEYS.includes(c.key);
            const editing = editingCat === c.key;
            return (
              <div key={c.key} className="flex items-center gap-2.5 py-1">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: c.dot }} />
                {editing ? (
                  <>
                    <input autoFocus value={catDraft} onChange={(e) => setCatDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { renameCategory(c.key, catDraft); setEditingCat(null); } }}
                      className="flex-1 px-2.5 py-1 rounded-lg border border-purple-400 bg-bg-light dark:bg-bg-dark text-ink dark:text-ink-dark text-sm focus:outline-none" />
                    <button onClick={() => { renameCategory(c.key, catDraft); setEditingCat(null); }} className="p-1 rounded-md text-[#1D9E75] hover:bg-black/5"><Check size={15} /></button>
                    <button onClick={() => setEditingCat(null)} className="p-1 rounded-md text-ink-muted hover:bg-black/5"><X size={15} /></button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-ink dark:text-ink-dark">{c.label}{!isCustom && <span className="text-ink-hint text-xs ml-2">built-in</span>}</span>
                    {isCustom && (
                      <>
                        <button onClick={() => { setEditingCat(c.key); setCatDraft(c.label); }} className="p-1 rounded-md text-ink-muted hover:bg-black/5 hover:text-purple-600"><Pencil size={14} /></button>
                        <button onClick={() => { deleteCategory(c.key); onToast && onToast.info("Category removed."); }} className="p-1 rounded-md text-ink-muted hover:bg-black/5 hover:text-[#D85A30]"><Trash2 size={14} /></button>
                      </>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
        <Button variant="outline" size="sm" className="mt-3" onClick={onAddCategory}><Plus size={15} /> Add category</Button>
      </Section>

      <Section title="Archived habits">
        {archived.length === 0 ? (
          <p className="text-sm text-ink-muted">No archived habits.</p>
        ) : (
          <div className="space-y-1.5">
            {archived.map((h) => (
              <div key={h.id} className="flex items-center gap-2.5 py-1">
                <span className="text-lg">{h.emoji}</span>
                <span className="flex-1 text-sm text-ink dark:text-ink-dark truncate">{h.name}</span>
                <button onClick={() => { updateHabit(h.id, { archived: false }); onToast && onToast.success("Restored! ✨"); }}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30">
                  <ArchiveRestore size={13} /> Restore
                </button>
                <button onClick={() => { deleteHabit(h.id); onToast && onToast.info("Deleted."); }}
                  className="p-1 rounded-md text-ink-muted hover:bg-black/5 hover:text-[#D85A30]"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Danger zone">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-[#D85A30] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-ink dark:text-ink-dark font-medium">Delete all data</p>
            <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">
              Permanently removes every habit, all your history, journal entries, categories, and settings.
              This can't be undone.
            </p>

            {!confirmWipe ? (
              <button onClick={() => setConfirmWipe(true)}
                className="mt-3 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-[#D85A30] border border-[#D85A30]/40 hover:bg-[#D85A30]/10 transition-colors">
                <Trash2 size={15} /> Delete all data
              </button>
            ) : (
              <div className="mt-3 p-3 rounded-xl border border-[#D85A30]/40 bg-[#D85A30]/[0.06]">
                <p className="text-sm text-ink dark:text-ink-dark font-medium">Are you absolutely sure?</p>
                <p className="text-xs text-ink-muted mt-0.5">Everything will be erased and the app will start fresh.</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setConfirmWipe(false)}
                    className="flex-1 py-2 rounded-lg text-sm font-medium text-ink-muted border border-black/[0.08] dark:border-white/[0.08] hover:bg-black/5 dark:hover:bg-white/10">
                    Cancel
                  </button>
                  <button onClick={deleteAllData}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold text-white bg-[#D85A30] hover:opacity-90">
                    Yes, delete everything
                  </button>
                </div>
              </div>
            )}
          </div>
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
