// src/components/ExhaustFanControl.jsx
import React, { useState, useEffect } from 'react';
import DeviceCard from './DeviceCard';
import api from '../utils/api';

const ExhaustFanControl = ({ roomId }) => {
  const [status, setStatus] = useState('off'); // on/off
  const [speed, setSpeed] = useState(1); // 1-3
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Toggle fan on/off
  const toggleFan = async (action) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.controlExhaustFan(action, roomId);
      if (response.success) setStatus(action === 'on' ? 'on' : 'off');
      else setError(response.error || 'Command failed');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Apply new speed
  const applySpeed = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.controlExhaustFan(`setSpeed/${speed}`, roomId);
      if (!response.success) setError(response.error || 'Failed to set speed');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await api.getExhaustStatus(roomId);
        if (response.success) {
          setStatus(response.status?.toLowerCase() || 'off');
          setSpeed(response.speed ?? 1);
        }
      } catch (err) {
        console.error('Failed to fetch fan status:', err);
      }
    };
    fetchStatus();
  }, [roomId]);

  return (
    <DeviceCard
      title={`Exhaust Fan`}
      status={status}
      loading={loading}
      error={error}
      className="bg-white/10 backdrop-blur-lg border border-white/10 text-white shadow-lg rounded-2xl"
    >
      <div className="space-y-4">
        {/* On/Off Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => toggleFan('on')}
            disabled={loading || status === 'on'}
            className={`flex-1 py-2 rounded-full font-medium text-white transition
              ${status === 'on'
                ? "bg-white text-gray-900 font-semibold shadow-inner"
                : "bg-white/10 hover:bg-white/20 border border-white/20"
              }`}
          >
            Turn On
          </button>
          <button
            onClick={() => toggleFan('off')}
            disabled={loading || status === 'off'}
            className={`flex-1 py-2 rounded-full font-medium text-white transition
              ${status === 'off'
                ? "bg-white text-gray-900 font-semibold shadow-inner"
                : "bg-white/10 hover:bg-white/20 border border-white/20"
              }`}
          >
            Turn Off
          </button>
        </div>

        {/* Speed Control */}
        <div className="flex items-center gap-2 text-sm text-white">
          <span>Speed:</span>
          <input
            type="number"
            min="1"
            max="3"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-12 px-2 py-1 rounded bg-white/10 text-white border border-white/20 focus:outline-none"
          />
          <button
            onClick={applySpeed}
            disabled={loading}
            className="ml-2 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium"
          >
            Apply
          </button>
        </div>

        {/* Status Display */}
        <div className="text-sm text-white">
          Fan is currently <span className="font-semibold">{status.toUpperCase()}</span>
        </div>
      </div>
    </DeviceCard>
  );
};

export default ExhaustFanControl;