import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Mail, Lock } from "lucide-react";
import Button from "../ui/Button.jsx";

export default function AuthScreen({ onSignIn, onSignUp }) {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setInfo("");
    if (!email.trim() || password.length < 6) {
      setError("Enter an email and a password of at least 6 characters.");
      return;
    }
    setBusy(true);
    const fn = mode === "signup" ? onSignUp : onSignIn;
    const err = await fn(email.trim(), password);
    setBusy(false);
    if (err) { setError(err); return; }
    if (mode === "signup") setInfo("Account created! If email confirmation is on, check your inbox, then sign in.");
  };

  return (
    <main className="min-h-screen grid place-items-center px-5 bg-bg-light dark:bg-bg-dark">
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="w-full max-w-sm text-center"
      >
        <div className="w-20 h-20 mx-auto rounded-full grid place-items-center mb-6" style={{ background: "var(--accent-soft)" }}>
          <Sparkles className="text-accent" size={36} />
        </div>
        <h1 className="text-2xl font-bold text-ink dark:text-ink-dark">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-ink-muted">
          {mode === "signup" ? "Sign up so your habits sync across all your devices." : "Sign in to pick up where you left off."}
        </p>

        <form onSubmit={submit} className="mt-7 text-left space-y-3">
          <div className="flex items-center gap-2 px-3 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-card-light dark:bg-card-dark focus-within:ring-2 ring-accent">
            <Mail size={16} className="text-ink-muted" />
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" autoComplete="email"
              className="flex-1 py-3 bg-transparent text-ink dark:text-ink-dark focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 px-3 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-card-light dark:bg-card-dark focus-within:ring-2 ring-accent">
            <Lock size={16} className="text-ink-muted" />
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 chars)" autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="flex-1 py-3 bg-transparent text-ink dark:text-ink-dark focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-[#D85A30]">{error}</p>}
          {info && <p className="text-sm text-[#1D9E75]">{info}</p>}

          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? "Please wait…" : (mode === "signup" ? "Create account" : "Sign in")} <ArrowRight size={18} />
          </Button>
        </form>

        <button
          onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setError(""); setInfo(""); }}
          className="mt-4 text-sm text-ink-muted hover:text-accent"
        >
          {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
        </button>
      </motion.div>
    </main>
  );
}
