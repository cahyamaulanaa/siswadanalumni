import api from './api';

export const alumniService = {
    getAll: async (params = {}) => {
        const response = await api.get('/alumni', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/alumni/${id}`);
        return response.data;
    },

    create: async (alumniData) => {
        const response = await api.post('/alumni', alumniData);
        return response.data;
    },

    update: async (id, alumniData) => {
        const response = await api.put(`/alumni/${id}`, alumniData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/alumni/${id}`);
        return response.data;
    },

    getStatistics: async (params = {}) => {
        const response = await api.get('/alumni-statistics', { params });
        return response.data;
    },
};
