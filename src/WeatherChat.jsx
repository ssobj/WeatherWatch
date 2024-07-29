import React, { useState, useEffect } from "react";
import styles from './WeatherApp.module.css';

const WS_URL = 'ws://localhost:8080'; // Ensure this matches your WebSocket server URL
const OPENWEATHERMAP_API_KEY = 'feff206daa60b539abe8fae8f2ab7f29';

function WeatherChat({ username }) {
  const [chatMessages, setChatMessages] = useState([]);
  const [selectedWeather, setSelectedWeather] = useState('');
  const [location, setLocation] = useState('Your Location');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Get the user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHERMAP_API_KEY}`)
          .then(response => response.json())
          .then(data => {
            setLocation(data.name || 'Your Location'); // Set city or default if not available
          })
          .catch(error => {
            console.error('Error fetching location:', error);
            setLocation('Your Location'); // Default if there's an error
          });
      }, (error) => {
        console.error('Error getting geolocation:', error);
        setLocation('Your Location'); // Default if there's an error
      });
    } else {
      console.error('Geolocation is not supported by this browser.');
      setLocation('Your Location'); // Default if geolocation is not supported
    }

    const ws = new WebSocket(WS_URL);
    setSocket(ws);

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
      if (typeof event.data === 'string') {
        // Handle text data
        try {
          const message = JSON.parse(event.data);
          setChatMessages((prevMessages) => [message, ...prevMessages]);
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      } else if (event.data instanceof Blob) {
        // Handle Blob data
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const text = reader.result;
            const message = JSON.parse(text);
            setChatMessages((prevMessages) => [message, ...prevMessages]);
          } catch (error) {
            console.error('Error parsing Blob data:', error);
          }
        };
        reader.readAsText(event.data);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.warn('WebSocket connection closed. Reconnecting...');
      setTimeout(() => {
        const newWs = new WebSocket(WS_URL);
        setSocket(newWs);
      }, 3000);
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleReport = () => {
    if (selectedWeather === "") {
      console.error('Please select a valid report');
      return;
    }

    const [icon, iconName] = selectedWeather.split(' ', 2); // Extract icon and icon name
    const message = {
      user: username, // Use the entered username
      weather: `${icon} ${iconName}`,
      location: location, // Include user's city location
      time: new Date().toLocaleTimeString(),
    };

    console.log('Sending message:', message); // Check if this log appears when you click Report

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not open');
    }

    // Reset to default option after submitting
    setSelectedWeather("");
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messageList}>
        {chatMessages.map((message, index) => (
          <div key={index} className={styles.messageItem}>
            {message.user} reported {message.weather} at {message.time} from {message.location}
          </div>
        ))}
      </div>
      <div className={styles.divider} />
      <div className={styles.reportSection}>
        <div className={styles.weatherSelect}>
          <select 
            className={styles.select}
            id="emoji" 
            value={selectedWeather} 
            onChange={(e) => setSelectedWeather(e.target.value)}
          >
            <option value="" disabled>Select Report</option>
            <option value="☀️ Sunny">☀️ Sunny</option>
            <option value="🌧️ Light Rain">🌧️ Light Rain</option>
            <option value="🌧️ Heavy Rain">🌧️ Heavy Rain</option>
            <option value="🌊 Tsunami">🌊 Tsunami</option>
            <option value="⚡ Lightning">⚡ Lightning</option>
            <option value="🌊 Flood">🌊 Flood</option>
            <option value="🔥 Fire">🔥 Fire</option>
            <option value="🌍 Earthquake">🌍 Earthquake</option>
            <option value="🌡️ High Temperature">🌡️ High Temperature</option>
            <option value="🤒 Fever">🤒 Fever</option>
            <option value="🌫️ Fog">🌫️ Fog</option>
            <option value="💨 Thick Smoke">💨 Thick Smoke</option>
            <option value="🚗 Accident">🚗 Accident</option>
          </select>
        </div>
        <button className={styles.reportButton} onClick={handleReport}>
          Report
        </button>
      </div>
    </div>
  );
}

export default WeatherChat;
