const express = require('express');
const net = require('net');
const cors = require('cors');

const app = express();
const PORT = 5001;

// C++ Server Configuration
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
 * TCP Bridge Client - Communicates with the C++ server
 */
class TCPBridge {
  constructor(host, port) {
    this.host = host;
    this.port = port;
  }

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
        client.write(command + '\n');
      });

      client.on('data', (data) => {
        responseData += data.toString();
        if (responseData.includes('\n')) {
          clearTimeout(timeout);
          client.destroy();
        }
      });

      client.on('close', () => {
        const response = responseData.trim();
        console.log(`← Received: ${response}`);

        if (response.startsWith('OK:')) {
          resolve({ success: true, message: response.substring(3).trim(), raw: response });
        } else if (response.startsWith('ERROR:')) {
          resolve({ success: false, error: response.substring(6).trim(), raw: response });
        } else {
          resolve({ success: true, message: response, raw: response });
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

// --- REST API ROUTES ---

// Health check
app.get('/api/health', async (req, res) => {
  const cppServerOnline = await tcpBridge.ping();
  res.json({
    bridge: 'online',
    cppServer: cppServerOnline ? 'online' : 'offline',
    timestamp: new Date().toISOString()
  });
});

// Get overall status of all devices
app.get('/api/devices', async (req, res) => {
  try {
    const response = await tcpBridge.sendCommand('GET /devices/status');
    res.json(response);
  } catch (error) {
    res.status(503).json({ success: false, error: error.message });
  }
});

// Generic Device Status (supports room)
app.get('/api/devices/:device', async (req, res) => {
  try {
    const { device } = req.params;
    const { room } = req.query; // room-specific
    let command = `GET /${device}/status`;
    if (room) command += `?room=${room}`;
    const response = await tcpBridge.sendCommand(command);
    res.json(response);
  } catch (error) {
    res.status(503).json({ success: false, error: error.message });
  }
});

// Generic Device Control (supports room & value)
app.post('/api/devices/:device/:action', async (req, res) => {
  try {
    const { device, action } = req.params;
    const { value, room } = req.body; // value for thermostat/fridge, room optional

    let command = `GET /${device}/${action}`;
    if (value !== undefined) command += `/${value}`;
    if (room) command += `?room=${room}`;

    const response = await tcpBridge.sendCommand(command);

    res.json({
      device,
      action,
      sentValue: value || null,
      room: room || null,
      ...response
    });
  } catch (error) {
    res.status(503).json({ success: false, error: error.message });
  }
});

// Custom raw command
app.post('/api/command', async (req, res) => {
  try {
    const { command } = req.body;
    if (!command) return res.status(400).json({ error: 'Command required' });
    const response = await tcpBridge.sendCommand(command);
    res.json(response);
  } catch (error) {
    res.status(503).json({ success: false, error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start server
const server = app.listen(PORT, async () => {
  console.log(`
Smart Home Bridge Server:
  Bridge Server:    http://localhost:${PORT} 
  C++ Backend:      ${CPP_SERVER_HOST}:${CPP_SERVER_PORT} 
  `);

  const isOnline = await tcpBridge.ping();
  if (isOnline) {
    console.log('C++ server is reachable');
  } else {
    console.log('WARNING: C++ server is NOT reachable. Start ./server_app');
  }
});

// Graceful shutdown
const shutdown = () => {
  console.log('\nShutting down bridge server...');
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));
process.on('unhandledRejection', (reason) => console.error('Unhandled Rejection:', reason));