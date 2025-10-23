import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 

// กำหนด base URL ของ Backend
const BASE_URL = "http://localhost:5000";
const LOGO_URL = "/MyUSafe_LOGO1.png";

const LoginForm = () => {
  const navigate = useNavigate(); 
  
  const [formData, setFormData] = useState({ email: "", password: "" });
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
    setLoading(true);

    try {
      // ✅ เปลี่ยนเป็น PORT 5000
      const response = await fetch(`${BASE_URL}/auth/login`, { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // ...
        // **การจัดการ Authentication State**
        if (data.token) {
          localStorage.setItem("token", data.token);
          // เก็บ user role
          localStorage.setItem("userRole", data.data.user.role); 
        }
        
        navigate("/");
      } else {
        // ดึงข้อความ error จาก Backend
        setError(data.message || "การเข้าสู่ระบบล้มเหลว");
        console.error("❌ Login failed:", data);
      }
    } catch (err) {
      console.error("❌ Network or Fetch Error:", err);
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    navigate("/signup");
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
            เข้าสู่ระบบ
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
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
              รหัสผ่าน
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

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 text-green-600 border-gray-300 rounded"
              />
              Remember me
            </label>
            <a href="#" className="text-green-600 hover:text-green-500">
              Forgot password?
            </a>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-1/2 py-2 rounded-md font-semibold text-white transition 
              ${loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "Login"}
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              className="w-1/2 py-2 rounded-md border border-green-600 text-green-600 font-semibold hover:bg-green-50 transition"
            >
              Sign Up
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ยังไม่มีบัญชี?{" "}
          <button
            onClick={handleSignUp}
            className="font-medium text-green-600 hover:text-green-500 focus:outline-none"
          >
            สร้างบัญชีใหม่
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;