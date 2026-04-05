// src/components/LightControl.jsx
import React, { useState, useEffect } from 'react';
import DeviceCard from './DeviceCard';
import api from '../utils/api';

const LightControl = ({ roomId }) => {
  const [status, setStatus] = useState('unknown'); // on/off/unknown
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleLight = async (action) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.controlLight(action, roomId);
      if (response.success) setStatus(action);
      else setError(response.error || 'Command failed');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await api.getLightStatus(roomId);
        if (response.success) {
          const msg = response.message.toLowerCase();
          if (msg.includes('on')) setStatus('on');
          else if (msg.includes('off')) setStatus('off');
          else setStatus('unknown');
        }
      } catch (err) {
        console.error('Failed to fetch light status:', err);
        setStatus('unknown');
      }
    };

    fetchStatus();
  }, [roomId]);

  return (
    <DeviceCard
      title="Light"
      status={status}
      loading={loading}
      error={error}
      className="bg-white/10 backdrop-blur-lg border border-white/10 text-white shadow-lg rounded-2xl"
    >
      <div className="space-y-4">

        {/* Toggle Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => toggleLight('on')}
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
            onClick={() => toggleLight('off')}
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

        {/* Status Display */}
        {status !== 'unknown' && !loading && (
          <div className="text-sm text-white">
            Light is currently{' '}
            <span className={`font-semibold ${status === 'on' ? 'text-amber-400' : 'text-gray-300'}`}>
              {status.toUpperCase()}
            </span>
          </div>
        )}

      </div>
    </DeviceCard>
  );
};

export default LightControl;