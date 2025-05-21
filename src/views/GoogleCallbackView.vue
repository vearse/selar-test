<template>
  <div class="google-callback">
    <h1>Connecting to Google Calendar</h1>
    
    <div v-if="isLoading" class="loading">
      <p>Please wait while we connect your Google Calendar...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="goToCalendar">Back to Calendar</button>
    </div>
    
    <div v-else class="success">
      <p>Google Calendar connected successfully!</p>
      <button @click="goToCalendar">Go to Calendar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGoogleCalendarStore } from '../stores/googleCalendar'

const router = useRouter()
const googleCalendarStore = useGoogleCalendarStore()

const isLoading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    // Get the authorization code from URL
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    
    if (!code) {
      error.value = 'Authorization code not found'
      isLoading.value = false
      return
    }
    
    const success = await googleCalendarStore.handleGoogleCallback(code)
    
    if (!success) {
      error.value = 'Failed to connect Google Calendar'
    }
  } catch (err) {
    console.error(err)
    error.value = 'An error occurred while connecting to Google Calendar'
  } finally {
    isLoading.value = false
  }
})

const goToCalendar = () => {
  router.push('/calendar')
}
</script>

<style scoped>
.google-callback {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  padding: 2rem;
}

.loading, .error, .success {
  margin-top: 2rem;
  padding: 1.5rem;
  border-radius: 8px;
}

.loading {
  background-color: #e3f2fd;
}

.error {
  background-color: #ffebee;
}

.success {
  background-color: #e8f5e9;
}

button {
  background: #42b983;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
}
</style>