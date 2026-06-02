import React, { useState, useEffect } from "react";
import { X, User } from "lucide-react";

export default function SettingsModal({ open, name, onClose, onSave }) {
  const [draft, setDraft] = useState(name);

  useEffect(() => { if (open) setDraft(name); }, [open, name]);

  if (!open) return null;

  const save = () => {
    onSave(draft.trim() || "friend");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4 bg-ink/40 backdrop-blur-sm anim-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-xl card-border anim-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink/10">
          <h2 className="font-display text-xl text-ink">Settings</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-ink/5 text-ink/50">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink/50">
            Your name
          </label>
          <div className="flex items-center gap-2 px-3 rounded-md card-border bg-paper focus-within:ring-2 focus-within:ring-purple-mid/40">
            <User size={16} className="text-ink/40" />
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Enter your name"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && save()}
              className="flex-1 py-2.5 bg-transparent text-ink focus:outline-none"
            />
          </div>
          <p className="text-xs text-ink/45">Used in your greeting, e.g. “Good morning, {draft.trim() || "friend"}”.</p>
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-ink/10">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-md card-border text-ink/70 font-medium hover:bg-ink/5">
            Cancel
          </button>
          <button
            onClick={save}
            className="flex-1 py-2.5 rounded-md font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#7F77DD,#534AB7)" }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
