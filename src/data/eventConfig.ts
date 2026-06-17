export const EVENT_NAME = import.meta.env.PUBLIC_EVENT_NAME || "Students India World Cup Quiz";
export const EVENT_DATE = import.meta.env.PUBLIC_EVENT_DATE || "Coming Soon";
export const ORGANIZER_NAME = import.meta.env.PUBLIC_ORGANIZER_NAME || "Students India";

export const QUIZ_DURATION_SECONDS = 600; // 10 minutes

export const SHARE_MESSAGE_TEMPLATE = (eventName: string) =>
  `I just completed ${eventName}! 🎉`;
