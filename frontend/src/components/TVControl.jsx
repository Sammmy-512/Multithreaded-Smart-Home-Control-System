// src/components/TVControl.jsx
import React, { useState, useEffect } from 'react';
import DeviceCard from './DeviceCard';
import api from '../utils/api';

const TVControl = ({ roomId }) => {
  const [status, setStatus] = useState('off'); // on/off
  const [input, setInput] = useState('HDMI1');
  const [volume, setVolume] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const togglePower = async () => {
    setLoading(true);
    setError(null);
    try {
      const action = status === 'on' ? 'off' : 'on';
      const response = await api.controlTV(action, roomId);
      if (response.success) setStatus(action);
      else setError(response.error || 'Command failed');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyInput = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.controlTV(`setInput/${input}`, roomId);
      if (!response.success) setError(response.error || 'Failed to set input');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyVolume = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.controlTV(`setVolume/${volume}`, roomId);
      if (!response.success) setError(response.error || 'Failed to set volume');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await api.getTVStatus(roomId);
        if (response.success) {
          setStatus(response.status || 'off');
          setInput(response.input || 'HDMI1');
          setVolume(response.volume ?? 20);
        }
      } catch (err) {
        console.error('Failed to fetch TV status:', err);
      }
    };
    fetchStatus();
  }, [roomId]);

  return (
    <DeviceCard
      title={`TV - ${roomId}`}
      status={status}
      loading={loading}
      error={error}
      className="bg-white/10 backdrop-blur-lg border border-white/10 text-white shadow-lg rounded-2xl"
    >
      <div className="space-y-4">
        {/* Power Button */}
        <div className="flex gap-3">
          <button
            onClick={togglePower}
            disabled={loading}
            className="flex-1 py-2 rounded-full font-medium text-white transition bg-white/10 hover:bg-white/20 border border-white/20"
          >
            {status === 'on' ? 'Turn Off' : 'Turn On'}
          </button>
        </div>

        {/* Input Selection */}
        <div className="flex items-center gap-2 text-sm text-white">
          <span>Input:</span>
          <select
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="px-2 py-1 rounded bg-white/10 text-white border border-white/20 focus:outline-none"
          >
            <option>HDMI1</option>
            <option>HDMI2</option>
            <option>AV</option>
            <option>TV</option>
          </select>
          <button
            onClick={applyInput}
            disabled={loading}
            className="ml-2 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium"
          >
            Apply
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2 text-sm text-white">
          <span>Volume:</span>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="flex-1 accent-white/80"
          />
          <span>{volume}%</span>
          <button
            onClick={applyVolume}
            disabled={loading}
            className="ml-2 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium"
          >
            Apply
          </button>
        </div>
      </div>
    </DeviceCard>
  );
};

export default TVControl;