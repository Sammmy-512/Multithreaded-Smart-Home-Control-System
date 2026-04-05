// src/components/ThermostatControl.jsx
import React, { useState, useEffect } from 'react';
import DeviceCard from './DeviceCard';
import api from '../utils/api';

const ThermostatControl = ({ roomId }) => {
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
      const response = await api.setThermostat(temperature, roomId);
      if (response.success) {
        setCurrentTemp(temperature);
      } else {
        setError(response.error || 'Command failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await api.getThermostatStatus(roomId);
        if (response.success) {
          const temp = response.temperature || 22;
          setCurrentTemp(temp);
          setTemperature(temp);
        }
      } catch (err) {
        console.error('Failed to fetch thermostat status:', err);
        setCurrentTemp(null);
      }
    };
    fetchStatus();
  }, [roomId]);

  return (
    <DeviceCard
      title="Thermostat"
      status={currentTemp !== null ? 'online' : 'unknown'}
      loading={loading}
      error={error}
      className="bg-white/10 backdrop-blur-lg border border-white/10 text-white rounded-2xl shadow-lg"
    >
      <div className="space-y-4 text-white">

        {/* Current Temperature */}
        {currentTemp !== null && (
          <div className="text-sm">
            Current Temperature: <span className="font-semibold">{currentTemp}°C</span>
          </div>
        )}

        {/* Selected Temperature */}
        <div className="text-sm">
          Selected Temperature: <span className="font-semibold">{temperature}°C</span>
        </div>

        {/* Temperature Slider */}
        <div className="flex items-center gap-2">
          <span>15°C</span>
          <input
            type="range"
            min="15"
            max="30"
            value={temperature}
            onChange={(e) => setTemperature(parseInt(e.target.value))}
            disabled={loading}
            className="flex-1 accent-white/80"
          />
          <span>30°C</span>
        </div>

        {/* Apply Button */}
        <button
          onClick={applyTemperature}
          disabled={loading || temperature === currentTemp}
          className={`w-full py-2 rounded-lg text-sm font-medium transition
            ${temperature === currentTemp
              ? 'bg-white/10 text-white'
              : 'bg-white/20 text-white hover:bg-white/30'
            }`}
        >
          {temperature === currentTemp ? '✓ Temperature Set' : 'Apply Temperature'}
        </button>

      </div>
    </DeviceCard>
  );
};

export default ThermostatControl;