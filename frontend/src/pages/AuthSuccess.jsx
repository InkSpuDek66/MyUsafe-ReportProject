// frontend/src/pages/AuthSuccess.jsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AuthSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const role = searchParams.get('role'); // ✅ รับ role มาด้วย

    console.log('🔐 OAuth Callback Received:');
    console.log('- Token:', token);
    console.log('- UserId:', userId);
    console.log('- Email:', email);
    console.log('- Role:', role);

    if (token && userId) {
      // ✅ ลบข้อมูลเก่าก่อน (ถ้ามี)
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('user_id');
      localStorage.removeItem('email');
      localStorage.removeItem('role');

      // ✅ บันทึกข้อมูลใหม่
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('user_id', userId); // เก็บทั้ง 2 format
      
      if (email) {
        localStorage.setItem('email', email);
      }
      
      if (role) {
        localStorage.setItem('role', role); // ✅ บันทึก role
        console.log('✅ Role saved to localStorage:', role);
      }

      // ✅ ตรวจสอบว่าบันทึกสำเร็จหรือไม่
      console.log('📦 localStorage after save:');
      console.log('- token:', localStorage.getItem('token'));
      console.log('- userId:', localStorage.getItem('userId'));
      console.log('- role:', localStorage.getItem('role'));

      // ✅ Redirect ไปหน้าแรก
      setTimeout(() => {
        navigate('/', { replace: true });
        window.location.reload(); // Force reload เพื่อให้ Navbar อ่าน role ใหม่
      }, 500);
    } else {
      console.error('❌ Missing token or userId');
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#55C388] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg font-medium text-gray-700">กำลังเข้าสู่ระบบ...</p>
        <p className="text-sm text-gray-500 mt-2">กรุณารอสักครู่</p>
      </div>
    </div>
  );
}