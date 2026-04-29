/**
 * 전역 상수 정의
 */

// 페이지 타입 (PageType)
export const PAGES = {
  MAIN: "main",
  DASHBOARD: "dashboard",
  SCHEDULE_VIEW: "schedule-view",
  SCHEDULE_DETAIL: "schedule-detail",
  MEMO_WRITE: "memo-write",
  MEMO_SHARE: "memo-share",
  MEMO_DETAIL: "memo-detail",
  TEAM_CREATE: "team-create",
  TEAM_INVITE: "team-invite",
  NOTIFICATION_CREATE: "notification-create",
  NOTIFICATION_RULES: "notification-rules",
  NOTIFICATION_LIST: "notification-list",
  USER_SIGNUP: "user-signup",
  USER_DETAIL: "user-detail",
  USER_UPDATE: "user-update",
} as const;

export type PageType = typeof PAGES[keyof typeof PAGES];

// 온보딩 단계 (OnboardingStep)
export const ONBOARDING_STEPS = {
  IDLE: 'IDLE',
  TEAM_CREATED: 'TEAM_CREATED',
  SCHEDULE_COMPLETED: 'SCHEDULE_COMPLETED',
  COMPLETED: 'COMPLETED',
} as const;

export type OnboardingStepType = typeof ONBOARDING_STEPS[keyof typeof ONBOARDING_STEPS];

// 로컬 스토리지 키
export const STORAGE_KEYS = {
  TOKEN: 'token',
  ONBOARDING_TEAM: 'onboarding_team',
  ONBOARDING_STEP: 'onboarding_step',
  ONBOARDING_GUIDE: 'onboarding_guide',
  ONBOARDING_FINAL_MESSAGE: 'onboarding_final_message_shown',
} as const;
