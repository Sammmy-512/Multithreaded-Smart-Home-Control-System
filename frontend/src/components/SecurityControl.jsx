// src/components/SecurityControl.jsx
import React, { useState, useEffect } from 'react';
import DeviceCard from './DeviceCard';
import api from '../utils/api';

const SecurityControl = ({ roomId }) => {
  const [status, setStatus] = useState('unknown');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Control the security system (arm/disarm)
  const controlSecurity = async (action) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.controlSecurity(action, roomId);
      if (response.success) {
        if (action === 'arm') setStatus('armed');
        else if (action === 'disarm') setStatus('disarmed');
      } else {
        setError(response.error || 'Command failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch current status on mount or when roomId changes
  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      try {
        const response = await api.getSecurityStatus(roomId);
        if (response.success) {
          setStatus(response.status?.toLowerCase() === 'armed' ? 'armed' : 'disarmed');
        }
      } catch (err) {
        console.error('Failed to fetch security status:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [roomId]);

  const getStatusMessage = () => {
    if (status === 'armed') return 'Your home is protected';
    if (status === 'disarmed') return 'Security system is off';
    return 'Status unknown';
  };

  return (
    <DeviceCard
      title={`Security System`}
      status={status}
      loading={loading}
      error={error}
      className="bg-white/10 backdrop-blur-lg border border-white/10 text-white shadow-lg rounded-2xl"
    >
      <div className="space-y-4">

        {/* Status Indicator */}
        <div className="flex flex-col items-center justify-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl
            ${status !== 'unknown' ? 'bg-white/10 text-white' : 'bg-white/20 text-gray-300'}`}>
            {status === 'armed' ? '🔐' : status === 'disarmed' ? '🔓' : '❓'}
          </div>
          <p className="text-sm text-white mt-2 text-center">
            {getStatusMessage()}
          </p>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => controlSecurity('arm')}
            disabled={loading || status === 'armed'}
            className={`flex-1 py-2 rounded-full font-medium text-white transition
              ${status === 'armed'
                ? "bg-white text-gray-900 font-semibold shadow-inner"
                : "bg-white/10 hover:bg-white/20 border border-white/20"
              }`}
          >
            Arm
          </button>

          <button
            onClick={() => controlSecurity('disarm')}
            disabled={loading || status === 'disarmed'}
            className={`flex-1 py-2 rounded-full font-medium text-white transition
              ${status === 'disarmed'
                ? "bg-white text-gray-900 font-semibold shadow-inner"
                : "bg-white/10 hover:bg-white/20 border border-white/20"
              }`}
          >
            Disarm
          </button>
        </div>

      </div>
    </DeviceCard>
  );
};

export default SecurityControl;