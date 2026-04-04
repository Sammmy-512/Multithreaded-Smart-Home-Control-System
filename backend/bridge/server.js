// bridge-server/server.js
const express = require('express');
const net = require('net');
const cors = require('cors');

const app = express();
const PORT = 5000;

// C++ Server Configuration (matches your main_server.cpp)
const CPP_SERVER_HOST = '127.0.0.1';
const CPP_SERVER_PORT = 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Enhanced logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

/**
 * TCP Bridge Client - Communicates with your C++ server
 */
class TCPBridge {
  constructor(host, port) {
    this.host = host;
    this.port = port;
  }

  /**
   * Send command to C++ server and receive response
   * Your C++ server expects: GET /device/action
   * Your C++ server responds: OK: device -> action\n OR ERROR: ...
   */
  async sendCommand(command) {
    return new Promise((resolve, reject) => {
      const client = new net.Socket();
      let responseData = '';

      const timeout = setTimeout(() => {
        client.destroy();
        reject(new Error('Request timeout - C++ server not responding'));
      }, 5000);

      client.connect(this.port, this.host, () => {
        console.log(`✓ Connected to C++ server`);
        console.log(`→ Sending: ${command}`);
        // Your C++ server doesn't require \n, but it's safe to include
        client.write(command + '\n');
      });

      client.on('data', (data) => {
        responseData += data.toString();
        
        // Your C++ server sends response with \n at the end
        if (responseData.includes('\n')) {
          clearTimeout(timeout);
          client.destroy(); // Close connection after receiving response
        }
      });

      client.on('close', () => {
        const response = responseData.trim();
        console.log(`← Received: ${response}`);
        
        if (response.startsWith('OK:')) {
          resolve({
            success: true,
            message: response.substring(4).trim(), // Remove "OK: " prefix
            raw: response
          });
        } else if (response.startsWith('ERROR:')) {
          resolve({
            success: false,
            error: response.substring(7).trim(), // Remove "ERROR: " prefix
            raw: response
          });
        } else {
          resolve({
            success: true,
            message: response,
            raw: response
          });
        }
      });

      client.on('error', (err) => {
        clearTimeout(timeout);
        console.error('✗ TCP Error:', err.message);
        
        if (err.code === 'ECONNREFUSED') {
          reject(new Error('C++ server is not running. Please start ./server_app first.'));
        } else {
          reject(err);
        }
      });
    });
  }

  /**
   * Check if C++ server is reachable
   */
  async ping() {
    return new Promise((resolve) => {
      const client = new net.Socket();
      
      const timeout = setTimeout(() => {
        client.destroy();
        resolve(false);
      }, 2000);

      client.connect(this.port, this.host, () => {
        clearTimeout(timeout);
        client.destroy();
        resolve(true);
      });

      client.on('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });
    });
  }
}

const tcpBridge = new TCPBridge(CPP_SERVER_HOST, CPP_SERVER_PORT);

// ============================================
// REST API ROUTES
// ============================================

/**
 * Health check - verifies bridge server AND C++ backend
 */
app.get('/api/health', async (req, res) => {
  const cppServerOnline = await tcpBridge.ping();
  
  res.json({
    bridge: 'online',
    cppServer: cppServerOnline ? 'online' : 'offline',
    timestamp: new Date().toISOString()
  });
});

/**
 * Get all devices status
 */
app.get('/api/devices', async (req, res) => {
  try {
    const response = await tcpBridge.sendCommand('GET /devices/status');
    res.json(response);
  } catch (error) {
    res.status(503).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Control light - GET /light/on or GET /light/off
 */
app.post('/api/devices/light/:action', async (req, res) => {
  try {
    const { action } = req.params;
    
    if (!['on', 'off'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action. Use "on" or "off"'
      });
    }

    const command = `GET /light/${action}`;
    const response = await tcpBridge.sendCommand(command);
    
    res.json({
      device: 'light',
      action,
      ...response
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get light status
 */
app.get('/api/devices/light', async (req, res) => {
  try {
    const response = await tcpBridge.sendCommand('GET /light/status');
    res.json(response);
  } catch (error) {
    res.status(503).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Set thermostat temperature - GET /thermostat/set/22
 */
app.post('/api/devices/thermostat/set', async (req, res) => {
  try {
    const { temperature } = req.body;
    
    if (!temperature || typeof temperature !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Temperature (number) is required'
      });
    }

    if (temperature < 15 || temperature > 30) {
      return res.status(400).json({
        success: false,
        error: 'Temperature must be between 15°C and 30°C'
      });
    }

    const command = `GET /thermostat/set/${temperature}`;
    const response = await tcpBridge.sendCommand(command);
    
    res.json({
      device: 'thermostat',
      temperature,
      ...response
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get thermostat status
 */
app.get('/api/devices/thermostat', async (req, res) => {
  try {
    const response = await tcpBridge.sendCommand('GET /thermostat/status');
    res.json(response);
  } catch (error) {
    res.status(503).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Control security system
 */
app.post('/api/devices/security/:action', async (req, res) => {
  try {
    const { action } = req.params;
    
    if (!['arm', 'disarm', 'status'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action. Use "arm", "disarm", or "status"'
      });
    }

    const command = `GET /security/${action}`;
    const response = await tcpBridge.sendCommand(command);
    
    res.json({
      device: 'security',
      action,
      ...response
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Generic command endpoint - send any command to C++ server
 */
app.post('/api/command', async (req, res) => {
  try {
    const { command } = req.body;
    
    if (!command || typeof command !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Command (string) is required'
      });
    }

    const response = await tcpBridge.sendCommand(command);
    res.json(response);
  } catch (error) {
    res.status(503).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Error handling middleware
 */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log(`Bridge server running on http://localhost:${PORT}`);
  });
  
  (async () => {
    try {
      const isOnline = await tcpBridge.ping();
      if (isOnline) console.log('✅ C++ server is reachable');
      else console.log('⚠️  C++ server NOT reachable');
    } catch (err) {
      console.error('⚠️  Error checking C++ server:', err.message);
    }
  })();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down bridge server...');
  process.exit(0);
});