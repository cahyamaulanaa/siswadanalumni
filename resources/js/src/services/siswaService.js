import api from './api';

export const siswaService = {
    getAll: async (params = {}) => {
        // Remove empty parameters to avoid backend filter issues
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, value]) => value !== '' && value !== null)
        );
        const response = await api.get('/siswa', { params: cleanParams });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/siswa/${id}`);
        return response.data;
    },

    create: async (data) => {
        // If data is already FormData, use it directly
        if (data instanceof FormData) {
            const response = await api.post('/siswa', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        }

        // Otherwise, convert object to FormData
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        const response = await api.post('/siswa', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    update: async (id, data) => {
        // If data is already FormData, add _method field and send
        if (data instanceof FormData) {
            // Add _method field for Laravel to recognize this as a PUT request
            data.append('_method', 'PUT');
            const response = await api.post(`/siswa/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        }

        // Otherwise, convert object to FormData
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        // Add _method field for Laravel to recognize this as a PUT request
        formData.append('_method', 'PUT');
        const response = await api.post(`/siswa/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/siswa/${id}`);
        return response.data;
    },

    getCabang: async () => {
        const response = await api.get('/siswa-data/cabang');
        return response.data;
    },


    getFilterData: async (params = {}) => {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, value]) => value !== '' && value !== null)
        );
        const response = await api.get('/siswa-data/filter-data', { params: cleanParams });
        return response.data;
    },

    toAlumni: async (data) => {
        const response = await api.post('/siswa/bulk-to-alumni', data);
        return response.data;
    },

    bulkMove: async (data) => {
        // data: { ids: [...], kelas: number, program_id: [..] (optional) }
        const response = await api.post('/siswa/bulk-move', data);
        return response.data;
    },
};
