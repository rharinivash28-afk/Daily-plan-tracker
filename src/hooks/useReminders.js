import { useEffect, useRef } from "react";
import { useStore } from "../store/habitStore.jsx";
import { todayKey } from "../utils/dates.js";
import { isHabitScheduledOn, isCompletedOn } from "../utils/streakLogic.js";

// Fires a daily browser notification at the user's reminder time, listing
// how many habits are still pending. Only works while the app/tab is open
// (no service worker), so the Settings UI says as much.
export function useReminders() {
  const { state } = useStore();
  const firedForRef = useRef(null); // dateKey we've already notified for

  const { reminderTime, remindersEnabled } = state.user;

  useEffect(() => {
    if (!remindersEnabled) return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    if (!reminderTime) return;

    const check = () => {
      const now = new Date();
      const [h, m] = reminderTime.split(":").map(Number);
      const tKey = todayKey();
      // within the reminder minute, and not already fired today
      if (now.getHours() === h && now.getMinutes() === m && firedForRef.current !== tKey) {
        firedForRef.current = tKey;
        const today = new Date();
        const pending = state.habits.filter(
          (hb) => !hb.archived && isHabitScheduledOn(hb, today) && !isCompletedOn(hb, tKey)
        );
        if (pending.length > 0) {
          try {
            new Notification("Habitflow ✨", {
              body: pending.length === 1
                ? `1 habit left today: ${pending[0].name}`
                : `${pending.length} habits still pending today. You've got this!`,
              icon: "/favicon.svg",
            });
          } catch (e) {}
        }
      }
    };

    const id = setInterval(check, 30000); // check every 30s
    check();
    return () => clearInterval(id);
  }, [remindersEnabled, reminderTime, state.habits]);
}

// Request permission; resolves to the resulting permission string.
export async function requestNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch (e) {
    return "denied";
  }
}
