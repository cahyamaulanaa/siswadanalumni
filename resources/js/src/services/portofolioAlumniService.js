import api from './api';

export const portofolioAlumniService = {
    getAll: async (params = {}) => {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, value]) => value !== '' && value !== null)
        );
        const response = await api.get('/portofolio-alumni', { params: cleanParams });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/portofolio-alumni/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/portofolio-alumni', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    update: async (id, data) => {
        if (data instanceof FormData) {
            data.append('_method', 'PUT');
            const response = await api.post(`/portofolio-alumni/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        }

        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        formData.append('_method', 'PUT');

        const response = await api.post(`/portofolio-alumni/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/portofolio-alumni/${id}`);
        return response.data;
    },
};
