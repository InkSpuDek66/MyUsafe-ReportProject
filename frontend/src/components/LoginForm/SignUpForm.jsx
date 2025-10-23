import React, { useState } from "react";
// 🚨 ต้อง Import useNavigate เพื่อใช้ในการเปลี่ยนหน้า
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:5000"; 
const LOGO_URL = "/MyUSafe_LOGO1.png";

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

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
        alert("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
        navigate("/login"); // นำไปหน้า Login หลังสมัครสำเร็จ
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
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700">
              รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              ยืนยันรหัสผ่าน
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-1/2 py-2 rounded-md font-semibold text-white transition 
              ${loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
            >
              {loading ? "กำลังสมัคร..." : "Sign Up"}
            </button>
            <button
              type="button"
              onClick={handleBackToLogin}
              className="w-1/2 py-2 rounded-md border border-green-600 text-green-600 font-semibold hover:bg-green-50 transition"
            >
              Back to Login
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