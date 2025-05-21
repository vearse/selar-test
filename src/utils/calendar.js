let tokenClient;
let gapiInited = false;
let gisInited = false;

export function gapiLoad() {
  return new Promise((resolve) => {
    if (!window.gapi) {
      console.error('gapi not loaded. Make sure you include https://apis.google.com/js/api.js');
      resolve(false);
      return;
    }

    gapi.load('client', async () => {
      try {
        await gapi.client.init({
          apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        });
        gapiInited = true;
        resolve(true);
      } catch (error) {
        console.error('Error initializing GAPI client:', error);
        resolve(false);
      }
    });
  });
}

export function gisInit() {
  return new Promise((resolve) => {
    try {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/calendar.events.readonly https://www.googleapis.com/auth/calendar.events',
        callback: (tokenResponse) => {
          if (tokenResponse.error) {
            console.error('Token error:', tokenResponse);
            resolve(false);
            return;
          }
          resolve(true);
        },
      });
      gisInited = true;
    } catch (error) {
      console.error('Error initializing GIS:', error);
      resolve(false);
    }
  });
}

export function isInitialized() {
  return gapiInited && gisInited;
}

export function requestAccessToken() {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error("Token client not initialized"));
      return;
    }

    tokenClient.callback = (tokenResponse) => {
      if (tokenResponse.error) {
        reject(new Error(`Token error: ${tokenResponse.error}`));
        return;
      }
      resolve(tokenResponse);
    };

    tokenClient.requestAccessToken();
  });
}

function waitForGapiToLoad() {
  return new Promise((resolve, reject) => {
    const check = () => {
      if (window.gapi && window.gapi.load) {
        resolve();
      } else {
        setTimeout(check, 50);
      }
    };
    check();
  });
}

export async function initializeGoogleAuth() {
  try {
    await waitForGapiToLoad(); 
    const gapiInitialized = await gapiLoad();
    const gisInitialized = await gisInit();
    return gapiInitialized && gisInitialized;
  } catch (err) {
    console.error('Failed to initialize Google Auth:', err);
    return false;
  }
}


export async function getAvailableTimeSlots(date) {
  if (!isInitialized()) {
    await initializeGoogleAuth();
  }

  if (!gapi.client.getToken()) {
    await requestAccessToken();
  }

  // Ensure calendar API is available
  if (!gapi.client.calendar || !gapi.client.calendar.events) {
    // console.error('gapi.client.calendar is not available.');
    throw new Error('Google Calendar API not initialized.');
  }

  const start = `${date}T08:00:00`;
  const end = `${date}T17:00:00`;

  try {
    const response = await gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date(start).toISOString(),
      timeMax: new Date(end).toISOString(),
      singleEvents: true,
      orderBy: "startTime"
    });

    const items = response?.result?.items || [];
    const bookedSlots = items.map(e => ({
      start: new Date(e.start.dateTime || e.start.date),
      end: new Date(e.end.dateTime || e.end.date)
    }));

    const slots = [];
    for (let hour = 8; hour < 17; hour++) {
      const slotStart = new Date(`${date}T${hour.toString().padStart(2, '0')}:00:00`);
      const slotEnd = new Date(`${date}T${(hour + 1).toString().padStart(2, '0')}:00:00`);

      const isBooked = bookedSlots.some(ev =>
        slotStart < ev.end && slotEnd > ev.start
      );

      if (!isBooked) {
        slots.push({
          start: slotStart,
          end: slotEnd,
          formattedTime: `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`
        });
      }
    }

    return slots;
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    throw error;
  }
}

export async function createCalendarEvent({ summary, description, start, end, attendees = [] }) {
  if (!isInitialized()) {
    await initializeGoogleAuth();
  }

  if (!gapi.client.getToken()) {
    await requestAccessToken();
  }

  if (!gapi.client.calendar || !gapi.client.calendar.events) {
    console.error('gapi.client.calendar is not available.');
    throw new Error('Google Calendar API not initialized.');
  }

  try {
    const response = await gapi.client.calendar.events.insert({
      calendarId: "primary",
      resource: {
        summary,
        description,
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
        attendees: attendees.map(email => ({ email }))
      }
    });

    return response.result;
  } catch (error) {
    console.error("Error creating calendar event:", error);
    throw error;
  }
}
