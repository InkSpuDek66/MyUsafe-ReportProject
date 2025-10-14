import { Routes, Route } from 'react-router-dom'
import './App.css'

// common
import Navbar from './components/common/Navbar/Navbar'

// components
import LoginForm from './components/LoginForm/LoginForm'
import ComplaintForm from './components/complaints/ComplaintForm'

// pages
import Home from './pages/Home/Home'

function App() {
  return (
    <>
      <Navbar />
      
      <Routes>
        {/* หน้าหลัก */}
        <Route path="/" element={<Home />} />
        
        {/* หน้า Login */}
        <Route path="/login" element={<LoginForm />} />
        
        {/* หน้าแจ้งเรื่องร้องเรียน */}
        <Route path="/complaints/new" element={<ComplaintForm />} />
        
        {/* เพิ่ม routes อื่นๆ ตามต้องการ */}
        {/* <Route path="/complaints" element={<ComplaintList />} /> */}
        {/* <Route path="/complaints/:id" element={<ComplaintDetail />} /> */}
      </Routes>

      {/* Test Buttons - ลบออกได้เมื่อไม่ใช้แล้ว */}
      <div className="flex items-center justify-center min-h-screen">
        <button className="inline-block cursor-pointer rounded-md bg-gray-800 px-4 py-3 text-center text-sm font-semibold uppercase text-white transition duration-200 ease-in-out hover:bg-gray-900">
          Button
        </button>
        <button className="btn btn-primary">One</button>
        <button className="btn btn-secondary">Two</button>
        <button className="btn btn-accent btn-outline">Three</button>
      </div>
    </>
  )
}

export default App