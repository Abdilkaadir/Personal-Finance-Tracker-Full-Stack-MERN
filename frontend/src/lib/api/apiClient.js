import axios from 'axios'
import useAuthStore from '../store/authStore'

// This backend mounts its routes directly at the root (e.g. /auth, /transactions),
// not under an /api prefix.
const API_URL = 'http://localhost:5000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor to add the Authorization header to every request.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api
