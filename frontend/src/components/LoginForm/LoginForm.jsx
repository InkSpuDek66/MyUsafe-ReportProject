import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const BASE_URL = "http://localhost:5000";
const LOGO_URL = "../../../public/MyUSafe_LOGO2.png";

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [canAccept, setCanAccept] = useState(false);
  const [oauthProvider, setOauthProvider] = useState(null); // ✅ เก็บ provider ปัจจุบัน
  const policyRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};:'",.<>?/\\|`~=-]).{8,10}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!policyAccepted) {
      setError(
        "กรุณายอมรับนโยบายความเป็นส่วนตัวเป็นส่วนก่อนเข้าสู่ระบบ"
      );
      return;
    }

    if (!validatePassword(formData.password)) {
      setError(
        "รหัสผ่านต้องมี 8–10 ตัว ประกอบด้วย ตัวใหญ่ 1 ตัว ตัวเล็ก 1 ตัว และอักขระพิเศษ 1 ตัว"
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      }
    } catch {
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => navigate("/signup");

  // ✅ ฟังก์ชันจัดการ OAuth โดยแสดง Policy ก่อน
  const handleOAuthClick = (provider) => {
    setOauthProvider(provider);
    setShowPolicy(true);
    setCanAccept(false);
  };

  // ✅ ฟังก์ชันยืนยัน OAuth หลังจากยอมรับ Policy
  const confirmOAuthLogin = () => {
    if (oauthProvider === "google") {
      window.location.href = `${BASE_URL}/auth/google`;
    } else if (oauthProvider === "github") {
      window.location.href = `${BASE_URL}/auth/github`;
    }
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleScrollPolicy = () => {
    const box = policyRef.current;
    if (box.scrollTop + box.clientHeight >= box.scrollHeight - 10) {
      setCanAccept(true);
    }
  };

  const closePolicy = () => {
    setShowPolicy(false);
    setOauthProvider(null);
    setCanAccept(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-xl relative">
        <div className="text-center mb-6">
          <img src={LOGO_URL} alt="MyUSafe Logo" className="w-20 mx-auto" />
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

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={policyAccepted}
                onChange={(e) => setPolicyAccepted(e.target.checked)}
                disabled={!canAccept}
                className="h-4 w-4 text-green-600 border-gray-300 rounded disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => {
                  setShowPolicy(true);
                  setOauthProvider(null);
                }}
                className="text-green-600 underline hover:text-green-500"
              >
                นโยบายความเป็นส่วนตัว
              </button>
            </label>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-1/2 py-2 rounded-md font-semibold text-white transition ${loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
                }`}
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

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              หรือเข้าสู่ระบบด้วย
            </span>
          </div>
        </div>

        {/* ✅ OAuth Buttons - เรียก handleOAuthClick แทน */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleOAuthClick("google")}
            className="py-2 rounded-md border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="w-4 h-4"
            />
            Google
          </button>
          {/* <button
            type="button"
            onClick={() => handleOAuthClick("github")}
            className="py-2 rounded-md border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.207 11.387.6.11.793-.26.793-.577v-2.234c-3.338.726-4.043-1.61-4.043-1.61-.546-1.386-1.334-1.757-1.334-1.757-1.09-.745.083-.729.083-.729 1.206.085 1.84 1.238 1.84 1.238 1.07 1.835 2.807 1.305 3.49.998.107-.776.42-1.305.762-1.606-2.665-.3-5.466-1.334-5.466-5.93 0-1.31.467-2.382 1.236-3.222-.124-.303-.536-1.522.118-3.176 0 0 1.008-.323 3.3 1.23a11.52 11.52 0 0 1 3-.404c1.02.004 2.045.137 3 .404 2.29-1.553 3.296-1.23 3.296-1.23.656 1.654.244 2.873.12 3.176.77.84 1.235 1.912 1.235 3.222 0 4.61-2.804 5.625-5.475 5.92.43.372.823 1.104.823 2.222v3.293c0 .32.192.694.8.575C20.565 21.796 24 17.297 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </button> */}
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

        {/* ✅ Policy Modal - ใช้ได้ทั้ง Email Login และ OAuth */}
        {showPolicy && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white w-full max-w-3xl rounded-lg shadow-2xl p-6 relative">
              <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">
                นโยบายความเป็นส่วนตัว (Privacy Policy)
              </h3>
              <div
                ref={policyRef}
                onScroll={handleScrollPolicy}
                className="overflow-y-auto h-[60vh] border border-gray-200 rounded-lg p-4 bg-gray-50 text-sm text-gray-700 leading-relaxed"
              >
                <p>
                  นโยบายความเป็นส่วนตัว (Privacy Policy) <br />

                  นโยบายความเป็นส่วนตัวนี้จัดทำขึ้นโดย [MyuSafe]
                  เพื่ออธิบายวิธีการเปิดเผยและคุ้มครองข้อมูลส่วนบุคคลของผู้ใช้บริการ
                  โดยเป็นไปตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) และกฎหมายที่เกี่ยวข้องอื่นๆ ของ
                  การที่ท่านเข้ามาใช้บริการเว็บไซต์หรือสมัครสมาชิกถือว่าท่านได้อ่านและยอมรับนโยบายนี้แล้ว
                  <br /><br />

                  ข้อ 1: การเก็บรวบรวมข้อมูลส่วนบุคคล

                  เรากำลังเก็บข้อมูลส่วนบุคคลเฉพาะเท่าที่เราจำเป็น ได้แก่:

                  ชื่อ และ อีเมล ที่ท่านกรอกขณะสมัครสมาชิก หรือเข้าสู่ระบบผ่านบริการของบุคคลที่สาม (OAuth2.0 เช่น Google, Facebook, GitHub)

                  รหัสผู้ใช้ (User ID) หรือ รหัสบัญชีจาก OAuth Provider เพื่อใช้เชื่อมโยงบัญชีของท่าน

                  ข้อมูลทางเทคนิคบางส่วน เช่น หมายเลข IP, ประเภทของอุปกรณ์, เบราว์เซอร์, วันที่และเวลาที่เข้ามาใช้งาน เพื่อการรักษาความปลอดภัยและปรับปรุงประสบการณ์ใช้งาน

                  เรา ไม่เก็บข้อมูลละเอียดอ่อน (Sensitive Data) เช่น หมายเลขบัตรประชาชน เลขบัญชีธนาคาร หรือข้อมูลสุขภาพ
                  <br /><br />

                  ข้อ 2: แหล่งที่มาของข้อมูล

                  ข้อมูลของท่านอาจถูกเก็บจาก:

                  ข้อมูลที่ท่านกรอกโดยตรงขณะสมัครหรือลงชื่อเข้าใช้

                  ระบบ OAuth 2.0 ที่ท่านอนุญาตให้เข้าถึงข้อมูล เช่น ชื่อและอีเมลจาก Google

                  การใช้ คุกกี้ (Cookies) และ เทคโนโลยีติดตาม (Tracking Technologies) เพื่อปรับปรุงคุณภาพเว็บไซต์
                  <br /><br />

                  ข้อ 3: การใช้คุกกี้ (Cookies) และเทคโนโลยีติดตาม

                  เว็บไซต์ของเรา ใช้คุกกี้เพื่อ:

                  เก็บการตั้งค่าการใช้งานของผู้ใช้

                  วิเคราะห์การใช้งานของเว็บไซต์ (ผ่าน Google Analytics)

                  ปรับปรุงประสบการณ์ของผู้ใช้และการนำเสนออื่นๆ

                  ท่านสามารถปิดการใช้คุกกี้ได้ในเบราว์เซอร์เซอร์ของท่าน แต่บางฟังก์ชันอาจจะไม่สามารถใช้งานได้อย่างเต็มที่

                  <br /><br />
                  ข้อ 4: วัตถุประสงค์ในการใช้ข้อมูล

                  เรากำลังใช้ข้อมูลของท่านเพื่อ:

                  จัดทำบัญชีผู้ใช้งาน และให้บริการเข้าสู่ระบบ

                  จัดการระเบียบข้อมูล เช่น ฟีเจอร์ หรือเนื้อหาส่วนบุคคล

                  ปรับปรุงคุณภาพบริการ ประสบการณ์ใช้งาน และความปลอดภัย

                  ติดตามอื่นๆ หรือแจ้งข้อมูลสำคัญเกี่ยวกับการเปลี่ยนแปลง
                  บริการ
                  <br /><br />

                  ข้อ 5: การเปิดเผยข้อมูลส่วนบุคคล

                  เรา ไม่เปิดเผยข้อมูลของท่านให้บุคคลอื่น เว้นแต่ในกรณีดังต่อไปนี้:

                  เพื่อให้บริการทางเทคนิค เช่น เซิร์ฟเวอร์ โฮสติ้ง หรือระบบเก็บข้อมูล (ซึ่งมีข้อตกลงคุ้มครองข้อมูลอยู่เหมาะสม)

                  เมื่อมีคำสั่งศาลหรือสิ่งบังคับเหล่านี้

                  เพื่อป้องกันสิทธิ คุณภาพ หรือทรัพย์สินของเว็บไซต์
                  หรือผู้ใช้บริการของเรา

                  เมื่อท่านได้ให้ความยินยอมเป็นลายลักษณ์อักษร
                  <br /><br />

                  ข้อ 6: ระยะเวลาในการเก็บข้อมูล

                  เรา จะเก็บข้อมูลส่วนบุคคลของท่านไว้ตราบเท่าที่ท่านยังคงใช้บริการของเรา
                  หรือจนกว่าจะมีการยกเลิกบัญชี
                  หลังจากนั้น ข้อมูลของท่านจะถูกลบออกจากระบบในระยะเวลาที่เหมาะสม (โดยทั่วไปไม่เกิน 90 วัน)
                  เพื่อป้องกันการเข้าถึงโดยไม่ได้รับอนุญาต
                  และปฏิบัติตามข้อกำหนดทางกฎหมาย
                  <br /><br />

                  ข้อ 7: สิทธิของเจ้าของข้อมูล

                  ท่านมีสิทธิตามกฎหมาย ดังนี้:

                  ข้อเข้าถึงถึงข้อมูลส่วนบุคคลของตน

                  ข้อให้แก้ไข เพิ่มเติม หรือลบข้อมูลให้ถูกต้อง
                  โดยใช้ระบบเข้าถึงข้อมูลรหัสและการตรวจสอบสิทธิ์การเข้าถึง

                  ข้อมิให้เก็บ คำสั่ง ศาล เรีย หรือระงับการใช้ข้อมูล

                  ถ้อนความยินยอมเมื่อมีอำนาจหาก พบว่ามีการละเมิดข้อมูลส่วนบุคคล

                  สามารถติดต่อเราเพื่อดำเนินการตามสิทธิเหล่านี้ได้ที่อีเมลของเรา
                  <br /><br />

                  ข้อ 8: การรักษาความปลอดภัยของข้อมูล

                  เรามีมาตรการทางเทคนิคและการจัดการเพื่อป้องกัน:

                  การเข้าถึงถึงข้อมูลโดยไม่ได้รับอนุญาต

                  การสูญหาย การทำลาย หรือการเปลี่ยนแปลงข้อมูลโดยมิชอบ
                  โดยใช้ระบบเข้าถึงข้อมูลรหัสและการตรวจสอบสิทธิ์การเข้าถึง
                  <br /><br />

                  ข้อ 9: การปรับปรุงนโยบาย

                  เรา อาจปรับปรุงนโยบายนี้เป็นครั้งคราว เพื่อให้สอดคล้องกับข้อกำหนดการให้บริการใหม่ ๆ
                  โดยจะประกาศเวอร์ชันชันล่าสุดบนเว็บไซต์นี้ และถือว่าท่านยอมรับการเปลี่ยนแปลงเมื่อใช้งานเว็บไซต์ต่อไป
                  <br /><br />


                  หากท่านมีข้อสงสัย ข้อเรียนร้อง หรือคำแนะนำเกี่ยวกับนโยบายความเป็นส่วนตัวนี้
                  <br />
                  สามารถติดต่อได้ที่: <br />
                  📧 Myusafe@gmail.com <br />
                  🌐 www.Myusafe@gmail.com


                </p>
                <p className="text-gray-500 text-xs mt-4">
                  อัพเดตล่าสุด: 6 พฤศจิกายน 2568
                </p>
              </div>

              <div className="text-center mt-6 flex gap-3 justify-center">
                <button
                  onClick={closePolicy}
                  className="px-8 py-2 rounded-md font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                >
                  ยกเลิก
                </button>
                <button
                  disabled={!canAccept}
                  onClick={() => {
                    if (oauthProvider) {
                      // OAuth flow
                      confirmOAuthLogin();
                    } else {
                      // Email login flow
                      setShowPolicy(false);
                      setPolicyAccepted(true);
                      setCanAccept(false);
                    }
                  }}
                  className={`px-8 py-2 rounded-md font-semibold text-white transition ${canAccept
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-400 cursor-not-allowed"
                    }`}
                >
                  ยอมรับ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginForm;