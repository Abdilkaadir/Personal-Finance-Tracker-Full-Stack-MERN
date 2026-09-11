import { Navigate } from 'react-router'
import useAuthStore from '../lib/store/authStore'

const AdminProtectedRoute = ({ children }) => {
  const { token, user } = useAuthStore()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default AdminProtectedRoute
