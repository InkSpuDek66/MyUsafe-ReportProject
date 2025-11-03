// frontend/src/services/categoryAPI.js
// API service สำหรับจัดการ Category (หมวดหมู่เรื่องร้องเรียน)
import api from './api';

export const categoryAPI = {
    // ดึงรายการหมวดหมู่ทั้งหมด
    getCategories: async () => {
        try {
            const response = await api.get('/api/categories');
            return response.data;
        } catch (error) {
            console.error('Get Categories Error:', error);
            throw error;
        }
    }
};