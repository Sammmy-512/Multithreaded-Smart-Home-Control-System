import React, { useState, useEffect } from 'react';
import DeviceCard from './DeviceCard';
import api from '../utils/api';

const BlindsCurtainControl = ({ roomId }) => {
  const [status, setStatus] = useState('closed'); // open/closed
  const [position, setPosition] = useState(0); // 0-100%
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleBlinds = async (action) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.controlBlinds({ roomId, action });
      if (response.success) setStatus(action);
      else setError(response.error || 'Command failed');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setBlindsPosition = async (pos) => {
    setPosition(pos);
    try {
      await api.setBlindsPosition({ roomId, position: pos });
    } catch (err) {
      console.error('Failed to set blinds position:', err);
    }
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await api.getBlindsStatus({ roomId });
        if (response.success) {
          setStatus(response.status || 'closed');
          setPosition(response.position || 0);
        }
      } catch (err) {
        console.error('Failed to fetch blinds status:', err);
      }
    };
    fetchStatus();
  }, [roomId]);

  return (
    <DeviceCard
      title="Blinds / Curtains"
      status={status}
      loading={loading}
      error={error}
      className="bg-white/10 backdrop-blur-lg border border-white/10 text-white shadow-lg rounded-2xl"
    >
      <div className="space-y-4">
        <div className="flex gap-3">
          <button
            onClick={() => toggleBlinds('open')}
            disabled={loading || status === 'open'}
            className={`flex-1 py-2 rounded-full font-medium text-white transition bg-white/10 hover:bg-white/20 border border-white/20`}
          >
            Open
          </button>
          <button
            onClick={() => toggleBlinds('closed')}
            disabled={loading || status === 'closed'}
            className={`flex-1 py-2 rounded-full font-medium text-white transition bg-white/10 hover:bg-white/20 border border-white/20`}
          >
            Close
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm text-white">
          <span>Position:</span>
          <input
            type="range"
            min="0"
            max="100"
            value={position}
            onChange={(e) => setBlindsPosition(Number(e.target.value))}
            className="flex-1 accent-white/80"
          />
          <span>{position}%</span>
        </div>

        <div className="text-sm text-white">
          Blinds are currently <span className="font-semibold">{status.toUpperCase()}</span>
        </div>
      </div>
    </DeviceCard>
  );
};

export default BlindsCurtainControl;