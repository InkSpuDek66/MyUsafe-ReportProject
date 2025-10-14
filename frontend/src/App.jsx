import './App.css'

// Layouts
import Navbar from './components/Layouts/Navbar/Navbar'

// components
import LoginForm from './components/LoginForm/LoginForm'

// pages
import Home from './pages/Home/Home'

function App() {
  return (
    <>
      <Navbar />
      <Home />
      <div className="flex items-center justify-center min-h-screen">
        {/* <h1 className="text-4xl font-bold text-blue-600">
          Hello Tailwind + React 🚀
        </h1> */}
      </div>
      <LoginForm />
    </>
  )
}

export default App