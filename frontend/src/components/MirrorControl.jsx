import React, { useState, useEffect } from 'react';
import DeviceCard from './DeviceCard';
import api from '../utils/api';

const MirrorControl = ({ roomId }) => {
  const [status, setStatus] = useState('offline'); // online/offline
  const [brightness, setBrightness] = useState(50); // 0-100
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleMirror = async (action) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.controlMirror({ roomId, action, brightness });
      if (response.success) {
        setStatus(action === 'on' ? 'online' : 'offline');
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
        const response = await api.getMirrorStatus({ roomId });
        if (response.success) {
          setStatus(response.status.toLowerCase());
          setBrightness(response.brightness || 50);
        }
      } catch (err) {
        console.error('Failed to fetch mirror status:', err);
      }
    };
    fetchStatus();
  }, [roomId]);

  return (
    <DeviceCard
      title="Mirror"
      status={status}
      loading={loading}
      error={error}
      className="bg-white/10 backdrop-blur-lg border border-white/10 text-white shadow-lg rounded-2xl"
    >
      <div className="space-y-4">
        <div className="flex gap-3">
          <button
            onClick={() => toggleMirror('on')}
            disabled={loading || status === 'online'}
            className={`flex-1 py-2 rounded-full font-medium text-white transition
              ${status === 'online'
                ? "bg-white text-gray-900 font-semibold shadow-inner"
                : "bg-white/10 hover:bg-white/20 border border-white/20"
              }`}
          >
            Turn On
          </button>

          <button
            onClick={() => toggleMirror('off')}
            disabled={loading || status === 'offline'}
            className={`flex-1 py-2 rounded-full font-medium text-white transition
              ${status === 'offline'
                ? "bg-white text-gray-900 font-semibold shadow-inner"
                : "bg-white/10 hover:bg-white/20 border border-white/20"
              }`}
          >
            Turn Off
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm text-white">
          <span>Brightness:</span>
          <input
            type="range"
            min="0"
            max="100"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="flex-1 accent-white/80"
          />
          <span>{brightness}%</span>
        </div>
      </div>
    </DeviceCard>
  );
};

export default MirrorControl;