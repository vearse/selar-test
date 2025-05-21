<template>
  <div>
    <CalendarConnect  @connected="onConnected" />
    
    <div v-if="connected">
      <h2 class="text-lg font-semibold">Appointment</h2>
      <p class="text-sm text-gray-500">Choose a date to see available time slots.</p>
      <input type="date" v-model="selectedDate" @change="fetchSlots" class="my-4" />
      <TimeSlotPicker :slots="availableSlots" @select="onSelectSlot" />
      <BookingForm v-if="selectedSlot" :slot="selectedSlot" @submit="onBook" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import CalendarConnect from '../components/CalendarConnect.vue';
import TimeSlotPicker from '../components/TimeSlotPicker.vue';
import BookingForm from '../components/BookingForm.vue';
import { getAvailableTimeSlots, createCalendarEvent } from '../utils/calendar';

const connected = ref(false);
const selectedDate = ref('');
const availableSlots = ref([]);
const selectedSlot = ref(null);

function onConnected() {
  connected.value = true;
}

async function fetchSlots() {
  availableSlots.value = await getAvailableTimeSlots(selectedDate.value);
  selectedSlot.value = null;
}

function onSelectSlot(slot) {
  selectedSlot.value = slot;
}

async function onBook(details) {
  await createCalendarEvent({
    summary: 'Booked Appointment',
    description: details.notes,
    start: selectedSlot.value.start,
    end: selectedSlot.value.end,
    attendees: [{ email: details.email }]
  });
  alert('Booking confirmed!');
  selectedSlot.value = null;
  fetchSlots();
}
</script>
