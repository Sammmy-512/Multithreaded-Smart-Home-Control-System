// src/components/LightControl.jsx
import React, { useState, useEffect } from 'react';
import DeviceCard from './DeviceCard';
import api from '../utils/api';
import './Controls.css';

const LightControl = () => {
  const [status, setStatus] = useState('unknown');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleLight = async (action) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.controlLight(action);
      
      if (response.success) {
        setStatus(action);
        console.log('✓ Light control success:', response.message);
      } else {
        setError(response.error || 'Command failed');
      }
    } catch (err) {
      setError(err.message);
      console.error('✗ Light control error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await api.getLightStatus();
        if (response.success) {
          // Parse response to determine status
          const message = response.message.toLowerCase();
          if (message.includes('on')) setStatus('on');
          else if (message.includes('off')) setStatus('off');
        }
      } catch (err) {
        console.error('Failed to fetch light status:', err);
      }
    };

    fetchStatus();
  }, []);

  return (
    <DeviceCard
      title="Living Room Light"
      icon="💡"
      status={status}
      loading={loading}
      error={error}
    >
      <div className="control-buttons">
        <button
          onClick={() => toggleLight('on')}
          disabled={loading || status === 'on'}
          className={`control-btn btn-primary ${status === 'on' ? 'active' : ''}`}
        >
          <span className="btn-icon">🔆</span>
          Turn On
        </button>
        <button
          onClick={() => toggleLight('off')}
          disabled={loading || status === 'off'}
          className={`control-btn btn-secondary ${status === 'off' ? 'active' : ''}`}
        >
          <span className="btn-icon">🌙</span>
          Turn Off
        </button>
      </div>

      {status !== 'unknown' && !loading && (
        <div className="status-message">
          Light is currently <strong>{status}</strong>
        </div>
      )}
    </DeviceCard>
  );
};

export default LightControl;