import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layouts
import Navbar from './components/Layouts/Navbar/Navbar';

// Components
import LoginForm from './components/LoginForm/LoginForm';

// Pages
import Home from './pages/Home/Home';
import ComplaintDetail from './pages/ComplaintDetail/ComplaintDetail';

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/complaint/:id" element={<ComplaintDetail />} />
        </Routes>
      </Router>

      <LoginForm />
    </>
  );
}

export default App;
