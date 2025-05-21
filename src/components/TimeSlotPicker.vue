<template>
  <div>
    <h2 class="text-lg font-semibold my-4">Available Slots</h2>
    <ul>
      <li v-for="slot in slots" :key="slot.start" class="mb-1">
        <button @click="$emit('select', slot)" class="px-2 py-1 border rounded">
          {{ new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }} -
          {{ new Date(slot.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps(['slots']);
</script>
