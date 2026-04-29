import { api } from './api';
import { STORAGE_KEYS, ONBOARDING_STEPS, OnboardingStepType } from '@/lib/constants';

export interface OnboardingSchedule {
    title: string;
    description: string;
    start_time: string;
    end_time: string;
}

export interface OnboardingMemo {
    title: string;
    content: string;
    schedule_id?: number;
}

export interface OnboardingGuideContent {
    primary_feature: 'team_manage' | 'schedule' | 'memo';
    example_schedule: OnboardingSchedule;
    example_memo: OnboardingMemo;
}

export interface OnboardingResponse {
    user_name: string;
    guide: OnboardingGuideContent;
}

export interface ContextualExampleResponse {
    type: 'memo' | 'schedule' | 'all';
    rationale: string;
    example_schedule: {
        title: string;
        description: string;
        start_time: string;
        end_time: string;
        assignee_ids: number[];
    } | null;
    example_memo: {
        title: string;
        content: string;
        mention_ids: number[];
        schedule_id: number | null;
    } | null;
}

const ONBOARDING_DONE_PREFIX = 'onboarding_completed_';

export type OnboardingStep = OnboardingStepType;

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

    /** 특정 기능 가이드 완료 여부 확인 */
    isFeatureCompleted: (userId: number, feature: string): boolean => {
        if (typeof window === 'undefined') return false;
        return !!localStorage.getItem(`onboarding_seen_${feature}_${userId}`);
    },

    /** 특정 기능 가이드 완료 표시 */
    markFeatureCompleted: (userId: number, feature: string) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(`onboarding_seen_${feature}_${userId}`, 'true');
    },

    /** 컨텍스트 기반 가이드 데이터 생성 */
    generateContextualGuide: async (teamId: number, part: 'memo' | 'schedule' | null): Promise<ContextualExampleResponse> => {
        const response = await api.post<ContextualExampleResponse>('/api/v1/ai/generate/contextual', {
            team_id: teamId,
            part: part
        });
        return response.data;
    },

    /** 온보딩 완료 표시 저장 */
    markCompleted: (userId: number): void => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(`${ONBOARDING_DONE_PREFIX}${userId}`, '1');
    },

    /** 온보딩 중 생성된 팀 정보 저장 */
    saveOnboardingTeam: (teamId: number, teamName: string): void => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEYS.ONBOARDING_TEAM, JSON.stringify({ teamId, teamName }));
    },

    /** 온보딩 팀 정보 가져오기 */
    getOnboardingTeam: (): { teamId: number; teamName: string } | null => {
        if (typeof window === 'undefined') return null;
        const raw = localStorage.getItem(STORAGE_KEYS.ONBOARDING_TEAM);
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
        localStorage.removeItem(STORAGE_KEYS.ONBOARDING_TEAM);
    },

    /** 현재 온보딩 단계 가져오기 */
    getStep: (): OnboardingStep => {
        if (typeof window === 'undefined') return ONBOARDING_STEPS.IDLE;
        return (localStorage.getItem(STORAGE_KEYS.ONBOARDING_STEP) as OnboardingStep) || ONBOARDING_STEPS.IDLE;
    },

    /** 온보딩 단계 설정 */
    setStep: (step: OnboardingStep): void => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEYS.ONBOARDING_STEP, step);
    },

    /** 가이드 데이터 저장 */
    saveGuide: (guide: OnboardingResponse): void => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEYS.ONBOARDING_GUIDE, JSON.stringify(guide));
    },

    /** 저장된 가이드 데이터 가져오기 */
    getGuideData: (): OnboardingResponse | null => {
        if (typeof window === 'undefined') return null;
        const raw = localStorage.getItem(STORAGE_KEYS.ONBOARDING_GUIDE);
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
        return !!localStorage.getItem(STORAGE_KEYS.ONBOARDING_FINAL_MESSAGE);
    },

    /** 최종 완료 메시지 표시 완료 저장 */
    markFinalMessageShown: (): void => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEYS.ONBOARDING_FINAL_MESSAGE, '1');
    },
};
