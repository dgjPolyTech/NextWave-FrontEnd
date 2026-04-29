import { api } from './api';

export interface MemoCreate {
    title: string;
    content?: string | null;
    team_id: number;
    schedule_id?: number | null;
    mentions?: number[] | null;
}

export interface MemoUpdate {
    title?: string | null;
    content?: string | null;
    schedule_id?: number | null;
    mentions?: number[] | null;
}

export interface MemoResponse {
    id: number;
    title: string;
    content: string | null;
    author_id: number;
    author_name: string;
    team_id: number;
    schedule_id: number | null;
    schedule_title: string | null;
    created_at: string;
    updated_at: string;
}

export interface MemoMentionResponse {
    id: number;
    user_id: number;
    user_name: string;
}

export interface CommentResponse {
    id: number;
    memo_id: number;
    author_id: number;
    author_name: string;
    content: string;
    created_at: string;
}

export interface MemoDetailResponse extends MemoResponse {
    mentions: MemoMentionResponse[];
    comments: CommentResponse[];
}

export interface CommentCreate {
    content: string;
}

export const memoService = {
    createMemo: async (data: MemoCreate): Promise<MemoDetailResponse> => {
        const response = await api.post<MemoDetailResponse>('/api/v1/memos/', data);
        return response.data;
    },
    
    getMemo: async (memoId: number): Promise<MemoDetailResponse> => {
        const response = await api.get<MemoDetailResponse>(`/api/v1/memos/${memoId}`);
        return response.data;
    },
    
    updateMemo: async (memoId: number, data: MemoUpdate): Promise<MemoDetailResponse> => {
        const response = await api.put<MemoDetailResponse>(`/api/v1/memos/${memoId}`, data);
        return response.data;
    },
    
    deleteMemo: async (memoId: number): Promise<void> => {
        await api.delete(`/api/v1/memos/${memoId}`);
    },
    
    getTeamMemos: async (teamId: number): Promise<MemoResponse[]> => {
        const response = await api.get<MemoResponse[]>(`/api/v1/teams/${teamId}/memos`);
        return response.data;
    },
    
    getScheduleMemos: async (scheduleId: number): Promise<MemoResponse[]> => {
        const response = await api.get<MemoResponse[]>(`/api/v1/schedules/${scheduleId}/memos`);
        return response.data;
    },
    
    createComment: async (memoId: number, data: CommentCreate): Promise<CommentResponse> => {
        const response = await api.post<CommentResponse>(`/api/v1/memos/${memoId}/comments`, data);
        return response.data;
    },
    
    getComments: async (memoId: number): Promise<CommentResponse[]> => {
        const response = await api.get<CommentResponse[]>(`/api/v1/memos/${memoId}/comments`);
        return response.data;
    },
    
    deleteComment: async (memoId: number, commentId: number): Promise<void> => {
        await api.delete(`/api/v1/memos/${memoId}/comments/${commentId}`);
    }
};
