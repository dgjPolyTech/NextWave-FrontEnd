import { api } from './api';

export type NotificationType = 'TEAM_INVITE' | 'INVITE_ACCEPTED' | 'INVITE_REJECTED' | 'SCHEDULE_ASSIGN' | 'MEMO_MENTION' | 'COMMENT';

export interface AppNotificationResponse {
    id: number;
    title: string;
    content: string;
    type: NotificationType;
    related_id: number | null;
    receiver_id: number;
    sender_id: number | null;
    is_read: boolean;
    created_at: string;
    sender_name: string | null;
}

export const inboxService = {
    getMyNotifications: async (): Promise<AppNotificationResponse[]> => {
        const response = await api.get<AppNotificationResponse[]>('/api/v1/inbox/');
        return response.data;
    },
    
    markAsRead: async (notificationId: number): Promise<AppNotificationResponse> => {
        const response = await api.patch<AppNotificationResponse>(`/api/v1/inbox/${notificationId}/read`);
        return response.data;
    },
    
    acceptTeamInvite: async (notificationId: number): Promise<void> => {
        await api.post(`/api/v1/inbox/${notificationId}/accept`);
    },
    
    rejectTeamInvite: async (notificationId: number): Promise<void> => {
        await api.post(`/api/v1/inbox/${notificationId}/reject`);
    }
};
