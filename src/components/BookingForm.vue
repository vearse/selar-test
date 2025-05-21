<template>
  <form @submit.prevent="submit">
    <input v-model="name" placeholder="Name" class="block mb-2 border p-1" />
    <input v-model="email" placeholder="Email" class="block mb-2 border p-1" />
    <textarea v-model="notes" placeholder="Notes" class="block mb-2 border p-1"></textarea>
    <button type="submit" class="px-3 py-1 bg-green-500 text-white rounded">Book</button>
  </form>
</template>

<script setup>
import { ref } from 'vue';

const name = ref('');
const email = ref('');
const notes = ref('');

const emit = defineEmits(['submit']);

function submit() {
  emit('submit', { name: name.value, email: email.value, notes: notes.value });
}
</script>
