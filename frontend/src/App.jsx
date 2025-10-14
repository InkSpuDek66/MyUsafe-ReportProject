import './App.css'

// React Router
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts
import Navbar from './components/Layouts/Navbar/Navbar'

// Components
import LoginForm from './components/LoginForm/LoginForm'

// Pages
import Home from './pages/Home/Home'

function App() {
  return (
    <BrowserRouter>
      {/* Navbar จะอยู่บนทุกหน้า */}
      <Navbar />

      {/* ส่วนของ Route สำหรับแต่ละหน้า */}
      <Routes>
        {/* หน้าแรก */}
        <Route path="/" element={<Home />} />

        {/* หน้าล็อกอิน */}
        <Route path="/login" element={<LoginForm />} />

        {/* สามารถเพิ่มหน้าอื่นได้ เช่น */}
        {/* <Route path="/about" element={<About />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App;
