import axios from 'axios'

// All URLs come from the .env file (see .env.example). Nothing is hardcoded.
export const BASE_URL = import.meta.env.VITE_API_URL
export const WS_URL = import.meta.env.VITE_WS_URL

if (!BASE_URL) {
  console.error('VITE_API_URL is missing. Copy .env.example to .env and set it.')
}

const api = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshing = null

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) throw new Error('No refresh token')
  const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
  localStorage.setItem('accessToken', res.data.accessToken)
  return res.data.accessToken
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    const isAuthCall = original?.url?.startsWith('/auth/')

    if (status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true
      try {
        refreshing = refreshing || refreshAccessToken()
        const newToken = await refreshing
        refreshing = null
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch (e) {
        refreshing = null
        localStorage.clear()
        sessionStorage.setItem('authNotice', 'Your session expired. Please log in again.')
        window.location.href = '/login'
        return Promise.reject(e)
      }
    }
    return Promise.reject(error)
  }
)

/** Readable message from backend ({"error": "..."}) or network failure. */
export function errorText(err) {
  if (err.response?.status === 403) return err.response?.data?.error || 'You are not allowed to do this.'
  if (!err.response) return 'Cannot reach the server. Check that the gateway is running.'
  return err.response?.data?.error || err.message || 'Something went wrong.'
}

export const money = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(n || 0))

export default api