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
        {/* <button
          class="inline-block cursor-pointer rounded-md bg-gray-800 px-4 py-3 text-center text-sm font-semibold uppercase text-white transition duration-200 ease-in-out hover:bg-gray-900">
          Button
        </button>
        <button class="btn btn-primary">One</button>
        <button class="btn btn-secondary">Two</button>
        <button class="btn btn-accent btn-outline">Three</button> */}
      </div>
      <LoginForm />
    </>
  )
}

export default App