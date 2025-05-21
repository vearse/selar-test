<template>
  <div class="home">
    <h1>Google Calendar Booking System</h1>
    
    <div v-if="!isAuthenticated" class="login-section">
      <h2>Login to get started</h2>
      <form @submit.prevent="login">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required
            placeholder="your@email.com"
          >
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required
            placeholder="Enter your password"
          >
        </div>
        
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
      
      <p v-if="error" class="error">{{ error }}</p>
    </div>
    
    <div v-else>
      <p>You are logged in!</p>
      <RouterLink to="/calendar" class="cta-button">Go to Calendar</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref(null)

const isAuthenticated = computed(() => {
  return localStorage.getItem('token') !== null
})

const login = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    const response = await api.post('/login', {
      email: email.value,
      password: password.value
    })
    
    const { token } = response.data
    localStorage.setItem('token', token)
    
    router.push('/calendar')
  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.message || 'Login failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.home {
  text-align: center;
}

.login-section {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 1rem;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.form-group input {
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

.error {
  color: #f44336;
  margin-top: 1rem;
}

.cta-button {
  display: inline-block;
  background: #42b983;
  color: white;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  margin-top: 1rem;
}
</style>