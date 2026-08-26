import api from './api';

export const userService = {
    getAll: async (params = {}) => {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, value]) => value !== '' && value !== null)
        );
        const response = await api.get('/users', { params: cleanParams });
        return response.data;
    },

    create: async (data) => {
        const payload = {
            ...data,
        };
        const response = await api.post('/users', payload);
        return response.data;
    },
    update: async (id, data) => {
        const payload = { ...data };
        const response = await api.put(`/users/${id}`, payload);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    },
};
