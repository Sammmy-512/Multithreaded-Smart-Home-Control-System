// src/utils/api.js
/**
 * Smart Home API Client
 * Communicates with the Node.js bridge server which talks to C++ backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class SmartHomeAPI {
  /**
   * Generic request handler with error handling
   */
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      // Handle unsuccessful responses from C++ server
      if (!data.success && data.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to bridge server. Is it running on port 5000?');
      }
      throw error;
    }
  }

  /**
   * Check health of bridge server and C++ backend
   */
  async checkHealth() {
    return this.request('/health');
  }

  /**
   * Get status of all devices
   */
  async getAllDevices() {
    return this.request('/devices');
  }

  /**
   * Control light (on/off)
   * @param {string} action - 'on' or 'off'
   */
  async controlLight(action) {
    if (!['on', 'off'].includes(action)) {
      throw new Error('Invalid action. Use "on" or "off"');
    }
    return this.request(`/devices/light/${action}`, {
      method: 'POST',
    });
  }

  /**
   * Get light status
   */
  async getLightStatus() {
    return this.request('/devices/light');
  }

  /**
   * Set thermostat temperature
   * @param {number} temperature - Temperature in Celsius (15-30)
   */
  async setThermostat(temperature) {
    if (temperature < 15 || temperature > 30) {
      throw new Error('Temperature must be between 15°C and 30°C');
    }
    return this.request('/devices/thermostat/set', {
      method: 'POST',
      body: JSON.stringify({ temperature }),
    });
  }

  /**
   * Get thermostat status
   */
  async getThermostatStatus() {
    return this.request('/devices/thermostat');
  }

  /**
   * Control security system
   * @param {string} action - 'arm', 'disarm', or 'status'
   */
  async controlSecurity(action) {
    if (!['arm', 'disarm', 'status'].includes(action)) {
      throw new Error('Invalid action. Use "arm", "disarm", or "status"');
    }
    return this.request(`/devices/security/${action}`, {
      method: 'POST',
    });
  }

  /**
   * Send custom command directly to C++ server
   * @param {string} command - Command in format: GET /device/action
   */
  async sendCommand(command) {
    return this.request('/command', {
      method: 'POST',
      body: JSON.stringify({ command }),
    });
  }
}

// Export singleton instance
export default new SmartHomeAPI();