// frontend/src/services/locationAPI.js
// API service สำหรับจัดการ Location (อาคาร, ชั้น, ห้อง)
import api from './api';

export const locationAPI = {
    // ดึงรายการอาคารทั้งหมด
    getBuildings: async () => {
        try {
            const response = await api.get('/api/locations/buildings');
            return response.data;
        } catch (error) {
            console.error('Get Buildings Error:', error);
            throw error;
        }
    },

    // ดึงรายการชั้นของอาคาร
    getFloorsByBuilding: async (building) => {
        try {
            const response = await api.get(`/api/locations/floors/${building}`);
            return response.data;
        } catch (error) {
            console.error('Get Floors Error:', error);
            throw error;
        }
    },

    // ดึงรายการห้องของอาคารและชั้น
    getRoomsByBuildingFloor: async (building, floor) => {
        try {
            const response = await api.get(`/api/locations/rooms/${building}/${floor}`);
            return response.data;
        } catch (error) {
            console.error('Get Rooms Error:', error);
            throw error;
        }
    }
};