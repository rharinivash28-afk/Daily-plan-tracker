import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, ArrowRight } from "lucide-react";
import Button from "../ui/Button.jsx";
import { STARTER_PACKS } from "../../utils/habitDefaults.js";
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
  const [pack, setPack] = useState(null);

  // Step 3 auto-advance
  useEffect(() => {
    if (step === 2) {
      const t = setTimeout(finish, 2500);
      return () => clearTimeout(t);
    }
  }, [step]);

  function commitPack() {
    const chosen = STARTER_PACKS.find((p) => p.id === pack);
    if (chosen) addHabits(chosen.habits);
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
              <p className="mt-2 text-center text-ink-muted">Pick one pack to get started. You can add more anytime.</p>
              <div className="mt-6 space-y-3">
                {STARTER_PACKS.map((p) => {
                  const active = pack === p.id;
                  return (
                    <button
                      key={p.id} onClick={() => setPack(p.id)}
                      className={`relative w-full text-left p-4 rounded-2xl border transition-colors ${
                        active ? "border-purple-600 bg-purple-50 dark:bg-purple-900/30" : "border-black/[0.08] dark:border-white/[0.08] bg-card-light dark:bg-card-dark hover:border-purple-200"
                      }`}
                    >
                      {active && (
                        <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-purple-600 grid place-items-center">
                          <Check size={14} className="text-white" />
                        </span>
                      )}
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{p.emoji}</span>
                        <div>
                          <div className="font-semibold text-ink dark:text-ink-dark">{p.title}</div>
                          <div className="text-sm text-ink-muted mt-0.5">{p.description}</div>
                          <span className="inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-100">
                            {p.habits.length} habits included
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <Button size="lg" className="w-full mt-6" onClick={commitPack} disabled={!pack}>
                Add these habits <ArrowRight size={18} />
              </Button>
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
