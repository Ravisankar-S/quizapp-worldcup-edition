export interface ParticipantData {
  name: string;
  phone: string;
  district: string;
  class: string;
  team?: string;
}

const PARTICIPANT_KEY = "quiz_participant";
const RESULT_KEY = "quiz_result";

export interface AnsweredQuestion {
  questionId: number;
  selectedIndex: number | null; // null if skipped
}

export interface QuizResultData {
  score: number;                     // Total points earned
  maxScore: number;                  // Total possible points
  skippedCount: number;
  answers: AnsweredQuestion[];       // One entry per question, in shuffled order
  shuffledQuestionIds: number[];     // The order in which question IDs were presented
}

export function saveParticipant(data: ParticipantData): void {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(PARTICIPANT_KEY, JSON.stringify(data));
  }
}

export function getParticipant(): ParticipantData | null {
  if (typeof sessionStorage === 'undefined') return null;
  const raw = sessionStorage.getItem(PARTICIPANT_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function saveResult(data: QuizResultData): void {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(RESULT_KEY, JSON.stringify(data));
  }
}

export function getResult(): QuizResultData | null {
  if (typeof sessionStorage === 'undefined') return null;
  const raw = sessionStorage.getItem(RESULT_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearSession(): void {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(PARTICIPANT_KEY);
    sessionStorage.removeItem(RESULT_KEY);
  }
}
