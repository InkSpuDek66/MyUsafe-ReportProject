// frontend/src/services/complaintAPI.js
// Service สำหรับติดต่อกับ API ของเรื่องร้องเรียน
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Unauthorized - redirect to login
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Complaint API functions
export const complaintAPI = {
    // Get all complaints
    getAll: async (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        const response = await api.get(`/complaints?${params}`);
        return response.data;
    },

    // Get single complaint
    getById: async (id) => {
        const response = await api.get(`/complaints/${id}`);
        return response.data;
    },

    // Create new complaint
    create: async (formData) => {
        const response = await api.post('/complaints', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    // Update complaint
    update: async (id, data) => {
        const response = await api.patch(`/complaints/${id}`, data);
        return response.data;
    },

    // Delete complaint
    delete: async (id) => {
        const response = await api.delete(`/complaints/${id}`);
        return response.data;
    },

    // Update status
    updateStatus: async (id, status, comment = '') => {
        const response = await api.patch(`/complaints/${id}/status`, {
            status,
            comment
        });
        return response.data;
    },

    // Assign complaint
    assign: async (id, staffId) => {
        const response = await api.patch(`/complaints/${id}/assign`, {
            assigned_to: staffId
        });
        return response.data;
    },

    // Add comment
    addComment: async (id, comment) => {
        const response = await api.post(`/complaints/${id}/comments`, {
            comment
        });
        return response.data;
    },

    // Get complaint history
    getHistory: async (id) => {
        const response = await api.get(`/complaints/${id}/history`);
        return response.data;
    },

    // Get my complaints
    getMyComplaints: async () => {
        const response = await api.get('/complaints/my-complaints');
        return response.data;
    },

    // Get assigned complaints (for staff)
    getAssigned: async () => {
        const response = await api.get('/complaints/my-assignments');
        return response.data;
    },

    // Search complaints
    search: async (query) => {
        const response = await api.get(`/complaints/search?q=${query}`);
        return response.data;
    }
};

export default complaintAPI;