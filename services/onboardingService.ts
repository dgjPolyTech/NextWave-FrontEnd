import { api } from './api';

export interface OnboardingSchedule {
    title: string;
    description: string;
    start_time: string;
    end_time: string;
}

export interface OnboardingMemo {
    title: string;
    content: string;
}

export interface OnboardingGuideContent {
    example_schedule: OnboardingSchedule;
    example_memo: OnboardingMemo;
}

export interface OnboardingResponse {
    user_name: string;
    guide: OnboardingGuideContent;
}

const ONBOARDING_DONE_PREFIX = 'onboarding_completed_';
const ONBOARDING_TEAM_KEY = 'onboarding_team';
const ONBOARDING_STEP_KEY = 'onboarding_step';
const ONBOARDING_GUIDE_KEY = 'onboarding_guide';
const ONBOARDING_FINAL_MESSAGE_KEY = 'onboarding_final_message_shown';

export type OnboardingStep = 'IDLE' | 'TEAM_CREATED' | 'SCHEDULE_COMPLETED' | 'COMPLETED';

export const onboardingService = {
    getGuide: async (): Promise<OnboardingResponse> => {
        const response = await api.get<OnboardingResponse>('/api/v1/ai/onboarding/guide');
        return response.data;
    },

    /** 온보딩 완료 여부 확인 */
    isCompleted: (userId: number): boolean => {
        if (typeof window === 'undefined') return false;
        return !!localStorage.getItem(`${ONBOARDING_DONE_PREFIX}${userId}`);
    },

    /** 온보딩 완료 표시 저장 */
    markCompleted: (userId: number): void => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(`${ONBOARDING_DONE_PREFIX}${userId}`, '1');
    },

    /** 온보딩 중 생성된 팀 정보 저장 */
    saveOnboardingTeam: (teamId: number, teamName: string): void => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(ONBOARDING_TEAM_KEY, JSON.stringify({ teamId, teamName }));
    },

    /** 온보딩 팀 정보 가져오기 */
    getOnboardingTeam: (): { teamId: number; teamName: string } | null => {
        if (typeof window === 'undefined') return null;
        const raw = localStorage.getItem(ONBOARDING_TEAM_KEY);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    },

    /** 온보딩 팀 정보 삭제 */
    clearOnboardingTeam: (): void => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(ONBOARDING_TEAM_KEY);
    },

    /** 현재 온보딩 단계 가져오기 */
    getStep: (): OnboardingStep => {
        if (typeof window === 'undefined') return 'IDLE';
        return (localStorage.getItem(ONBOARDING_STEP_KEY) as OnboardingStep) || 'IDLE';
    },

    /** 온보딩 단계 설정 */
    setStep: (step: OnboardingStep): void => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(ONBOARDING_STEP_KEY, step);
    },

    /** 가이드 데이터 저장 */
    saveGuide: (guide: OnboardingResponse): void => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(ONBOARDING_GUIDE_KEY, JSON.stringify(guide));
    },

    /** 저장된 가이드 데이터 가져오기 */
    getGuideData: (): OnboardingResponse | null => {
        if (typeof window === 'undefined') return null;
        const raw = localStorage.getItem(ONBOARDING_GUIDE_KEY);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    },

    /** 최종 완료 메시지 표시 여부 */
    isFinalMessageShown: (): boolean => {
        if (typeof window === 'undefined') return false;
        return !!localStorage.getItem(ONBOARDING_FINAL_MESSAGE_KEY);
    },

    /** 최종 완료 메시지 표시 완료 저장 */
    markFinalMessageShown: (): void => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(ONBOARDING_FINAL_MESSAGE_KEY, '1');
    },
};
