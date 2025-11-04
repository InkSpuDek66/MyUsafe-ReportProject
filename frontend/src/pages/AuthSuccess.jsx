import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('📍 AuthSuccess component mounted');
    
    // ✅ อ่าน Token จาก URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userId = params.get('userId');
    const email = params.get('email');

    console.log('🔍 URL Params:');
    console.log('- token:', token);
    console.log('- userId:', userId);
    console.log('- email:', email);

    if (token && userId) {
      console.log('✅ OAuth Success! Saving to localStorage...');

      // ✅ บันทึก Token ใน localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('email', email);
      localStorage.setItem('role', 'reporter'); // Default role for OAuth users

      console.log('✅ Saved to localStorage');
      console.log('Token:', localStorage.getItem('token'));
      console.log('UserID:', localStorage.getItem('userId'));
      console.log('Email:', localStorage.getItem('email'));

      // ✅ ล้างค่า URL
      window.history.replaceState({}, document.title, '/');

      // ✅ รอ 1 วินาที แล้วไปหน้า Home
      setTimeout(() => {
        console.log('🔄 Navigating to home...');
        navigate('/');
      }, 1000);
    } else {
      console.log('❌ No token found. Redirecting to login...');
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg font-medium">กำลังเข้าสู่ระบบ...</p>
        <p className="text-gray-500 text-sm mt-2">กรุณารอสักครู่</p>
      </div>
    </div>
  );
};

export default AuthSuccess;