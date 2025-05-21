<template>
  <button @click="connectToCalendar">Connect Google Calendar</button>
</template>

<script setup>
import { initializeGoogleAuth, requestAccessToken } from '../utils/calendar';
import { onMounted, defineEmits } from 'vue';

const emit = defineEmits(['connected']);

onMounted(async () => {
  await initializeGoogleAuth();
});

async function connectToCalendar() {
  try {
    const token = await requestAccessToken();
    console.log('Access token acquired:', token);
    emit('connected');
  } catch (error) {
    console.error('Auth failed:', error);
  }
}
</script>
