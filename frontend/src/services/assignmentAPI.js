// frontend/src/services/assignmentAPI.js
// Service สำหรับติดต่อกับ Assignment API
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const assignmentAPI = {
    // มอบหมายงาน
    assign: async (complaintId, assignData) => {
        const response = await api.post(`/assignments/${complaintId}/assign`, assignData);
        return response.data;
    },

    // ดึงงานที่มอบหมายให้เจ้าหน้าที่
    getAssignedToStaff: async (staffId) => {
        const response = await api.get(`/assignments/staff/${staffId}`);
        return response.data;
    },

    // ยกเลิกการมอบหมาย
    unassign: async (complaintId) => {
        const response = await api.delete(`/assignments/${complaintId}/unassign`);
        return response.data;
    }
};

export default assignmentAPI;