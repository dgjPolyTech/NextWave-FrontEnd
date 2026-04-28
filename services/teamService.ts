import { api } from './api';

export interface TeamCreate {
    name: string;
    description?: string | null;
}

export interface TeamUpdate {
    name?: string | null;
    description?: string | null;
}

export interface TeamResponse {
    id: number;
    name: string;
    description?: string | null;
    image_path?: string | null;
    created_at: string;
}

export interface TeamMemberCreate {
    email: string;
    role?: string;
}

export interface TeamMemberResponse {
    id: number;
    user_id: number;
    team_name: string;
    user_name: string;
    role: string;
}

export const teamService = {
    getMyTeams: async (): Promise<TeamResponse[]> => {
        const response = await api.get<TeamResponse[]>('/api/v1/teams/');
        return response.data;
    },
    
    createTeam: async (data: TeamCreate): Promise<TeamResponse> => {
        const response = await api.post<TeamResponse>('/api/v1/teams/', data);
        return response.data;
    },
    
    getTeam: async (teamId: number): Promise<TeamResponse> => {
        const response = await api.get<TeamResponse>(`/api/v1/teams/${teamId}`);
        return response.data;
    },
    
    updateTeam: async (teamId: number, data: TeamUpdate): Promise<TeamResponse> => {
        const response = await api.put<TeamResponse>(`/api/v1/teams/${teamId}`, data);
        return response.data;
    },
    
    deleteTeam: async (teamId: number): Promise<void> => {
        await api.delete(`/api/v1/teams/${teamId}`);
    },
    
    uploadImage: async (teamId: number, file: File): Promise<TeamResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.patch<TeamResponse>(`/api/v1/teams/${teamId}/image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    
    getMembers: async (teamId: number): Promise<TeamMemberResponse[]> => {
        const response = await api.get<TeamMemberResponse[]>(`/api/v1/teams/${teamId}/members`);
        return response.data;
    },
    
    inviteMember: async (teamId: number, data: TeamMemberCreate): Promise<void> => {
        await api.post(`/api/v1/teams/${teamId}/members`, data);
    },
    
    removeMember: async (teamId: number, userId: number): Promise<void> => {
        await api.delete(`/api/v1/teams/${teamId}/members/${userId}`);
    }
};
