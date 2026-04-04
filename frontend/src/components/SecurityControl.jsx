// src/components/SecurityControl.jsx
import React, { useState } from 'react';
import DeviceCard from './DeviceCard';
import api from '../utils/api';
import './Controls.css';

const SecurityControl = () => {
  const [status, setStatus] = useState('unknown');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const controlSecurity = async (action) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.controlSecurity(action);
      
      if (response.success) {
        if (action === 'arm') setStatus('armed');
        else if (action === 'disarm') setStatus('disarmed');
        console.log('✓ Security control success:', response.message);
      } else {
        setError(response.error || 'Command failed');
      }
    } catch (err) {
      setError(err.message);
      console.error('✗ Security control error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DeviceCard
      title="Security System"
      icon="🔒"
      status={status}
      loading={loading}
      error={error}
    >
      <div className="security-status">
        <div className={`security-indicator status-${status}`}>
          {status === 'armed' && <span className="pulse"></span>}
          <span className="security-icon">
            {status === 'armed' ? '🔐' : status === 'disarmed' ? '🔓' : '❓'}
          </span>
        </div>
        <p className="security-message">
          {status === 'armed' && 'Your home is protected'}
          {status === 'disarmed' && 'Security system is off'}
          {status === 'unknown' && 'Status unknown'}
        </p>
      </div>

      <div className="control-buttons">
        <button
          onClick={() => controlSecurity('arm')}
          disabled={loading || status === 'armed'}
          className={`control-btn btn-danger ${status === 'armed' ? 'active' : ''}`}
        >
          <span className="btn-icon">🔐</span>
          Arm System
        </button>
        <button
          onClick={() => controlSecurity('disarm')}
          disabled={loading || status === 'disarmed'}
          className={`control-btn btn-secondary ${status === 'disarmed' ? 'active' : ''}`}
        >
          <span className="btn-icon">🔓</span>
          Disarm System
        </button>
      </div>
    </DeviceCard>
  );
};

export default SecurityControl;