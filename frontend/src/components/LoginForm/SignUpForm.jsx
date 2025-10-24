import React, { useState } from "react";
// 🚨 ต้อง Import useNavigate เพื่อใช้ในการเปลี่ยนหน้า
import { useNavigate } from "react-router-dom";
// ⚙️ Import ไอคอนสำหรับเปิด/ปิดรหัสผ่าน
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

const BASE_URL = "http://localhost:5000"; 
const LOGO_URL = "/MyUSafe_LOGO1.png";

// 🚀 ย้าย PasswordInput ออกมาด้านนอก เพื่อป้องกันการ re-render และ focus หาย
// คอมโพเนนต์ย่อยสำหรับ Input รหัสผ่านที่มีปุ่ม Toggle
const PasswordInput = ({ label, name, value, onChange, isShown, toggleFunc }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="relative mt-1">
      <input
        type={isShown ? "text" : "password"}
        name={name}
        required
        value={value}
        onChange={onChange}
        // ⚙️ เพิ่ม padding-right เพื่อไม่ให้ข้อความทับกับไอคอน
        className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
      />
      <button
        type="button" 
        onClick={toggleFunc}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-green-600 focus:outline-none"
      >
        {isShown ? (
          <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
        ) : (
          <EyeIcon className="h-5 w-5" aria-hidden="true" />
        )}
      </button>
    </div>
  </div>
);

const SignUpForm = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // 🆕 State สำหรับการแสดงรหัสผ่านทั้งสองช่อง
  const [showPassword, setShowPassword] = useState(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // 🆕 State สำหรับการแสดงข้อความสมัครสมาชิกสำเร็จ แทนที่ alert()
  const [successMessage, setSuccessMessage] = useState(""); 


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 🆕 ฟังก์ชันสลับการแสดงรหัสผ่าน
  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(prev => !prev);
    } else if (field === 'confirmPassword') {
      setShowConfirmPassword(prev => !prev);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage(""); // Clear success message on new attempt

    if (formData.password !== formData.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    if (formData.password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setLoading(true);

    try {
      // ✅ เปลี่ยนเป็น PORT 5000
      const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // ส่งข้อมูลที่จำเป็นเท่านั้น
        body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✅ Sign Up success:", data);
        // ❌ แทนที่ alert() ด้วยการตั้งค่า Success Message
        setSuccessMessage("สมัครสมาชิกสำเร็จ! กำลังนำทางไปยังหน้าเข้าสู่ระบบ...");
        
        // หน่วงเวลา 1.5 วินาที ก่อนนำทางไปยังหน้า Login เพื่อให้ผู้ใช้เห็นข้อความ
        setTimeout(() => navigate("/login"), 1500); 

      } else {
        // ดึงข้อความ error จาก Backend
        setError(data.message || "มีข้อผิดพลาดในการสมัครสมาชิก");
        console.error("❌ Sign Up failed:", data);
      }
    } catch (err) {
      console.error("❌ Network or Fetch Error:", err);
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-xl">
        <div className="text-center mb-6">
          <img
            src={LOGO_URL}
            alt="MyUSafe Logo"
            className="w-20 mx-auto"
          />
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
            สมัครสมาชิก
          </h2>
        </div>
        
        {/* 🆕 ส่วนแสดงข้อความสำเร็จ แทนที่ alert() */}
        {successMessage && (
          <div className="mb-4 flex items-center p-3 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* --------------------- INPUTS --------------------- */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700">
                ชื่อจริง
              </label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700">
                นามสกุล
              </label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              อีเมล
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              เบอร์โทรศัพท์ (ไม่บังคับ)
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
            />
          </div>

          {/* ⚙️ รหัสผ่านพร้อมปุ่ม Toggle */}
          <PasswordInput
            label="รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
            name="password"
            value={formData.password}
            onChange={handleChange}
            isShown={showPassword}
            toggleFunc={() => togglePasswordVisibility('password')}
          />

          {/* ⚙️ ยืนยันรหัสผ่านพร้อมปุ่ม Toggle */}
          <PasswordInput
            label="ยืนยันรหัสผ่าน"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            isShown={showConfirmPassword}
            toggleFunc={() => togglePasswordVisibility('confirmPassword')}
          />
          {/* --------------------- END INPUTS --------------------- */}


          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || successMessage}
              className={`w-1/2 py-2 rounded-md font-semibold text-white transition 
              ${loading || successMessage ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
            >
              {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
            </button>
            <button
              type="button"
              onClick={handleBackToLogin}
              className="w-1/2 py-2 rounded-md border border-green-600 text-green-600 font-semibold hover:bg-green-50 transition"
            >
              กลับหน้าเข้าสู่ระบบ
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          มีบัญชีอยู่แล้ว?{" "}
          <button
            onClick={handleBackToLogin}
            className="font-medium text-green-600 hover:text-green-500 focus:outline-none"
          >
            เข้าสู่ระบบ
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUpForm;
