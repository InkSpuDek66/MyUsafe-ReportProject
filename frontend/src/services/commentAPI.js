// frontend/src/services/commentAPI.js
// Service สำหรับติดต่อกับ Comment API
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

export const commentAPI = {
    // ดึงความคิดเห็นทั้งหมดของเรื่องร้องเรียน
    getByComplaint: async (complaintId) => {
        const response = await api.get(`/comments/complaint/${complaintId}`);
        return response.data;
    },

    // เพิ่มความคิดเห็นใหม่
    add: async (commentData) => {
        const response = await api.post('/comments', commentData);
        return response.data;
    },

    // แก้ไขความคิดเห็น
    update: async (commentId, data) => {
        const response = await api.put(`/comments/${commentId}`, data);
        return response.data;
    },

    // ลบความคิดเห็น
    delete: async (commentId, userId) => {
        const response = await api.delete(`/comments/${commentId}`, {
            data: { user_id: userId }
        });
        return response.data;
    }
};

export default commentAPI;