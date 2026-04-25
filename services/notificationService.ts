import { api } from './api';

export interface NotificationCreate {
    schedule_id: number;
    remind_at: string;
}

export interface NotificationUpdate {
    remind_at?: string | null;
    is_enabled?: boolean | null;
}

export interface NotificationResponse {
    id: number;
    user_id: number;
    schedule_id: number;
    remind_at: string;
    is_enabled: boolean;
    created_at: string;
}

export const notificationService = {
    createNotification: async (data: NotificationCreate): Promise<NotificationResponse> => {
        const response = await api.post<NotificationResponse>('/api/v1/notifications/', data);
        return response.data;
    },
    
    getMyNotifications: async (): Promise<NotificationResponse[]> => {
        const response = await api.get<NotificationResponse[]>('/api/v1/notifications/me');
        return response.data;
    },
    
    updateNotification: async (notificationId: number, data: NotificationUpdate): Promise<NotificationResponse> => {
        const response = await api.put<NotificationResponse>(`/api/v1/notifications/${notificationId}`, data);
        return response.data;
    },
    
    deleteNotification: async (notificationId: number): Promise<void> => {
        await api.delete(`/api/v1/notifications/${notificationId}`);
    }
};
