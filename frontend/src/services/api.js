// frontend/src/services/api.js
// Utility สำหรับการตั้งค่า Axios instance พร้อมกับการแนบ Token
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000', // กำหนด base URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: ส่ง Token ไปกับทุก Request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // ✅ แนบ JWT Token ไปในรูปแบบ Bearer
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor: จัดการ Response Error
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // จัดการ error ที่เกิดจาก unauthorized
        if (error.response && error.response.status === 401) {
            // Token หมดอายุหรือไม่ถูกต้อง
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('user_id');

            // Redirect ไปหน้า login (ถ้าไม่อยู่ที่หน้า login อยู่แล้ว)
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;