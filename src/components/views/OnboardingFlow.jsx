import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, ArrowRight, Plus, X } from "lucide-react";
import Button from "../ui/Button.jsx";
import { STARTER_PACKS, EMOJI_OPTIONS } from "../../utils/habitDefaults.js";
import { useHabits } from "../../hooks/useHabits.js";
import { useStore } from "../../store/habitStore.jsx";

const slide = {
  enter: { x: 40, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -40, opacity: 0 },
};

export default function OnboardingFlow() {
  const { addHabits } = useHabits();
  const { dispatch } = useStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [packs, setPacks] = useState([]);        // selected pack ids (multi)
  const [custom, setCustom] = useState([]);      // [{ name, emoji }]
  const [adding, setAdding] = useState(false);   // inline add form open
  const [draftName, setDraftName] = useState("");
  const [draftEmoji, setDraftEmoji] = useState("🎯");

  // Step 3 auto-advance
  useEffect(() => {
    if (step === 2) {
      const t = setTimeout(finish, 2500);
      return () => clearTimeout(t);
    }
  }, [step]);

  const togglePack = (id) =>
    setPacks((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  const addCustom = () => {
    if (!draftName.trim()) return;
    setCustom((prev) => [...prev, { name: draftName.trim(), emoji: draftEmoji, category: "health", frequency: "daily" }]);
    setDraftName(""); setDraftEmoji("🎯"); setAdding(false);
  };

  const totalSelected = packs.reduce((n, id) => {
    const p = STARTER_PACKS.find((x) => x.id === id);
    return n + (p ? p.habits.length : 0);
  }, 0) + custom.length;

  function commitPack() {
    const fromPacks = packs.flatMap((id) => STARTER_PACKS.find((p) => p.id === id)?.habits || []);
    const all = [...fromPacks, ...custom];
    if (all.length) addHabits(all);
    setStep(2);
  }

  function finish() {
    dispatch({ type: "SET_USER", patch: { name: name.trim() || "friend", onboardingDone: true } });
  }

  return (
    <div className="min-h-screen grid place-items-center px-5 bg-bg-light dark:bg-bg-dark">
      <div className="w-full max-w-md">
        {/* progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === step ? "w-8 bg-purple-600" : "w-1.5 bg-purple-200 dark:bg-purple-900"}`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="s1" variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-purple-50 dark:bg-purple-900/40 grid place-items-center mb-6">
                <Sparkles className="text-purple-600" size={36} />
              </div>
              <h1 className="text-2xl font-bold text-ink dark:text-ink-dark">Welcome to Habitflow</h1>
              <p className="mt-2 text-ink-muted">Small habits, big change. Let's set up your first routine in 30 seconds.</p>
              <div className="mt-7 text-left">
                <label className="block text-sm font-medium mb-1.5 text-ink dark:text-ink-dark">What should we call you?</label>
                <input
                  autoFocus value={name} onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && name.trim() && setStep(1)}
                  placeholder="First name"
                  className="w-full px-4 py-3 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-card-light dark:bg-card-dark text-ink dark:text-ink-dark focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <Button size="lg" className="w-full mt-6" onClick={() => setStep(1)} disabled={!name.trim()}>
                Let's go <ArrowRight size={18} />
              </Button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="s2" variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <h1 className="text-2xl font-bold text-center text-ink dark:text-ink-dark">Choose your starting habits</h1>
              <p className="mt-2 text-center text-ink-muted">Pick any packs you like and add your own. You can change these anytime.</p>

              <div className="mt-6 space-y-3 max-h-[46vh] overflow-y-auto pr-1">
                {STARTER_PACKS.map((p) => {
                  const active = packs.includes(p.id);
                  return (
                    <button
                      key={p.id} onClick={() => togglePack(p.id)}
                      className={`relative w-full text-left p-4 rounded-2xl border transition-colors ${
                        active ? "border-accent bg-accent-soft" : "border-black/[0.08] dark:border-white/[0.08] bg-card-light dark:bg-card-dark hover:border-purple-200"
                      }`}
                    >
                      <span className={`absolute top-3 right-3 w-6 h-6 rounded-full grid place-items-center border-2 transition-colors ${active ? "bg-accent border-accent" : "border-black/15 dark:border-white/20"}`}>
                        {active && <Check size={14} className="text-white" />}
                      </span>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{p.emoji}</span>
                        <div>
                          <div className="font-semibold text-ink dark:text-ink-dark">{p.title}</div>
                          <div className="text-sm text-ink-muted mt-0.5">{p.description}</div>
                          <span className="inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full bg-accent-soft text-accent">
                            {p.habits.length} habits included
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {/* custom habits added so far */}
                {custom.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-accent/40 bg-accent-soft">
                    <span className="text-xl">{c.emoji}</span>
                    <span className="flex-1 text-sm font-medium text-ink dark:text-ink-dark truncate">{c.name}</span>
                    <button onClick={() => setCustom((prev) => prev.filter((_, j) => j !== i))}
                      className="p-1 rounded-md text-ink-muted hover:bg-black/5 dark:hover:bg-white/10"><X size={15} /></button>
                  </div>
                ))}

                {/* inline add form / + button */}
                {adding ? (
                  <div className="p-3 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card-light dark:bg-card-dark">
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus value={draftName} onChange={(e) => setDraftName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") addCustom(); }}
                        placeholder="e.g. Stretch for 5 minutes"
                        className="flex-1 px-3 py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-bg-light dark:bg-bg-dark text-ink dark:text-ink-dark text-sm focus:outline-none focus:ring-2 ring-accent"
                      />
                      <button onClick={addCustom} className="px-3 py-2 rounded-xl text-sm font-semibold text-white bg-accent">Add</button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {EMOJI_OPTIONS.slice(0, 12).map((e) => (
                        <button key={e} onClick={() => setDraftEmoji(e)}
                          className={`w-8 h-8 grid place-items-center rounded-lg text-lg ${draftEmoji === e ? "bg-accent-soft ring-1 ring-accent" : "hover:bg-black/5 dark:hover:bg-white/10"}`}>
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setAdding(true)}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border border-dashed border-black/15 dark:border-white/20 text-ink-muted hover:text-accent hover:border-accent transition-colors">
                    <Plus size={18} /> Add your own habit
                  </button>
                )}
              </div>

              <Button size="lg" className="w-full mt-5" onClick={commitPack} disabled={totalSelected === 0}>
                {totalSelected === 0 ? "Pick or add a habit" : `Add ${totalSelected} habit${totalSelected === 1 ? "" : "s"}`} <ArrowRight size={18} />
              </Button>
              <button onClick={() => setStep(2)} className="w-full mt-2 text-sm text-ink-muted hover:text-ink dark:hover:text-ink-dark">
                Skip for now
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s3" variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="text-center">
              <motion.div className="w-24 h-24 mx-auto mb-6">
                <svg viewBox="0 0 52 52" className="w-full h-full">
                  <motion.circle
                    cx="26" cy="26" r="24" fill="none" stroke="#534AB7" strokeWidth="3"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }}
                  />
                  <motion.path
                    d="M16 27 l7 7 l14 -16" fill="none" stroke="#534AB7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.5 }}
                  />
                </svg>
              </motion.div>
              <h1 className="text-2xl font-bold text-ink dark:text-ink-dark">You're all set, {name.trim() || "friend"}! 🎉</h1>
              <p className="mt-2 text-ink-muted">Your habits are ready. Check one off today to start your streak.</p>
              <Button size="lg" className="w-full mt-7" onClick={finish}>
                Start tracking <ArrowRight size={18} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
