'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState<{ lat: number | null; lon: number | null }>({ lat: null, lon: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [apiResponse, setApiResponse] = useState('');
  const [updates, setUpdates] = useState('');

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lon: longitude });
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          setAddress(data.display_name || 'Address not found');
        } catch (err) {
          setError('Failed to fetch address.');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError(`Error getting location: ${err.message}`);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  const handleSendMessage = async () => {
    if (!coords.lat || !coords.lon) {
      setApiResponse('Location not available');
      return;
    }

    const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID || prompt('Enter your Telegram Chat ID:');
    if (!chatId) {
      setApiResponse('Chat ID is required');
      return;
    }

    try {
      const message = `📍 Location Update:\nLat: ${coords.lat}\nLon: ${coords.lon}\nAddress: ${address}\n\nView on Maps: https://www.google.com/maps?q=${coords.lat},${coords.lon}`;
      
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: chatId,
          message: message
        })
      });
      
      const data = await response.json();
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setApiResponse('Error sending message to Telegram');
    }
  };

  const handleTestBot = async () => {
    const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID || prompt('Enter your Telegram Chat ID:');
    if (!chatId) {
      setUpdates('Chat ID is required');
      return;
    }

    try {
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: chatId,
          message: 'Hello from GeoTrack! 👋 Your bot is working correctly.'
        })
      });
      
      const data = await response.json();
      setUpdates(JSON.stringify(data, null, 2));
    } catch (err) {
      setUpdates('Error testing bot');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Location Tracker</h1>
        <div className="mb-4">
          <div className="font-semibold text-gray-900 dark:text-white">Latitude:</div>
          <div className="text-gray-700 dark:text-gray-300">{coords.lat}</div>
        </div>
        <div className="mb-4">
          <div className="font-semibold text-gray-900 dark:text-white">Longitude:</div>
          <div className="text-gray-700 dark:text-gray-300">{coords.lon}</div>
        </div>
        <div className="mb-4">
          <div className="font-semibold text-gray-900 dark:text-white">Address:</div>
          <div className="text-gray-700 dark:text-gray-300">{address}</div>
        </div>
        <a
          href={`https://www.google.com/maps?q=${coords.lat},${coords.lon}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
        >
          View on Google Maps
        </a>
        <button
          onClick={handleSendMessage}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ml-4"
        >
          Send Location to Telegram
        </button>
        <button
          onClick={handleTestBot}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ml-4"
        >
          Test Bot
        </button>
        {apiResponse && (
          <div className="mt-4">
            <div className="font-semibold text-gray-900 dark:text-white">API Response:</div>
            <pre className="bg-gray-200 dark:bg-gray-700 p-2 rounded text-sm text-gray-900 dark:text-gray-300">{apiResponse}</pre>
          </div>
        )}
        {updates && (
          <div className="mt-4">
            <div className="font-semibold text-gray-900 dark:text-white">Bot Messages:</div>
            <pre className="bg-gray-200 dark:bg-gray-700 p-2 rounded text-sm text-gray-900 dark:text-gray-300">{updates}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
