import './App.css'
import LoginForm from './components/LoginForm/LoginForm'

function App() {
  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-blue-100">
        <h1 className="text-4xl font-bold text-blue-600">
          Hello Tailwind + React 🚀
        </h1>
      </div>
      <LoginForm />
    </>
  )
}

export default App
