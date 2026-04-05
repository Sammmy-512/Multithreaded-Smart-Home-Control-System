// src/components/FridgeControl.jsx
import React, { useState, useEffect } from 'react';
import DeviceCard from './DeviceCard';
import api from '../utils/api';

const FridgeControl = ({ roomId }) => {
  const [status, setStatus] = useState('online'); // online/offline
  const [temperature, setTemperature] = useState(4); // desired temperature
  const [currentTemp, setCurrentTemp] = useState(null); // actual fridge temp
  const [alerts, setAlerts] = useState([]); // fridge alerts
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Apply temperature to fridge
  const applyTemperature = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.setFridgeTemperature(temperature, roomId);
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

  // Fetch fridge status on mount or when roomId changes
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await api.getFridgeStatus(roomId);
        if (response.success) {
          setCurrentTemp(response.temperature || 4);
          setTemperature(response.temperature || 4);
          setAlerts(response.alerts || []);
          setStatus('online');
        }
      } catch (err) {
        console.error('Failed to fetch fridge status:', err);
        setStatus('offline');
      }
    };
    fetchStatus();
  }, [roomId]);

  return (
    <DeviceCard
      title="Fridge"
      status={status}
      loading={loading}
      error={error}
      className="bg-white/10 backdrop-blur-lg border border-white/10 text-white shadow-lg rounded-2xl"
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
          <span>0°C</span>
          <input
            type="range"
            min="0"
            max="10"
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            disabled={loading}
            className="flex-1 accent-white/80"
          />
          <span>10°C</span>
        </div>

        {/* Apply Button */}
        <button
          onClick={applyTemperature}
          disabled={loading || temperature === currentTemp}
          className={`w-full py-2 rounded-lg text-sm font-medium transition
            ${temperature === currentTemp
              ? 'bg-white/10 text-gray-300'
              : 'bg-white/20 text-white hover:bg-white/30'
            }`}
        >
          {temperature === currentTemp ? '✓ Temperature Set' : 'Apply Temperature'}
        </button>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="text-xs text-red-500">
            Alerts: {alerts.join(', ')}
          </div>
        )}

        <div className="text-sm">
          Fridge is {status.toUpperCase()}
        </div>
      </div>
    </DeviceCard>
  );
};

export default FridgeControl;