import React, { useState } from "react";
const LOGO_URL = "/MyUSafe_LOGO1.png";
const SIDE_IMAGE_URL = "/side_image.png"; // รูปข้างฟอร์ม — ใส่ใน public เช่น public/side_image.png
const backgroundImageURL = "https://images.unsplash.com/photo-1549632833-289b5c20202d?q=80&w=1974&auto=format&fit=crop";

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submit data:", formData);
  };

  const handleSignUp = () => {
    console.log("Navigate to Sign Up page");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16">
        {/* 🔲 กรอบนูนของฟอร์ม */}
      <div
  className="max-w-2xl w-full bg-white rounded-2xl border border-gray-200 p-8 
  flex flex-col lg:flex-row items-center gap-8
  shadow-[0_5px_15px_rgba(0,0,0,0.1)]
  transition-all duration-300 
  hover:shadow-[0_15px_35px_rgba(0,0,0,0.15)] 
  hover:scale-[1.02] 
  hover:-translate-y-1 
  active:scale-[0.99]
  "
  
>

          
          {/* ✅ รูปข้างฟอร์ม */}
          <div className="hidden lg:block flex-shrink-0">
            <img
              src={SIDE_IMAGE_URL}
              alt="Decoration"
              className="w-40 h-40 object-cover rounded-xl shadow-md"
            />
          </div>

          {/* ✅ ส่วนฟอร์ม */}
          <div className="flex-1">
            <div className="mb-6">
              <img src={LOGO_URL} alt="MyUsafe Logo" className="h-20 w-auto mx-auto" />
            </div>

            <p className="text-sm text-gray-600 mb-8 text-center">
              ระบบสำหรับเจ้าหน้าที่ปฏิบัติงาน
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm text-indigo-600 hover:text-indigo-500">
                  Forgot password?
                </a>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="w-1/2 flex justify-center py-2 px-4 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={handleSignUp}
                  className="w-1/2 flex justify-center py-2 px-4 border border-indigo-600 rounded-md text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50"
                >
                  Sign Up
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ✅ พื้นหลังฝั่งขวา */}
      <div
        className="hidden lg:block w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImageURL})` }}
      ></div>
    </div>
  );
};

export default LoginForm;
