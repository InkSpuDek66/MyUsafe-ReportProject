// frontend/src/App.jsx
import { Routes, Route, useLocation } from "react-router-dom";
import './App.css'

// Common Components
import Navbar from './components/common/Navbar/Navbar'

// Auth Components
import LoginForm from './components/LoginForm/LoginForm'
import SignUpForm from './components/LoginForm/SignUpForm'

// Pages
import Home from './pages/Home/Home'
import ComplaintDetail from './components/complaints/ComplaintDetail';
import MyComplaints from './pages/user/MyComplaints';
import CreateComplaint from './pages/user/CreateComplaint';
import Reports from "./pages/admin/Reports";
import Assignments from "./pages/admin/Assignments"; // ✅ เพิ่มบรรทัดนี้

function App() {
  const location = useLocation();
  
  const hideNavbarAndButtons = ['/login', '/signup'].includes(location.pathname);

  return (
    <>
      {!hideNavbarAndButtons && <Navbar />}
      
      <Routes>
        {/* หน้าหลัก */}
        <Route path="/" element={<Home />} />
        
        {/* หน้า Auth */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignUpForm />} />
        
        {/* หน้าเรื่องร้องเรียน */}
        <Route path="/complaints/new" element={<CreateComplaint />} />
        <Route path="/my-complaints" element={<MyComplaints />} />
        <Route path="/complaint/:id" element={<ComplaintDetail />} />
        
        {/* หน้า Admin */}
        <Route path="/admin/reports" element={<Reports />} />
        <Route path="/admin/assignments" element={<Assignments />} /> {/* ✅ เพิ่มบรรทัดนี้ */}
      </Routes>

      {/* Test Buttons - ลบออกได้เมื่อไม่ใช้แล้ว */}
      {/* <div className="flex items-center justify-center min-h-screen">
        <button className="inline-block cursor-pointer rounded-md bg-gray-800 px-4 py-3 text-center text-sm font-semibold uppercase text-white transition duration-200 ease-in-out hover:bg-gray-900">
          Button
        </button>
        <button className="btn btn-primary">One</button>
        <button className="btn btn-secondary">Two</button>
        <button className="btn btn-accent btn-outline">Three</button>
      </div> */}
    </>
  );
}

export default App;