export const EVENT_NAME = import.meta.env.PUBLIC_EVENT_NAME || "Students India World Cup Quiz";
export const EVENT_DATE = import.meta.env.PUBLIC_EVENT_DATE || "Coming Soon";
export const ORGANIZER_NAME = import.meta.env.PUBLIC_ORGANIZER_NAME || "Students India";

export const QUESTION_TIMER_SECONDS = 20; // 20 seconds per question
export const TOTAL_QUESTIONS_PER_QUIZ = 5; // 5 random questions per attempt

export const SHARE_MESSAGE_TEMPLATE = (eventName: string) =>
  `I just completed ${eventName}! 🎉`;
