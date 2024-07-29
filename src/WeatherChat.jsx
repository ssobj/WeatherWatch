import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './WeatherApp.module.css';

const WS_URL = `wss://${window.location.host}/ws`; // Ensure this matches your WebSocket server URL
const OPENWEATHERMAP_API_KEY = 'feff206daa60b539abe8fae8f2ab7f29';

function WeatherChat({ username }) {
  const [chatMessages, setChatMessages] = useState([]);
  const [selectedWeather, setSelectedWeather] = useState('');
  const [location, setLocation] = useState('Your Location');
  const [coords, setCoords] = useState({ lat: 0, lon: 0 });
  const [socket, setSocket] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [mapCoords, setMapCoords] = useState({ lat: 0, lon: 0 });
  const [mapIcon, setMapIcon] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lon: longitude });
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHERMAP_API_KEY}`)
          .then(response => response.json())
          .then(data => {
            setLocation(data.name || 'Your Location');
          })
          .catch(error => {
            console.error('Error fetching location:', error);
            setLocation('Your Location');
          });
      }, (error) => {
        console.error('Error getting geolocation:', error);
        setLocation('Your Location');
      });
    } else {
      console.error('Geolocation is not supported by this browser.');
      setLocation('Your Location');
    }

    const ws = new WebSocket(WS_URL);
    setSocket(ws);

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
      console.log('Received WebSocket message:', event.data); // Log raw message

      if (typeof event.data === 'string') {
        try {
          const message = JSON.parse(event.data);
          console.log('Parsed message:', message); // Log parsed message
          setChatMessages((prevMessages) => [message, ...prevMessages]);
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      } else if (event.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const text = reader.result;
            const message = JSON.parse(text);
            console.log('Parsed Blob message:', message); // Log parsed Blob message
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

    const [icon, ...iconNameParts] = selectedWeather.split(' ');
    const iconName = iconNameParts.join(' ');
    const message = {
      user: username,
      weather: `${icon} ${iconName}`,
      location: location,
      time: new Date().toLocaleTimeString(),
      coords: coords
    };

    console.log('Sending message:', message);

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not open');
    }

    setSelectedWeather("");
  };

  const handleLocationClick = (coords, icon) => {
    setMapCoords(coords);
    setShowMap(true);
    setMapIcon(icon);
  };

  const CustomMarker = ({ coords, icon }) => {
    const map = useMap();
    useEffect(() => {
      if (coords) {
        map.setView(coords, 13);
      }
    }, [coords, map]);

    return (
      <Marker
        position={coords}
        icon={L.divIcon({
          html: `<div style="font-size: 24px;">${icon}</div>`,
          className: ''
        })}
      >
        <Popup>{icon} is reported in {location}</Popup>
      </Marker>
    );
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messageList}>
        {chatMessages.map((message, index) => (
          <div key={index} className={styles.messageItem}>
            {message.user} reported {message.weather} at {message.time} from&nbsp;
            <a href="#" onClick={() => handleLocationClick(message.coords, message.weather.split(' ')[0])}>
              {message.location}
            </a>
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
      {showMap && (
        <div className={styles.mapPopup}>
          <button className={styles.closeButton} onClick={() => setShowMap(false)}>X</button>
          <MapContainer center={[mapCoords.lat, mapCoords.lon]} zoom={14} className={styles.map}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <CustomMarker coords={[mapCoords.lat, mapCoords.lon]} icon={mapIcon} />
          </MapContainer>
        </div>
      )}
    </div>
  );
}

export default WeatherChat;
