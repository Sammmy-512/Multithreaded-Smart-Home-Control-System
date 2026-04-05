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
      const response = await api.controlTV({ roomId, action });
      if (response.success) setStatus(action);
      else setError(response.error || 'Command failed');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setTVInput = async (newInput) => {
    setInput(newInput);
    try {
      await api.setTVInput({ roomId, input: newInput });
    } catch (err) {
      console.error('Failed to set input:', err);
    }
  };

  const setTVVolume = async (vol) => {
    setVolume(vol);
    try {
      await api.setTVVolume({ roomId, volume: vol });
    } catch (err) {
      console.error('Failed to set volume:', err);
    }
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await api.getTVStatus({ roomId });
        if (response.success) {
          setStatus(response.status || 'off');
          setInput(response.input || 'HDMI1');
          setVolume(response.volume || 20);
        }
      } catch (err) {
        console.error('Failed to fetch TV status:', err);
      }
    };
    fetchStatus();
  }, [roomId]);

  return (
    <DeviceCard
      title="TV"
      status={status}
      loading={loading}
      error={error}
      className="bg-white/10 backdrop-blur-lg border border-white/10 text-white shadow-lg rounded-2xl"
    >
      <div className="space-y-4">
        <div className="flex gap-3">
          <button
            onClick={togglePower}
            disabled={loading}
            className="flex-1 py-2 rounded-full font-medium text-white transition bg-white/10 hover:bg-white/20 border border-white/20"
          >
            {status === 'on' ? 'Turn Off' : 'Turn On'}
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm text-white">
          <span>Input:</span>
          <select
            value={input}
            onChange={(e) => setTVInput(e.target.value)}
            className="px-2 py-1 rounded bg-white/10 text-white border border-white/20 focus:outline-none"
          >
            <option>HDMI1</option>
            <option>HDMI2</option>
            <option>AV</option>
            <option>TV</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-sm text-white">
          <span>Volume:</span>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setTVVolume(Number(e.target.value))}
            className="flex-1 accent-white/80"
          />
          <span>{volume}%</span>
        </div>
      </div>
    </DeviceCard>
  );
};

export default TVControl;