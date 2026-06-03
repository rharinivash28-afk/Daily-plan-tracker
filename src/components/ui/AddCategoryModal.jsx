import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Modal from "./Modal.jsx";
import Button from "./Button.jsx";
import { CATEGORY_PALETTE } from "../../utils/colors.js";

export default function AddCategoryModal({ open, onClose, onAdd, onToast }) {
  const [name, setName] = useState("");
  const [idx, setIdx] = useState(0);

  useEffect(() => { if (open) { setName(""); setIdx(Math.floor(Math.random() * CATEGORY_PALETTE.length)); } }, [open]);

  const submit = () => {
    if (!name.trim()) { onToast && onToast.error("Name your category first 👆"); return; }
    onAdd(name.trim(), idx);
    onToast && onToast.success("Category added! ✨");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth="380px">
      <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.08]">
        <h2 className="text-lg font-semibold text-ink dark:text-ink-dark">New category</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg text-ink-muted hover:bg-black/5 dark:hover:bg-white/10"><X size={18} /></button>
      </div>
      <div className="p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-ink dark:text-ink-dark">Name</label>
          <input
            autoFocus value={name} onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="e.g. Finance, Family, Sleep"
            className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-bg-light dark:bg-bg-dark text-ink dark:text-ink-dark focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-ink dark:text-ink-dark">Color</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_PALETTE.map((p, i) => (
              <button key={i} type="button" onClick={() => setIdx(i)}
                className={`w-8 h-8 rounded-full transition-transform ${idx === i ? "ring-2 ring-offset-2 ring-offset-card-light dark:ring-offset-card-dark scale-110" : ""}`}
                style={{ background: p.dot, boxShadow: idx === i ? `0 0 0 2px ${p.dot}` : "none" }}
                aria-label={`Color ${i + 1}`}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <span className="w-3 h-3 rounded-full" style={{ background: CATEGORY_PALETTE[idx].dot }} />
          <span className="text-sm text-ink-muted">Preview: <span className="font-medium text-ink dark:text-ink-dark">{name.trim() || "Category"}</span></span>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-black/[0.06] dark:border-white/[0.08]">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={submit}>Add category</Button>
      </div>
    </Modal>
  );
}
