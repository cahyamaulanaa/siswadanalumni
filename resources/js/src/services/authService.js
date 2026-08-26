import api from './api';

export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.success) {
            const token = response.data.data.token;
            const user = response.data.data.user;
            localStorage.setItem('auth_token', token);
            localStorage.setItem('user', JSON.stringify(user));
        }
        return response.data;
    },

    logout: async () => {
        await api.post('/auth/logout');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
    },

    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    getToken: () => localStorage.getItem('auth_token'),

    isAuthenticated: () => !!localStorage.getItem('auth_token'),
};
