# Calendar Booking App (Vue.js + Google Calendar)

This project is a simple Vue 3-based booking interface that integrates with the Google Calendar API. Users can connect their calendar, select a date, view available time slots, and book an event directly into their calendar.

## 🔧 Features

- Google OAuth2 token-based authentication
- Calendar connection and access token handling
- Dynamic time slot generation (8 AM – 5 PM)
- Filtering out already-booked time slots
- Booking form that creates events in the user's Google Calendar

## 📁 Project Structure
📦src
┣ 📂components
┃ ┣ 📜BookingForm.vue
┃ ┣ 📜CalendarConnect.vue
┃ ┗ 📜TimeSlotPicker.vue
┣ 📜BookingPage.vue
┣ 📜App.vue
┗ 📜utils/calendar.js

## ✅ Setup Instructions

### 1. Clone the repository

git clone https://github.com/vearse/selar-test
cd selar-test

### 2. Install dependencies
npm install

### 3. Configure environment variables
Create a .env file with the following:
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_API_KEY=your_google_api_key

Make sure:

You've enabled the Google Calendar API in your Google Cloud Console.

You’ve created an OAuth 2.0 Client ID and API key.

### 4. Run the app
npm run dev

## 🔧 Areas for Improvement
 What to Improve
🎨 UI/UX & Design
Use a component library (like Vuetify, Element Plus) for a more professional look.

Add proper date/time pickers (e.g., vue-datepicker, vue-timepicker).

Show booking confirmations using modals or toast notifications instead of alert.

🔒 Authentication & Security
Replace client-only OAuth with backend token validation (using Laravel, Node.js, etc.) for better security.

Use backend storage for refresh tokens (instead of temporary tokens in browser memory).

🔗 Backend Integration (To-do)
Store bookings in a database for audit/tracking.

Create REST API for managing:

Booking availability

Storing user data

Handling errors/logging centrally

📅 Dynamic Slot Logic
Allow custom working hours and break periods.

Add duration-based slots (e.g., 15, 30, 60 minutes).

Check availability across multiple calendars or users.


🧑‍💻 Built With
Vue 3

Google Calendar API

Vite