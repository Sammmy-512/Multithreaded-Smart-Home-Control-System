// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import LightControl from '../components/LightControl';
import ThermostatControl from '../components/ThermostatControl';
import SecurityControl from '../components/SecurityControl';
import api from '../utils/api';
import './Dashboard.css';

const Dashboard = () => {
  const [serverStatus, setServerStatus] = useState({
    bridge: 'checking',
    cppServer: 'checking'
  });
  const [showCommandInput, setShowCommandInput] = useState(false);
  const [customCommand, setCustomCommand] = useState('');
  const [commandResponse, setCommandResponse] = useState(null);

  useEffect(() => {
    checkServerStatus();
    // Recheck every 30 seconds
    const interval = setInterval(checkServerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkServerStatus = async () => {
    try {
      const response = await api.checkHealth();
      setServerStatus({
        bridge: response.bridge || 'online',
        cppServer: response.cppServer || 'offline'
      });
    } catch (err) {
      setServerStatus({
        bridge: 'offline',
        cppServer: 'unknown'
      });
      console.error('Health check failed:', err);
    }
  };

  const sendCustomCommand = async (e) => {
    e.preventDefault();
    if (!customCommand.trim()) return;

    try {
      const response = await api.sendCommand(customCommand);
      setCommandResponse(response);
    } catch (err) {
      setCommandResponse({
        success: false,
        error: err.message
      });
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🏠 Smart Home Control Panel</h1>
          <p className="header-subtitle">Control your devices from anywhere</p>
        </div>

        <div className="status-indicators">
          <div className={`status-badge status-${serverStatus.bridge}`}>
            <span className="status-dot"></span>
            Bridge: {serverStatus.bridge}
          </div>
          <div className={`status-badge status-${serverStatus.cppServer}`}>
            <span className="status-dot"></span>
            C++ Server: {serverStatus.cppServer}
          </div>
        </div>
      </header>

      {serverStatus.cppServer === 'offline' && (
        <div className="alert alert-warning">
          <strong>⚠️ C++ Server Offline</strong>
          <p>The backend server is not reachable. Device controls will not work.</p>
          <p className="alert-hint">
            Make sure your C++ server is running: <code>./server_app</code>
          </p>
          <button onClick={checkServerStatus} className="alert-btn">
            Retry Connection
          </button>
        </div>
      )}

      {serverStatus.bridge === 'offline' && (
        <div className="alert alert-error">
          <strong>❌ Bridge Server Offline</strong>
          <p>Cannot connect to the bridge server.</p>
          <p className="alert-hint">
            Make sure the bridge server is running on port 5000: <code>npm start</code>
          </p>
          <button onClick={checkServerStatus} className="alert-btn">
            Retry Connection
          </button>
        </div>
      )}

      <div className="devices-grid">
        <LightControl />
        <ThermostatControl />
        <SecurityControl />
      </div>

      <div className="developer-section">
        <button
          onClick={() => setShowCommandInput(!showCommandInput)}
          className="dev-toggle"
        >
          {showCommandInput ? '▼' : '▶'} Developer: Send Custom Command
        </button>

        {showCommandInput && (
          <div className="command-panel">
            <form onSubmit={sendCustomCommand} className="command-form">
              <input
                type="text"
                value={customCommand}
                onChange={(e) => setCustomCommand(e.target.value)}
                placeholder="GET /device/action"
                className="command-input"
              />
              <button type="submit" className="command-submit">
                Send Command
              </button>
            </form>

            {commandResponse && (
              <div className={`command-response ${commandResponse.success ? 'success' : 'error'}`}>
                <strong>Response:</strong>
                <pre>{JSON.stringify(commandResponse, null, 2)}</pre>
              </div>
            )}

            <div className="command-examples">
              <p><strong>Examples:</strong></p>
              <code onClick={() => setCustomCommand('GET /light/on')}>
                GET /light/on
              </code>
              <code onClick={() => setCustomCommand('GET /thermostat/set/22')}>
                GET /thermostat/set/22
              </code>
              <code onClick={() => setCustomCommand('GET /security/arm')}>
                GET /security/arm
              </code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;