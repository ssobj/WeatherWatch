import React, { useState, useEffect } from "react";
import styles from './WeatherApp.module.css';
import WeatherChat from './WeatherChat';
import WeatherForecast from './WeatherForecast';

function WeatherApp() {
  const [username, setUsername] = useState('');

  useEffect(() => {
    const name = prompt("Enter your name");
    if (name) {
      setUsername(name);
    }
  }, []);

  return (
    <main className={styles.weatherApp}>
      <section className={styles.chatSection}>
        <h1 className={styles.appTitle}>WeatherWatch</h1>
        <h3 className={styles.appInstruction}>Report community hazards near your location.</h3>
        <p className={styles.greeting}>Hi, {username}!</p>
        
        <WeatherChat username={username} />
      </section>
      <section className={styles.forecastSection}>
        <WeatherForecast />
      </section>
    </main>
  );
}

export default WeatherApp;
