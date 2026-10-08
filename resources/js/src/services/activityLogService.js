import api from './api';

export const activityLogService = {
    getAll: async (params = {}) => {
        const response = await api.get('/activity-logs', { params });
        return response.data;
    },

    exportCsv: async (params = {}) => {
        const response = await api.get('/activity-logs/export', {
            params,
            responseType: 'blob',
        });
        return response;
    },
};
