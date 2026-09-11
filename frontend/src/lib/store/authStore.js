import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // Set user data and token after successfully logging in / registering.
      setAuth: (userData, token) => set({
        user: userData,
        token,
        isAuthenticated: true
      }),

      // Clear user data and token on logout.
      clearAuth: () => set({
        user: null,
        token: null,
        isAuthenticated: false
      }),

      // Get the token outside of React components (e.g. in the axios interceptor).
      getToken: () => get().token,
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

export default useAuthStore
