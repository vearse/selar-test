import api from './api'

export default {
  getAuthUrl() {
    return api.get('/google/redirect')
  },
  
  handleCallback(code) {
    return api.post('/google/callback', { code })
  },
  
  disconnect() {
    return api.post('/google/disconnect')
  },
  
  getCalendarStatus() {
    return api.get('/calendar/status')
  },
  
  getAvailableSlots(date) {
    return api.get(`/calendar/slots?date=${date}`)
  },
  
  bookEvent(eventData) {
    return api.post('/calendar/book', eventData)
  }
}