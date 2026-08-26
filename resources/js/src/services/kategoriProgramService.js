import api from './api';

export const kategoriProgramService = {
    getAll: async (params = {}) => {
        const res = await api.get('/kategori-program', { params });
        return res.data;
    },
    create: async (payload) => {
        const res = await api.post('/kategori-program', payload);
        return res.data;
    },
    update: async (id, payload) => {
        const res = await api.put(`/kategori-program/${id}`, payload);
        return res.data;
    },
    delete: async (id) => {
        const res = await api.delete(`/kategori-program/${id}`);
        return res.data;
    },
};
