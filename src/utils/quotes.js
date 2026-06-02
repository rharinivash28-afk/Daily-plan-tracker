// Motivational quotes shown on day-complete celebration.
export const QUOTES = [
  "Small steps every day add up to big change.",
  "You don't have to be extreme, just consistent.",
  "Success is the sum of small efforts repeated daily.",
  "Discipline is choosing what you want most over what you want now.",
  "The secret of getting ahead is getting started.",
  "Habits are the compound interest of self-improvement.",
  "Be stubborn about your goals, flexible about your methods.",
  "A year from now you'll wish you had started today.",
  "Motivation gets you going, habit keeps you growing.",
  "Every day is a fresh chance to become who you want to be.",
];

export function randomQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

// Random reflection prompt for journal.
export const PROMPTS = [
  "What went well today?",
  "What habit felt hardest today?",
  "What are you grateful for?",
];

export function randomPrompt() {
  return PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
}
