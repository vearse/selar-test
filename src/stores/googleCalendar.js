import { defineStore } from 'pinia'
import googleCalendarService from '../services/googleCalendar'
import { format } from 'date-fns'

export const useGoogleCalendarStore = defineStore('googleCalendar', {
  state: () => ({
    isConnected: false,
    expiresAt: null,
    availableSlots: [],
    selectedDate: format(new Date(), 'yyyy-MM-dd'),
    isLoading: false,
    error: null
  }),
  
  getters: {
    formattedAvailableSlots(state) {
      return state.availableSlots.map(slot => ({
        ...slot,
        formattedTime: `${slot.start} - ${slot.end}`
      }))
    }
  },
  
  actions: {
    async checkConnection() {
      try {
        this.isLoading = true
        const response = await googleCalendarService.getCalendarStatus()
        this.isConnected = response.data.connected
        this.expiresAt = response.data.expires_at
      } catch (error) {
        this.error = 'Failed to check Google Calendar connection'
        console.error(error)
      } finally {
        this.isLoading = false
      }
    },
    
    async getConnectUrl() {
      try {
        const response = await googleCalendarService.getAuthUrl()
        return response.data.url
      } catch (error) {
        this.error = 'Failed to get Google authentication URL'
        console.error(error)
        return null
      }
    },
    
    async disconnectGoogle() {
      try {
        this.isLoading = true
        await googleCalendarService.disconnect()
        this.isConnected = false
        this.expiresAt = null
      } catch (error) {
        this.error = 'Failed to disconnect Google Calendar'
        console.error(error)
      } finally {
        this.isLoading = false
      }
    },
    
    async handleGoogleCallback(code) {
      try {
        this.isLoading = true
        await googleCalendarService.handleCallback(code)
        this.isConnected = true
        return true
      } catch (error) {
        this.error = 'Failed to connect Google Calendar'
        console.error(error)
        return false
      } finally {
        this.isLoading = false
      }
    },
    
    async getAvailableSlots(date) {
      try {
        this.isLoading = true
        const formattedDate = format(new Date(date), 'yyyy-MM-dd')
        this.selectedDate = formattedDate
        
        const response = await googleCalendarService.getAvailableSlots(formattedDate)
        this.availableSlots = response.data.slots
      } catch (error) {
        this.error = 'Failed to fetch available time slots'
        this.availableSlots = []
        console.error(error)
      } finally {
        this.isLoading = false
      }
    },
    
    async bookEvent(eventData) {
      try {
        this.isLoading = true
        const response = await googleCalendarService.bookEvent(eventData)
        return response.data
      } catch (error) {
        this.error = 'Failed to book event'
        console.error(error)
        throw error
      } finally {
        this.isLoading = false
      }
    }
  }
})
