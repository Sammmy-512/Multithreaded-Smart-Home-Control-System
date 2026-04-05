// src/components/ThermostatControl.jsx
import React, { useState, useEffect } from 'react';
import DeviceCard from './DeviceCard';
import api from '../utils/api';

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
        const response = await api.getThermostatStatus();
        if (response.success) {
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
      status={currentTemp !== null ? 'online' : 'unknown'}
      loading={loading}
      error={error}
      className="bg-white/10 backdrop-blur-lg border border-white/10 text-white rounded-2xl shadow-lg"
    >
      <div className="space-y-4">

        {/* Current Temperature */}
        {currentTemp !== null && (
          <div className="text-sm text-white">
            Current Temperature:{' '}
            <span className="font-semibold">{currentTemp}°C</span>
          </div>
        )}

        {/* Temperature Controls */}
        <div className="flex items-center justify-between bg-white/10 rounded-full px-3 py-2">
          <button
            onClick={() => adjustTemperature(-1)}
            disabled={loading || temperature <= 15}
            className="px-4 py-1.5 rounded-full font-medium text-white bg-white/10 hover:bg-white/20 transition"
          >
            -
          </button>

          <div className="text-center">
            <div className="text-2xl font-semibold text-white">{temperature}</div>
            <div className="text-xs text-white">°C</div>
          </div>

          <button
            onClick={() => adjustTemperature(1)}
            disabled={loading || temperature >= 30}
            className="px-4 py-1.5 rounded-full font-medium text-white bg-white/10 hover:bg-white/20 transition"
          >
            +
          </button>
        </div>

        {/* Apply Button */}
        <button
          onClick={applyTemperature}
          disabled={loading || temperature === currentTemp}
          className={`w-full py-2 rounded-full font-medium text-white transition
            ${temperature === currentTemp
              ? "bg-white/10 text-white"
              : "bg-white/10 hover:bg-white/20"
            }`}
        >
          {temperature === currentTemp ? '✓ Temperature Set' : 'Apply Temperature'}
        </button>

        {/* Slider */}
        <div className="flex items-center gap-2 text-xs text-white">
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

      </div>
    </DeviceCard>
  );
};

export default ThermostatControl;