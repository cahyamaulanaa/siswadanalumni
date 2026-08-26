import api from './api';

export const programService = {
    getAll: async (params = {}) => {
        const res = await api.get('/program', { params });
        return res.data;
    },
    create: async (payload) => {
        const res = await api.post('/program', payload);
        return res.data;
    },
    update: async (id, payload) => {
        const res = await api.put(`/program/${id}`, payload);
        return res.data;
    },
    delete: async (id) => {
        const res = await api.delete(`/program/${id}`);
        return res.data;
    },
};
