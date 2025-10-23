// React Router
import { Routes, Route, useLocation } from "react-router-dom"; 
import './App.css'

// common
import Navbar from './components/common/Navbar/Navbar'

// Components
import LoginForm from './components/LoginForm/LoginForm'
import SignUpForm from './components/LoginForm/SignUpForm' 
import ComplaintForm from './components/complaints/ComplaintForm'

// Pages
import Home from './pages/Home/Home' 
import ComplaintDetail from './pages/ComplaintDetail/ComplaintDetail';


function App() {
  const location = useLocation();
  
  // ✅ ซ่อน Navbar และ Test Buttons ในหน้า login และ signup
  const hideNavbarAndButtons = ['/login', '/signup'].includes(location.pathname);

  return (
    <>
      {!hideNavbarAndButtons && <Navbar />}
      
      <Routes>
        {/* หน้าหลัก */}
        <Route path="/" element={<Home />} />
        
        {/* หน้า Login */}
        <Route path="/login" element={<LoginForm />} />
        
        {/* หน้า Sign Up */}
        <Route path="/signup" element={<SignUpForm />} />
        
        {/* หน้าแจ้งเรื่องร้องเรียน */}
        <Route path="/complaints/new" element={<ComplaintForm />} />
        
        {/* หน้าแสดงรายละเอียดเรื่องร้องเรียน */}
        <Route path="/complaint/:id" element={<ComplaintDetail/>} />
        
      </Routes>

      {/* Test Buttons - แสดงเฉพาะหน้าที่ไม่ใช่ login/signup */}
      {!hideNavbarAndButtons && (
        <div className="flex items-center justify-center min-h-screen">
          <button className="inline-block cursor-pointer rounded-md bg-gray-800 px-4 py-3 text-center text-sm font-semibold uppercase text-white transition duration-200 ease-in-out hover:bg-gray-900">
            Button
          </button>
          <button className="btn btn-primary">One</button>
          <button className="btn btn-secondary">Two</button>
          <button className="btn btn-accent btn-outline">Three</button>
        </div>
      )}
    </>
  );
}

export default App;