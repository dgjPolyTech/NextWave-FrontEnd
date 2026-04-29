import { api } from './api';

export interface ScheduleData {
    title: string;
    description?: string | null;
    start_time: string;
    end_time?: string | null;
    status?: string;
    team_id: number;
    assignees?: number[] | null;
}

export interface ScheduleResponse {
    id: number;
    title: string;
    description: string | null;
    start_time: string;
    end_time: string | null;
    status: string;
    team_id: number;
    created_by: number;
    assignees: ScheduleAssigneeResponse[];
    created_at: string;
    updated_at: string;
}

export interface ScheduleUpdate {
    title?: string | null;
    description?: string | null;
    start_time?: string | null;
    end_time?: string | null;
    status?: string | null;
    assignees?: number[] | null;
}

export interface ScheduleStatusUpdate {
    status: string;
}

export interface ScheduleAssigneeResponse {
    id: number;
    schedule_id: number;
    user_id: number;
    user_name: string;
}

export interface ScheduleAssigneeCreate {
    user_ids: number[];
}

export const scheduleService = {
    createSchedule: async (data: ScheduleData): Promise<ScheduleResponse> => {
        const response = await api.post<ScheduleResponse>('/api/v1/schedules/', data);
        return response.data;
    },
    
    getTeamSchedules: async (teamId: number): Promise<ScheduleResponse[]> => {
        const response = await api.get<ScheduleResponse[]>(`/api/v1/teams/${teamId}/schedules`);
        return response.data;
    },

    getSchedule: async (scheduleId: number): Promise<ScheduleResponse> => {
        const response = await api.get<ScheduleResponse>(`/api/v1/schedules/${scheduleId}`);
        return response.data;
    },
    
    updateSchedule: async (scheduleId: number, data: ScheduleUpdate): Promise<ScheduleResponse> => {
        const response = await api.put<ScheduleResponse>(`/api/v1/schedules/${scheduleId}`, data);
        return response.data;
    },
    
    deleteSchedule: async (scheduleId: number): Promise<void> => {
        await api.delete(`/api/v1/schedules/${scheduleId}`);
    },
    
    updateStatus: async (scheduleId: number, data: ScheduleStatusUpdate): Promise<ScheduleResponse> => {
        const response = await api.patch<ScheduleResponse>(`/api/v1/schedules/${scheduleId}/status`, data);
        return response.data;
    },
    
    getAssignees: async (scheduleId: number): Promise<ScheduleAssigneeResponse[]> => {
        const response = await api.get<ScheduleAssigneeResponse[]>(`/api/v1/schedules/${scheduleId}/assignees`);
        return response.data;
    },
    
    addAssignees: async (scheduleId: number, data: ScheduleAssigneeCreate): Promise<void> => {
        await api.post(`/api/v1/schedules/${scheduleId}/assignees`, data);
    },
    
    removeAssignee: async (scheduleId: number, userId: number): Promise<void> => {
        await api.delete(`/api/v1/schedules/${scheduleId}/assignees/${userId}`);
    }
};