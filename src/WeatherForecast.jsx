import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './WeatherApp.module.css';

const OPENWEATHERMAP_API_KEY = 'feff206daa60b539abe8fae8f2ab7f29';

function WeatherForecast() {
  const [location, setLocation] = useState('Loading...');
  const [currentTemp, setCurrentTemp] = useState('');
  const [currentCondition, setCurrentCondition] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [upcomingForecast, setUpcomingForecast] = useState([]);
  const [nextDaysForecast, setNextDaysForecast] = useState([]);
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [searchCity, setSearchCity] = useState('');

  const fetchWeatherData = async (latitude, longitude) => {
    try {
      // Fetch current weather data
      const currentWeatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`);
      const currentWeatherData = currentWeatherResponse.data;

      // Fetch forecast data
      const forecastResponse = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`);
      const forecastData = forecastResponse.data;

      // Update state with current weather data
      setLocation(`${currentWeatherData.name}, ${currentWeatherData.sys.country}`);
      setCurrentTemp(`${currentWeatherData.main.temp} °C`);
      setCurrentCondition(currentWeatherData.weather[0].description);
      setIconUrl(`http://api.openweathermap.org/img/w/${currentWeatherData.weather[0].icon}.png`);
      setTime(new Date(currentWeatherData.dt * 1000).toLocaleTimeString());
      setDate(new Date(currentWeatherData.dt * 1000).toLocaleDateString());

      // Update state with forecast data
      const hourForecasts = forecastData.list.slice(0, 4).map(forecast => ({
        time: new Date(forecast.dt * 1000).toLocaleTimeString(),
        temp: `${forecast.main.temp_max} °C / ${forecast.main.temp_min} °C`,
        condition: forecast.weather[0].description,
      }));
      setUpcomingForecast(hourForecasts);

      const dayForecasts = forecastData.list.filter((_, index) => index % 8 === 0).slice(0, 4).map(forecast => ({
        day: new Date(forecast.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
        temp: `${forecast.main.temp_max} °C / ${forecast.main.temp_min} °C`,
        condition: forecast.weather[0].description,
      }));
      setNextDaysForecast(dayForecasts);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const fetchWeatherByCity = async (city) => {
    try {
      const currentWeatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`);
      const currentWeatherData = currentWeatherResponse.data;

      // Fetch forecast data
      const forecastResponse = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`);
      const forecastData = forecastResponse.data;

      // Update state with current weather data
      setLocation(`${currentWeatherData.name}, ${currentWeatherData.sys.country}`);
      setCurrentTemp(`${currentWeatherData.main.temp} °C`);
      setCurrentCondition(currentWeatherData.weather[0].description);
      setIconUrl(`http://api.openweathermap.org/img/w/${currentWeatherData.weather[0].icon}.png`);
      setTime(new Date(currentWeatherData.dt * 1000).toLocaleTimeString());
      setDate(new Date(currentWeatherData.dt * 1000).toLocaleDateString());

      // Update state with forecast data
      const hourForecasts = forecastData.list.slice(0, 4).map(forecast => ({
        time: new Date(forecast.dt * 1000).toLocaleTimeString(),
        temp: `${forecast.main.temp_max} °C / ${forecast.main.temp_min} °C`,
        condition: forecast.weather[0].description,
      }));
      setUpcomingForecast(hourForecasts);

      const dayForecasts = forecastData.list.filter((_, index) => index % 8 === 0).slice(0, 4).map(forecast => ({
        day: new Date(forecast.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
        temp: `${forecast.main.temp_max} °C / ${forecast.main.temp_min} °C`,
        condition: forecast.weather[0].description,
      }));
      setNextDaysForecast(dayForecasts);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString());
    };

    // Update the time every second
    const intervalId = setInterval(updateTime, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherData(latitude, longitude);
      }, (error) => {
        console.error('Error getting geolocation:', error);
      });
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchCity.trim()) {
      fetchWeatherByCity(searchCity);
      setSearchCity('');
    }
  };

  return (
    <div className={styles.forecastContainer}>
      <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/edb75e510a4790fddb731ae5f75c7a4b25aa7bdb5943a4543426e0ea3ff7e86a?apiKey=4194de60541f46328d8138842995c6d9&&apiKey=4194de60541f46328d8138842995c6d9" alt="Weather background" className={styles.backgroundImage} />
      <div className={styles.forecastContent}>
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <label htmlFor="locationSearch" className={styles.visuallyHidden}>Search location</label>
          <input 
            type="text" 
            id="locationSearch" 
            className={styles.searchInput} 
            placeholder="Type the City" 
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
          />
          <button type="submit" className={styles.searchButton}>Search</button>
        </form>
        <div className={styles.logoLoc}>
        <img className={styles.weatherIcon} src={iconUrl} alt="Weather icon"/>
        <h2 className={styles.location}>{location}</h2>
        </div>
        <div className={styles.dateTime}>
          <span className={styles.time}>{time}</span>
          <span className={styles.date}>{date}</span>
        </div>
        <div className={styles.weatherDetails}>
          
          <p className={styles.currentTemp}>{currentTemp}</p>
          <p className={styles.dateTime}>{currentCondition}</p>
        </div>
        <div className={styles.forecastDetails}>
          <section className={styles.upcomingForecast}>
            <h3 className={styles.forecastTitle}>Upcoming Forecast</h3>
            {upcomingForecast.map((forecast, index) => (
              <div key={index} className={styles.forecastItem}>
                <p className={styles.forecastTime}>{forecast.time} {forecast.temp}</p>
                <p className={styles.forecastCondition}>{forecast.condition}</p>
              </div>
            ))}
          </section>
          <section className={styles.nextDaysForecast}>
            <h3 className={styles.forecastTitle}>Next 4 Days</h3>
            {nextDaysForecast.map((forecast, index) => (
                            <div key={index} className={styles.forecastItem}>
                            <p className={styles.forecastDay}>{forecast.day} {forecast.temp}</p>
                            <p className={styles.forecastCondition}>{forecast.condition}</p>
                          </div>
                        ))}
                      </section>
                    </div>
                  </div>
                </div>
              );
            }
            
            export default WeatherForecast;
            
