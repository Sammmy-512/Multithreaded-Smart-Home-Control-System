import React, { useState, useEffect } from 'react';
import DeviceCard from './DeviceCard';
import api from '../utils/api';

const SecurityCameraControl = ({ roomId }) => {
  const [status, setStatus] = useState('offline'); // online/offline
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleCamera = async (action) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.controlCamera({ roomId, action });
      if (response.success) setStatus(action === 'on' ? 'online' : 'offline');
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
        const response = await api.getCameraStatus({ roomId });
        if (response.success) setStatus(response.status.toLowerCase());
      } catch (err) {
        console.error('Failed to fetch camera status:', err);
      }
    };
    fetchStatus();
  }, [roomId]);

  return (
    <DeviceCard
      title="Security Camera"
      status={status}
      loading={loading}
      error={error}
      className="bg-white/10 backdrop-blur-lg border border-white/10 text-white shadow-lg rounded-2xl"
    >
      <div className="space-y-4">
        <button
          onClick={() => toggleCamera(status === 'online' ? 'off' : 'on')}
          disabled={loading}
          className={`w-full py-2 rounded-full font-medium text-white transition
            ${status === 'online'
              ? "bg-white text-gray-900 font-semibold shadow-inner"
              : "bg-white/10 hover:bg-white/20 border border-white/20"
            }`}
        >
          {status === 'online' ? 'Turn Off Camera' : 'Turn On Camera'}
        </button>
      </div>
    </DeviceCard>
  );
};

export default SecurityCameraControl;