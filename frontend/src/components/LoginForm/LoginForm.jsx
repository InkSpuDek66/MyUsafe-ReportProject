import React, { useState } from "react";
// ไม่ต้อง Import รูปภาพจาก public folder แต่ให้ใช้ Path โดยตรง
const LOGO_URL = "/MyUSafe_LOGO1.png"; 

// ลิงก์รูปภาพพื้นหลัง (ถ้ามี)
// เนื่องจากคุณตั้งค่าเป็น string ว่างไว้ ผมจะใช้ URL ตัวอย่างเพื่อให้เห็นภาพ Split Screen
const backgroundImageURL = 'https://images.unsplash.com/photo-1549632833-289b5c20202d?q=80&w=1974&auto=format&fit=crop';


const LoginForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  // คุณสามารถเพิ่ม State สำหรับ Error และ Loading ได้ตรงนี้
  // const [error, setError] = useState(''); 
  // const [isLoading, setIsLoading] = useState(false);

  // ฟังก์ชันจัดการการเปลี่ยนแปลงของ Input (สำหรับเก็บข้อมูลใน State)
  const handleChange = (e) => {
    setFormData({
        ...formData,
        [e.target.name]: e.target.value
    });
  };

  // ฟังก์ชันจัดการการ Submit Form (สำหรับเชื่อมต่อ API)
  const handleSubmit = (e) => {
      e.preventDefault();
      console.log("Submit data:", formData);
      // ใส่โค้ดเชื่อมต่อ Axios/Fetch API ที่นี่
  };

  // ฟังก์ชันสำหรับปุ่ม Sign Up (ยังไม่มีการเชื่อมต่อจริง)
  const handleSignUp = () => {
      console.log("Navigate to Sign Up page");
      // โค้ดสำหรับเปลี่ยนหน้าไปหน้าลงทะเบียน
  };


  return (
    // --------------------------------------------------------------------------------------------------
    // คอนเทนเนอร์หลัก: ใช้ Flexbox และกำหนดให้เต็มหน้าจอ (min-h-screen)
    // --------------------------------------------------------------------------------------------------
    <div className="flex min-h-screen">
      {/* ----------------------------------------------------------------------------------------------
                คอลัมน์ซ้าย: ฟอร์ม Login (50% ของความกว้าง)
                ใช้ Flexbox เพื่อจัดองค์ประกอบให้อยู่ตรงกลาง (center) ทั้งแนวตั้งและแนวนอน
                ----------------------------------------------------------------------------------------------- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16">
        {/* คอนเทนเนอร์ฟอร์ม: จำกัดความกว้างไม่ให้กว้างเกินไป */}
        <div className="max-w-md w-full">
          {/* โลโก้: ใช้ Path ตรงจาก public folder */}
          <div className="mb-6">
            <img
              src={LOGO_URL} // *** แก้ไขตรงนี้แล้ว ***
              alt="MyUsafe Logo"
              // ปรับขนาดโลโก้ให้ใหญ่ขึ้นเล็กน้อยเพื่อให้ดูชัดเจน
              className="h-20 w-auto" 
            />
          </div>

          
          <p className="text-sm text-gray-600 mb-8">
            ระบบสำหรับเจ้าหน้าปฎิบัติงาน{" "}
            
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input: Email Address */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {/* Input: Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            {/* ปุ่ม Login & Sign Up (ใช้ Flexbox จัดคู่กัน) */}
            <div className="flex space-x-3">
              {/* ปุ่มหลัก: Login */}
              <button
                type="submit"
                className="w-1/2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Login 
              </button>
              {/* ปุ่มรอง: Sign Up */}
              <button
                type="button" // ใช้ type="button" เพื่อไม่ให้ส่งฟอร์มโดยไม่ตั้งใจ
                onClick={handleSignUp}
                className="w-1/2 flex justify-center py-2 px-4 border border-indigo-600 rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-50"
              >
                Sign Up
              </button>
            </div>
          </form>

          {/* หรือต่อด้วย (Or continue with) */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            {/* ปุ่ม Social Login */}
            <div className="mt-6 flex space-x-3">
              <button className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png"
                  alt="Google"
                  className="w-5 h-5 mr-2"
                />
                Google
              </button>
              <button className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg"
                  alt="GitHub"
                  className="w-5 h-5 mr-2"
                />
                GitHub
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------------------------------------
                คอลัมน์ขวา: รูปภาพพื้นหลัง (50% ของความกว้าง)
                ----------------------------------------------------------------------------------------------- */}
      <div
        className="hidden lg:block w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImageURL})` }}
      >
        {/* Div นี้มีไว้สำหรับแสดงรูปภาพพื้นหลังเท่านั้น */}
      </div>
    </div>
  );
};

export default LoginForm;
