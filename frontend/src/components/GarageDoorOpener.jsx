import React, { useState, useEffect } from 'react';
import DeviceCard from './DeviceCard';
import api from '../utils/api';

const GarageDoorOpener = ({ roomId }) => {
  const [status, setStatus] = useState('closed'); // 'open' or 'closed'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleDoor = async () => {
    setLoading(true);
    setError(null);
    const action = status === 'open' ? 'close' : 'open';

    try {
      const response = await api.controlGarageDoor({ roomId, action });
      if (response.success) {
        setStatus(action === 'open' ? 'open' : 'closed');
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
        const response = await api.getGarageDoorStatus({ roomId });
        if (response.success) setStatus(response.status.toLowerCase());
      } catch (err) {
        console.error('Failed to fetch garage door status:', err);
      }
    };
    fetchStatus();
  }, [roomId]);

  return (
    <DeviceCard
      title="Garage Door"
      status={status}
      loading={loading}
      error={error}
      className="bg-white/10 backdrop-blur-lg border border-white/10 text-white shadow-lg rounded-2xl"
    >
      <button
        onClick={toggleDoor}
        disabled={loading}
        className={`w-full py-2 rounded-full font-medium text-white transition
          ${status === 'open'
            ? "bg-white text-gray-900 font-semibold shadow-inner"
            : "bg-white/10 hover:bg-white/20 border border-white/20"
          }`}
      >
        {status === 'open' ? 'Close Garage' : 'Open Garage'}
      </button>
    </DeviceCard>
  );
};

export default GarageDoorOpener;