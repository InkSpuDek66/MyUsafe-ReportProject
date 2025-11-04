// ============================================
// FILE 1: src/components/LoginForm.jsx
// (แก้ไฟล์เดิม - COPY ทั้งหมด)
// ============================================

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const BASE_URL = "http://localhost:5000";
const LOGO_URL = "../../../public/MyUSafe_LOGO1.png";

const LoginForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", data.data.user.role);
          localStorage.setItem("userId", data.data.user._id);

          // 🛠️ Debug: ตรวจสอบว่าบันทึกถูกต้อง
          console.log("✅ Saved to localStorage:");
          console.log("- token:", data.token);
          console.log("- role:", data.data.user.role);
        }

        navigate("/");
      } else {
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

  // ✅ เพิ่มฟังก์ชัน OAuth Login
  const handleGoogleLogin = () => {
    console.log("🚀 Redirecting to Google OAuth...");
    window.location.href = `${BASE_URL}/auth/google`;
  };

  const handleGithubLogin = () => {
    console.log("🚀 Redirecting to GitHub OAuth...");
    window.location.href = `${BASE_URL}/auth/github`;
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
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
              className="mt-1 w-full px-3 py-2 text-gray-600 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              รหัสผ่าน
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pr-10 pl-3 py-2 text-gray-600 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-green-600 focus:outline-none"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <EyeIcon className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          {/* <div className="flex items-center justify-between text-sm">
            <a href="#" className="text-green-600 hover:text-green-500">
              ลืมรหัสผ่าน
            </a>
          </div> */}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-1/2 py-2 rounded-md font-semibold text-white transition 
              ${loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              className="w-1/2 py-2 rounded-md border border-green-600 text-green-600 font-semibold hover:bg-green-50 transition"
            >
              สมัครสมาชิก
            </button>
          </div>
        </form>

        {/* ✅ เพิ่มส่วน OAuth */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">หรือเข้าสู่ระบบด้วย</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="py-2 rounded-md border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
            Google
          </button>
          <button
            type="button"
            onClick={handleGithubLogin}
            className="py-2 rounded-md border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </button>
        </div>

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
