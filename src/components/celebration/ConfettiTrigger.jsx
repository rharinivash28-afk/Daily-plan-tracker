import confetti from "canvas-confetti";

export function fireConfetti() {
  const colors = ["#534AB7", "#7F77DD", "#CECBF6", "#FFFFFF"];
  confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors });
  setTimeout(() => confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 }, colors }), 150);
  setTimeout(() => confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 }, colors }), 150);
}
