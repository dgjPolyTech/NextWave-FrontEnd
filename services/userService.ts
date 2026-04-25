import { api } from './api';

export interface UserCreate {
    email: string;
    username: string;
    password: string;
    image_path?: string | null;
}

export interface UserResponse {
    id: number;
    email: string;
    username: string;
    image_path?: string | null;
    created_at: string;
}

export interface UserUpdate {
    username?: string | null;
    password?: string | null;
}

export const userService = {
    signup: async (data: UserCreate): Promise<UserResponse> => {
        const response = await api.post<UserResponse>('/api/v1/users/signup', data);
        return response.data;
    },
    
    getMe: async (): Promise<UserResponse> => {
        const response = await api.get<UserResponse>('/api/v1/users/me');
        return response.data;
    },
    
    updateMe: async (data: UserUpdate): Promise<UserResponse> => {
        const response = await api.put<UserResponse>('/api/v1/users/me', data);
        return response.data;
    },
    
    uploadImage: async (file: File): Promise<UserResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.patch<UserResponse>('/api/v1/users/me/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
};
