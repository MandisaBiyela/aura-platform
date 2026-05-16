import axios from 'axios'

export const TOKEN_KEY = 'aura_access_token'
export const USER_EMAIL_KEY = 'aura_user_email'

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

/** Persist email after login/register for UI (initials, display name). */
export function setStoredUserEmail(email) {
  if (email) {
    localStorage.setItem(USER_EMAIL_KEY, email.trim())
  }
}

export function getStoredUserEmail() {
  return localStorage.getItem(USER_EMAIL_KEY)
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_EMAIL_KEY)
}

// In dev, default to same origin so Vite can proxy to the API (no CORS). Set
// VITE_API_BASE_URL to call the API directly (then the backend must allow your origin).
const baseURL = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? '' : '')

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url = String(error.config?.url ?? '')
    const isAuthForm =
      url.includes('/auth/login') || url.includes('/auth/register')
    if (status === 401 && !isAuthForm) {
      clearStoredToken()
      if (typeof window !== 'undefined') {
        const path = window.location.pathname
        if (path !== '/login' && path !== '/register') {
          window.location.assign('/login')
        }
      }
    }
    return Promise.reject(error)
  },
)

export default api
