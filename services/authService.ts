import { api } from './api';

export interface Token {
    access_token: string;
    token_type: string;
}

export const authService = {
    login: async (username: string, password: string):Promise<Token> => {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const response = await api.post<Token>('/api/v1/login/access-token', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        // 자동 저장 로직 포함
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', response.data.access_token);
            window.dispatchEvent(new Event('auth-change'));
        }

        return response.data;
    },
    
    logout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            window.dispatchEvent(new Event('auth-change'));
        }
    },
    
    getToken: () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    }
};
