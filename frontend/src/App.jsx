import { Routes, Route, useLocation } from "react-router-dom";
import './App.css'

// Common Components
import Navbar from './components/common/Navbar/Navbar'

// Auth Components
import LoginForm from './components/LoginForm/LoginForm'
import SignUpForm from './components/LoginForm/SignUpForm'
import AuthSuccess from './pages/AuthSuccess';

// Pages
import Home from './pages/Home/Home'
import ComplaintDetail from './components/complaints/ComplaintDetail';
import AssignmentDetail from './pages/staff/AssignmentDetail';
import MyComplaints from './pages/user/MyComplaints';
import EditComplaint from './pages/user/EditComplaint';
import CreateComplaint from './pages/user/CreateComplaint';
import Reports from "./pages/admin/Reports";
import Assignments from "./pages/staff/Assignments";
import StaffPerformanceReports from "./pages/admin/StaffPerformanceReport";
import ComplaintsListManagement from "./pages/admin/ComplaintListManagement";
import Profile from './pages/user/Profile';
import CategoryManagement from './pages/admin/CategoryManagement';
import LocationManagement from './pages/admin/LocationManagement'; // ✅ เพิ่มบรรทัดนี้

function App() {
  const location = useLocation();

  const hideNavbarAndButtons = ['/login', '/signup', '/auth-success'].includes(location.pathname);

  return (
    <>
      {!hideNavbarAndButtons && <Navbar />}

      <Routes>
        {/* หน้าหลัก */}
        <Route path="/" element={<Home />} />

        {/* หน้า Auth */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/auth-success" element={<AuthSuccess />} />
        <Route path="/profile" element={<Profile />} />

        {/* หน้าเรื่องร้องเรียน */}
        <Route path="/complaints/new" element={<CreateComplaint />} />
        <Route path="/my-complaints" element={<MyComplaints />} />
        <Route path="/complaint/:id" element={<ComplaintDetail />} />
        <Route path="/complaints/edit/:id" element={<EditComplaint />} />
        <Route path="/assignment/:id" element={<AssignmentDetail />} />

        {/* หน้า Admin */}
        <Route path="/admin/reports" element={<Reports />} />
        <Route path="/admin/staff-performance" element={<StaffPerformanceReports />} />
        <Route path="/admin/complaint-list" element={<ComplaintsListManagement />} />
        <Route path="/admin/assignments" element={<Assignments />} />
        <Route path="/admin/categories" element={<CategoryManagement />} />
        <Route path="/admin/locations" element={<LocationManagement />} /> {/* ✅ แก้ไขบรรทัดนี้ */}

        {/* หน้า Staff */}
        <Route path="/assignments" element={<Assignments />} />
      </Routes>
    </>
  );
}

export default App;