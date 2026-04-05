import React, { useState, useEffect } from 'react';
import DeviceCard from './DeviceCard';
import api from '../utils/api';

const ShowerControl = ({ roomId }) => {
  const [status, setStatus] = useState('unknown'); // 'on' or 'off'
  const [temperature, setTemperature] = useState(38); // default temp
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleShower = async (action) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.controlShower({ roomId, action, temperature });
      if (response.success) {
        setStatus(action);
      } else {
        setError(response.error || 'Command failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setShowerTemperature = (temp) => {
    setTemperature(temp);
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await api.getShowerStatus({ roomId });
        if (response.success) {
          setStatus(response.status.toLowerCase());
          setTemperature(response.temperature || 38);
        }
      } catch (err) {
        console.error('Failed to fetch shower status:', err);
      }
    };

    fetchStatus();
  }, [roomId]);

  return (
    <DeviceCard
      title="Shower"
      status={status}
      loading={loading}
      error={error}
      className="bg-white/10 backdrop-blur-lg border border-white/10 text-white shadow-lg rounded-2xl"
    >
      <div className="space-y-4">
        {/* Toggle Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => toggleShower('on')}
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
            onClick={() => toggleShower('off')}
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

        {/* Temperature Control */}
        <div className="flex items-center gap-2 text-sm text-white">
          <span>Temp:</span>
          <input
            type="number"
            min="20"
            max="45"
            value={temperature}
            onChange={(e) => setShowerTemperature(Number(e.target.value))}
            className="w-16 px-2 py-1 rounded bg-white/10 text-white border border-white/20 focus:outline-none"
          />
          <span>°C</span>
        </div>

        {/* Status Display */}
        {status !== 'unknown' && !loading && (
          <div className="text-sm text-white">
            Shower is currently{' '}
            <span className={`font-semibold ${status === 'on' ? 'text-amber-400' : 'text-gray-300'}`}>
              {status.toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </DeviceCard>
  );
};

export default ShowerControl;