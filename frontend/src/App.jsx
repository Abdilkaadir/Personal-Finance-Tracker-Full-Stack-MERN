import { Route, Routes, Navigate } from 'react-router'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import { Dashboard } from './pages/Dashboard/Dashboard'
import { AdminPage } from './pages/Dashboard/AdminPage'
import ProtectedRoute from './components/ProtectedRoute'
import AdminProtectedRoute from './components/AdminProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path='/admin' element={<AdminProtectedRoute><AdminPage /></AdminProtectedRoute>} />

      <Route path='/' element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
