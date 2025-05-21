<template>
  <div class="calendar-view">
    <h1>Calendar Booking</h1>
    
    <div v-if="isLoading" class="loading">
      Loading...
    </div>
    
    <div v-else-if="!isConnected" class="connect-google">
      <p>Connect your Google Calendar to start managing bookings.</p>
      <button @click="connectGoogle" class="connect-btn">Connect Google Calendar</button>
    </div>
    
    <div v-else class="calendar-container">
      <div class="sidebar">
        <h2>Select Date</h2>
        <DatePicker 
          v-model="selectedDate" 
          @update:model-value="handleDateSelect"
          :min-date="new Date()"
          mode="date"
        />
        
        <div class="calendar-actions">
          <button @click="disconnectGoogle" class="disconnect-btn">
            Disconnect Google Calendar
          </button>
        </div>
      </div>
      
      <div class="time-slots">
        <h2>Available Time Slots for {{ formattedSelectedDate }}</h2>
        
        <div v-if="availableSlots.length === 0" class="no-slots">
          <p>No available time slots for this date.</p>
        </div>
        
        <div v-else class="slots-list">
          <div 
            v-for="(slot, index) in formattedAvailableSlots" 
            :key="index"
            class="time-slot"
            :class="{ 'selected': selectedSlot === slot }"
            @click="selectSlot(slot)"
          >
            {{ slot.formattedTime }}
          </div>
        </div>
        
        <div v-if="selectedSlot" class="booking-form">
          <h3>Book Appointment</h3>
          
          <form @submit.prevent="bookAppointment">
            <div class="form-group">
              <label for="title">Title</label>
              <input 
                type="text" 
                id="title" 
                v-model="bookingForm.title" 
                required
                placeholder="Meeting with Client"
              >
            </div>
            
            <div class="form-group">
              <label for="description">Description (Optional)</label>
              <textarea 
                id="description" 
                v-model="bookingForm.description"
                placeholder="Meeting details..."
                rows="3"
              ></textarea>
            </div>
            
            <div class="form-group">
              <label for="attendee_email">Attendee Email</label>
              <input 
                type="email" 
                id="attendee_email" 
                v-model="bookingForm.attendee_email" 
                required
                placeholder="attendee@example.com"
              >
            </div>
            
            <button type="submit" :disabled="bookingInProgress">
              {{ bookingInProgress ? 'Booking...' : 'Book Appointment' }}
            </button>
          </form>
        </div>
      </div>
    </div>
    
    <div v-if="bookingSuccess" class="booking-success">
      <h3>Booking Successful!</h3>
      <p>Your appointment has been booked.</p>
      <button @click="resetBooking">Book Another</button>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGoogleCalendarStore } from '../stores/googleCalendar'
import DatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { format } from 'date-fns'

const googleCalendarStore = useGoogleCalendarStore()
const selectedDate = ref(new Date())
const selectedSlot = ref(null)
const bookingInProgress = ref(false)
const bookingSuccess = ref(false)
const bookingForm = ref({
  title: '',
  description: '',
  attendee_email: ''
})

const isLoading = computed(() => googleCalendarStore.isLoading)
const isConnected = computed(() => googleCalendarStore.isConnected)
const availableSlots = computed(() => googleCalendarStore.availableSlots)
const formattedAvailableSlots = computed(() => googleCalendarStore.formattedAvailableSlots)
const error = computed(() => googleCalendarStore.error)

const formattedSelectedDate = computed(() => {
  return format(new Date(selectedDate.value), 'MMMM d, yyyy')
})

onMounted(async () => {
  await googleCalendarStore.checkConnection()
  if (isConnected.value) {
    await googleCalendarStore.getAvailableSlots(selectedDate.value)
  }
})

const handleDateSelect = async (date) => {
  selectedSlot.value = null
  bookingSuccess.value = false
  await googleCalendarStore.getAvailableSlots(date)
}

const selectSlot = (slot) => {
  selectedSlot.value = slot
  bookingSuccess.value = false
}

const connectGoogle = async () => {
  try {
    const url = await googleCalendarStore.getConnectUrl()
    if (url) {
      window.location.href = url
    }
  } catch (err) {
    console.error(err)
  }
}

const disconnectGoogle = async () => {
  await googleCalendarStore.disconnectGoogle()
}

const bookAppointment = async () => {
  if (!selectedSlot.value) return
  
  try {
    bookingInProgress.value = true
    
    const eventData = {
      start_datetime: selectedSlot.value.start_datetime,
      end_datetime: selectedSlot.value.end_datetime,
      title: bookingForm.value.title,
      description: bookingForm.value.description,
      attendee_email: bookingForm.value.attendee_email
    }
    
    await googleCalendarStore.bookEvent(eventData)
    bookingSuccess.value = true
    bookingForm.value = {
      title: '',
      description: '',
      attendee_email: ''
    }
    
    // Refresh available slots after booking
    await googleCalendarStore.getAvailableSlots(selectedDate.value)
  } catch (err) {
    console.error(err)
  } finally {
    bookingInProgress.value = false
  }
}

const resetBooking = () => {
  selectedSlot.value = null
  bookingSuccess.value = false
}
</script>

<style scoped>
.calendar-view {
  max-width: 1000px;
  margin: 0 auto;
}

.loading {
  text-align: center;
  padding: 2rem;
}

.connect-google {
  text-align: center;
  padding: 2rem;
}

.calendar-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  margin-top: 2rem;
}

.sidebar {
  padding: 1rem;
  background: #f7f7f7;
  border-radius: 8px;
}

.calendar-actions {
  margin-top: 2rem;
}

.time-slots {
  padding: 1rem;
}

.no-slots {
  text-align: center;
  padding: 2rem;
  background: #f7f7f7;
  border-radius: 8px;
}

.slots-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.time-slot {
  padding: 1rem;
  background: #f7f7f7;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.time-slot:hover {
  background: #e0e0e0;
}

.time-slot.selected {
  background: #42b983;
  color: white;
}

.booking-form {
  margin-top: 2rem;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  background: #42b983;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

button:disabled {
  background: #a8d5c2;
  cursor: not-allowed;
}

.connect-btn {
  background: #4285f4;
}

.disconnect-btn {
  background: #f44336;
  width: 100%;
}

.booking-success {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #e8f5e9;
  border-radius: 8px;
  text-align: center;
}

.error-message {
  margin-top: 1rem;
  padding: 1rem;
  background: #ffebee;
  color: #c62828;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .calendar-container {
    grid-template-columns: 1fr;
  }
}
</style>
