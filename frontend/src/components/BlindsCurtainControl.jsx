// src/components/BlindsCurtainControl.jsx
import React, { useState, useEffect } from 'react';
import DeviceCard from './DeviceCard';
import api from '../utils/api';

const BlindsCurtainControl = ({ roomId }) => {
  const [status, setStatus] = useState('closed'); // open/closed
  const [position, setPosition] = useState(0); // 0-100%
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Toggle open/close
  const toggleBlinds = async (action) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.controlBlinds(action, roomId);
      if (response.success) setStatus(action);
      else setError(response.error || 'Command failed');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Apply new position
  const applyPosition = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.controlBlinds(`setPosition/${position}`, roomId);
      if (!response.success) setError(response.error || 'Failed to set position');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await api.getBlindsStatus(roomId);
        if (response.success) {
          setStatus(response.status || 'closed');
          setPosition(response.position ?? 0);
        }
      } catch (err) {
        console.error('Failed to fetch blinds status:', err);
      }
    };
    fetchStatus();
  }, [roomId]);

  return (
    <DeviceCard
      title={`Blinds / Curtains - ${roomId}`}
      status={status}
      loading={loading}
      error={error}
      className="bg-white/10 backdrop-blur-lg border border-white/10 text-white shadow-lg rounded-2xl"
    >
      <div className="space-y-4">
        {/* Open/Close Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => toggleBlinds('open')}
            disabled={loading || status === 'open'}
            className="flex-1 py-2 rounded-full font-medium text-white transition bg-white/10 hover:bg-white/20 border border-white/20"
          >
            Open
          </button>
          <button
            onClick={() => toggleBlinds('closed')}
            disabled={loading || status === 'closed'}
            className="flex-1 py-2 rounded-full font-medium text-white transition bg-white/10 hover:bg-white/20 border border-white/20"
          >
            Close
          </button>
        </div>

        {/* Position Slider */}
        <div className="flex items-center gap-2 text-sm text-white">
          <span>Position:</span>
          <input
            type="range"
            min="0"
            max="100"
            value={position}
            onChange={(e) => setPosition(Number(e.target.value))}
            className="flex-1 accent-white/80"
          />
          <span>{position}%</span>
          <button
            onClick={applyPosition}
            disabled={loading}
            className="ml-2 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium"
          >
            Apply
          </button>
        </div>

        {/* Status Display */}
        <div className="text-sm text-white">
          Blinds are currently <span className="font-semibold">{status.toUpperCase()}</span>
        </div>
      </div>
    </DeviceCard>
  );
};

export default BlindsCurtainControl;