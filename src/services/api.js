import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request interceptor for API calls
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response interceptor for API calls
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    
    // If the error is due to an expired token and we haven't tried refreshing yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // Logic for refreshing token would go here if implemented
        // For now, just redirect to login
        localStorage.removeItem('token')
        window.location.href = '/'
      } catch (error) {
        localStorage.removeItem('token')
        window.location.href = '/'
      }
    }
    
    return Promise.reject(error)
  }
)

export default api