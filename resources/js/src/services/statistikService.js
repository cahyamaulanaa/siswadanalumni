import api from './api';

export const statistikService = {
    getSummary: async (params = {}) => {
        const response = await api.get('/statistik/summary', { params });
        return response.data;
    },

    getKelulusan: async (params = {}) => {
        const response = await api.get('/statistik/kelulusan', { params });
        return response.data;
    },

    getPtn: async (params = {}) => {
        const response = await api.get('/statistik/ptn', { params });
        return response.data;
    },

    getJalurMasuk: async (params = {}) => {
        const response = await api.get('/statistik/jalur-masuk', { params });
        return response.data;
    },

    getPrograms: async (params = {}) => {
        const response = await api.get('/statistik/programs', { params });
        return response.data;
    },

    getSekolah: async (params = {}) => {
        const response = await api.get('/statistik/sekolah', { params });
        return response.data;
    },

    getTrenPendaftaran: async (params = {}) => {
        const response = await api.get('/statistik/tren-pendaftaran', { params });
        return response.data;
    },

    getJurusan: async (params = {}) => {
        const response = await api.get('/statistik/jurusan', { params });
        return response.data;
    },

    getWilayah: async (params = {}) => {
        const response = await api.get('/statistik/wilayah', { params });
        return response.data;
    },

    getKelulusanPersentase: async (params = {}) => {
        const response = await api.get('/statistik/kelulusan-persen', { params });
        return response.data;
    },
};
