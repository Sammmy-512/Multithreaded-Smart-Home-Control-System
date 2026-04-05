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

  // ---------- General / Health ----------
  async checkHealth() {
    return this.request('/health');
  }

  async getAllDevices() {
    return this.request('/devices');
  }

  async sendCommand(command) {
    return this.request('/command', {
      method: 'POST',
      body: JSON.stringify({ command }),
    });
  }

  // ---------- Lights ----------
  async controlLight(action, room) {
    if (!['on', 'off'].includes(action)) throw new Error('Invalid action. Use "on" or "off"');
    return this.request(`/devices/light/${action}${room ? `?room=${room}` : ''}`, { method: 'POST' });
  }

  async getLightStatus(room) {
    return this.request(`/devices/light${room ? `?room=${room}` : ''}`);
  }

  // ---------- Thermostat ----------
  async setThermostat(temperature, room) {
    if (temperature < 15 || temperature > 30) throw new Error('Temperature must be between 15°C and 30°C');
    return this.request(`/devices/thermostat/set${room ? `?room=${room}` : ''}`, {
      method: 'POST',
      body: JSON.stringify({ temperature }),
    });
  }

  async getThermostatStatus(room) {
    return this.request(`/devices/thermostat${room ? `?room=${room}` : ''}`);
  }

  // ---------- Security ----------
  async controlSecurity(action, room) {
    if (!['arm', 'disarm', 'status'].includes(action))
      throw new Error('Invalid action. Use "arm", "disarm", or "status"');
    return this.request(`/devices/security/${action}${room ? `?room=${room}` : ''}`, { method: 'POST' });
  }

  async getSecurityStatus(room) {
    return this.request(`/devices/security${room ? `?room=${room}` : ''}`);
  }

  // ---------- Smart Oven ----------
  async controlOven(action, value, room) {
    return this.request(`/devices/oven/${action}${room ? `?room=${room}&value=${value}` : `?value=${value}`}`, {
      method: 'POST',
    });
  }

  async getOvenStatus(room) {
    return this.request(`/devices/oven${room ? `?room=${room}` : ''}`);
  }

  // ---------- Smart Fridge ----------
  async controlFridge(action, value, room) {
    return this.request(`/devices/fridge/${action}${room ? `?room=${room}&value=${value}` : `?value=${value}`}`, {
      method: 'POST',
    });
  }

  async getFridgeStatus(room) {
    return this.request(`/devices/fridge${room ? `?room=${room}` : ''}`);
  }


async setFridgeTemperature(temp, room) {
  return this.controlFridge('setTemperature', temp, room);
}

async setFridgeMode(mode, room) {
  return this.controlFridge('setMode', mode, room);
}

  // ---------- Exhaust Fan ----------
  async controlExhaustFan(action, room) {
    return this.request(`/devices/exhaust/${action}${room ? `?room=${room}` : ''}`, { method: 'POST' });
  }

  async getExhaustStatus(room) {
    return this.request(`/devices/exhaust${room ? `?room=${room}` : ''}`);
  }

  // ---------- Smart Shower ----------
  async controlShower(action, temperature, room) {
    return this.request(`/devices/shower/${action}${room ? `?room=${room}&temp=${temperature}` : `?temp=${temperature}`}`, {
      method: 'POST',
    });
  }

  async getShowerStatus(room) {
    return this.request(`/devices/shower${room ? `?room=${room}` : ''}`);
  }

  // ---------- Smart Mirror ----------
  async controlMirror(action, value, room) {
    return this.request(`/devices/mirror/${action}${room ? `?room=${room}&value=${value}` : `?value=${value}`}`, {
      method: 'POST',
    });
  }

  async getMirrorStatus(room) {
    return this.request(`/devices/mirror${room ? `?room=${room}` : ''}`);
  }

  // ---------- Smart Speaker ----------
  async controlSpeaker(action, room) {
    return this.request(`/devices/speaker/${action}${room ? `?room=${room}` : ''}`, { method: 'POST' });
  }

  async getSpeakerStatus(room) {
    return this.request(`/devices/speaker${room ? `?room=${room}` : ''}`);
  }

  // ---------- TV ----------
  async controlTV(action, room) {
    return this.request(`/devices/tv/${action}${room ? `?room=${room}` : ''}`, { method: 'POST' });
  }

  async getTVStatus(room) {
    return this.request(`/devices/tv${room ? `?room=${room}` : ''}`);
  }

  // ---------- Blinds / Curtains ----------
  async controlBlinds(action, room) {
    return this.request(`/devices/blinds/${action}${room ? `?room=${room}` : ''}`, { method: 'POST' });
  }

  async getBlindsStatus(room) {
    return this.request(`/devices/blinds${room ? `?room=${room}` : ''}`);
  }

  // ---------- Garage Door ----------
  async controlGarageDoor(action, room) {
    return this.request(`/devices/garage/${action}${room ? `?room=${room}` : ''}`, { method: 'POST' });
  }

  async getGarageStatus(room) {
    return this.request(`/devices/garage${room ? `?room=${room}` : ''}`);
  }

  // ---------- Security Camera ----------
  async controlCamera(action, room) {
    return this.request(`/devices/camera/${action}${room ? `?room=${room}` : ''}`, { method: 'POST' });
  }

  async getCameraStatus(room) {
    return this.request(`/devices/camera${room ? `?room=${room}` : ''}`);
  }
}

// Export singleton instance
export default new SmartHomeAPI();