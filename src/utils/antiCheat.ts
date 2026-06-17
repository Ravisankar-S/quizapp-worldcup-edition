const QUIZ_ACTIVE_FLAG = "quiz_active";

// Call this once, immediately when the quiz actually starts (after Instructions Modal dismissed)
export function markQuizActive(): void {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(QUIZ_ACTIVE_FLAG, "true");
  }
}

// Call this once, immediately on quiz completion (Submit or timeout) — BEFORE navigating to /result
export function markQuizComplete(): void {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(QUIZ_ACTIVE_FLAG);
  }
}

// Call this on mount of quiz.astro / QuizShell, BEFORE the Instructions Modal is shown
export function wasQuizActiveBeforeReload(): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  return sessionStorage.getItem(QUIZ_ACTIVE_FLAG) === "true";
}
