// backend/src/utils/api.js
// Utility สำหรับการตั้งค่า Axios instance พร้อมกับการแนบ Token
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // กำหนด base URL
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

export default api;