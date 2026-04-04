// src/components/ThermostatControl.jsx
import React, { useState, useEffect } from 'react';
import DeviceCard from './DeviceCard';
import api from '../utils/api';
import './Controls.css';

const ThermostatControl = () => {
  const [temperature, setTemperature] = useState(22);
  const [currentTemp, setCurrentTemp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const adjustTemperature = (delta) => {
    setTemperature((prev) => Math.max(15, Math.min(30, prev + delta)));
  };

  const applyTemperature = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.setThermostat(temperature);
      
      if (response.success) {
        setCurrentTemp(temperature);
        console.log('✓ Thermostat set:', response.message);
      } else {
        setError(response.error || 'Command failed');
      }
    } catch (err) {
      setError(err.message);
      console.error('✗ Thermostat error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await api.getThermostatStatus();
        if (response.success) {
          // Try to parse temperature from response
          const match = response.message.match(/(\d+)/);
          if (match) {
            const temp = parseInt(match[1]);
            setCurrentTemp(temp);
            setTemperature(temp);
          }
        }
      } catch (err) {
        console.error('Failed to fetch thermostat status:', err);
      }
    };

    fetchStatus();
  }, []);

  return (
    <DeviceCard
      title="Thermostat"
      icon="🌡️"
      status={currentTemp ? 'online' : 'unknown'}
      loading={loading}
      error={error}
    >
      {currentTemp !== null && (
        <div className="current-reading">
          Current Temperature: <strong>{currentTemp}°C</strong>
        </div>
      )}

      <div className="temperature-control">
        <button
          onClick={() => adjustTemperature(-1)}
          disabled={loading || temperature <= 15}
          className="temp-btn"
          aria-label="Decrease temperature"
        >
          <span className="temp-icon">❄️</span>
          <span className="temp-sign">−</span>
        </button>

        <div className="temperature-display">
          <div className="temp-value">{temperature}</div>
          <div className="temp-unit">°C</div>
        </div>

        <button
          onClick={() => adjustTemperature(1)}
          disabled={loading || temperature >= 30}
          className="temp-btn"
          aria-label="Increase temperature"
        >
          <span className="temp-icon">🔥</span>
          <span className="temp-sign">+</span>
        </button>
      </div>

      <button
        onClick={applyTemperature}
        disabled={loading || temperature === currentTemp}
        className="control-btn btn-primary full-width"
      >
        {temperature === currentTemp ? '✓ Temperature Set' : 'Apply Temperature'}
      </button>

      <div className="temp-range">
        <span>15°C</span>
        <input
          type="range"
          min="15"
          max="30"
          value={temperature}
          onChange={(e) => setTemperature(parseInt(e.target.value))}
          disabled={loading}
          className="temp-slider"
        />
        <span>30°C</span>
      </div>
    </DeviceCard>
  );
};

export default ThermostatControl;