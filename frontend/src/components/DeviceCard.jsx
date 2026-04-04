// src/components/DeviceCard.jsx
import React from 'react';
import './DeviceCard.css';

const DeviceCard = ({ title, icon, status, children, loading, error }) => {
  return (
    <div className="device-card">
      <div className="device-header">
        <h3>
          <span className="device-icon">{icon}</span>
          {title}
        </h3>
        {status && (
          <span className={`device-status status-${status.toLowerCase()}`}>
            {status}
          </span>
        )}
      </div>

      <div className="device-body">
        {children}
      </div>

      {loading && (
        <div className="device-loading">
          <div className="spinner"></div>
          <span>Processing...</span>
        </div>
      )}

      {error && (
        <div className="device-error">
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}
    </div>
  );
};

export default DeviceCard;