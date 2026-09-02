# HomeSync — Multithreaded Smart Home Control System

HomeSync is a collaborative smart-home simulation built with **C++17, TCP/IP socket programming, multithreading, Node.js, Express, React, and Vite**.

The project demonstrates how multiple clients can communicate concurrently with a C++ TCP server while a web dashboard provides a visual interface for monitoring and controlling simulated smart-home devices.

---

## Features

- Multithreaded C++ TCP server
- Concurrent client connections using `std::thread`
- Thread-safe shared state using `std::mutex`
- Custom TCP command protocol
- Object-oriented server and device architecture
- Standalone C++ TCP client
- Node.js / Express REST-to-TCP bridge
- React + Vite smart-home dashboard
- Device status synchronization through frontend polling
- Smart-home device simulation
- Network command parsing and routing
- Cross-platform socket abstractions

---

## Architecture

The application consists of four main components:

```text
┌─────────────────────────────┐
│ React / Vite Web Dashboard  │
│ localhost:5173              │
└─────────────┬───────────────┘
              │ HTTP / REST
              ▼
┌─────────────────────────────┐
│ Node.js / Express Bridge    │
│ localhost:5001              │
└─────────────┬───────────────┘
              │ TCP
              ▼
┌─────────────────────────────┐
│ C++ Multithreaded Server    │
│ 127.0.0.1:8080              │
└─────────────┬───────────────┘
              │ TCP
              ▼
┌─────────────────────────────┐
│ Standalone C++ Clients      │
└─────────────────────────────┘
C++ TCP Server

The central server listens on port 8080 and accepts incoming TCP client connections.

Each connected client is assigned its own handler thread, allowing the server to process multiple client requests concurrently.

Shared resources are protected using C++ mutexes and std::lock_guard.

Example:

Client 1 connected
Client 2 connected
Client 3 connected
Active clients: 3
Command Protocol

Clients communicate with the server using a lightweight HTTP-inspired command format:

GET /<device>/<action>

Examples:

GET /light/on
GET /light/off
GET /light/status
GET /thermostat/set/22

Commands can also contain query parameters:

GET /light/status?room=livingRoom

The C++ command parser extracts the device and action before routing the command to the appropriate device handler.

Standalone C++ Client

The project includes a standalone TCP client that connects directly to the C++ server.

Example:

Connected to Smart Home Server at 127.0.0.1:8080

--- Smart Home Control Panel ---

> GET /light/on
Server: 200 OK: living_room_light turned ON

> GET /light/off
Server: 200 OK: living_room_light turned OFF

This client can be used to test the server independently of the web application.

Node.js Bridge

Web browsers cannot directly communicate with the application's raw TCP socket interface.

To solve this, the project uses a Node.js / Express bridge server.

The bridge:

Receives REST API requests from the React frontend.
Opens a TCP connection to the C++ server.
Converts REST requests into C++ TCP commands.
Receives the C++ server response.
Returns the result to the browser as JSON.

Example:

Browser

GET /api/devices/light
        │
        ▼
Node.js Bridge

GET /light/status
        │
        ▼
C++ TCP Server

The bridge runs on:

http://localhost:5001
React Dashboard

The frontend was built with:

React
Vite
React Router
Tailwind CSS

The dashboard provides controls for simulated smart-home devices across multiple rooms.

Example controls include:

Lights
Thermostats
Security systems
Security cameras
Blinds / curtains
Speakers
Garage doors
Kitchen appliances
Bathroom devices

The frontend periodically retrieves device status through the Node bridge so that changes made through another client can be reflected on the dashboard.

Running the Project
Requirements

Make sure the following are installed:

C++17 compatible compiler (g++)
WSL / Ubuntu or another Linux environment
Node.js
npm
Git
1. Clone the Repository
git clone https://github.com/Sammmy-512/Multithreaded-Smart-Home-Control-System.git

Enter the project:

cd Multithreaded-Smart-Home-Control-System
2. Compile the C++ Server

From the backend directory:

cd backend

Compile:

g++ -std=c++17 \
$(find server devices utilities -name "*.cpp") \
-o server/server_app_linux \
-pthread
3. Start the C++ Server
cd server
./server_app_linux

Expected output:

Server started on port 8080
Waiting for clients...

Keep this terminal running.

4. Start the Node.js Bridge

Open another terminal.

Navigate to:

cd backend/bridge

Install dependencies:

npm install

Start the bridge:

npm run dev

Expected output:

Smart Home Bridge Server:

Bridge Server: http://localhost:5001
C++ Backend:   127.0.0.1:8080

C++ server is reachable
5. Start the React Frontend

Open another terminal.

Navigate to:

cd frontend

Install dependencies:

npm install

Start Vite:

npm run dev

Open:

http://localhost:5173

in your browser.

6. Run the Standalone Client

The standalone client can be used to communicate directly with the C++ server.

From the client directory:

cd client

Run the client executable:

./client_app.exe

Then send commands such as:

GET /light/on
GET /light/off
GET /light/status

Changes made through the standalone client can then be retrieved by the web application through the Node bridge.

Project Structure
Multithreaded-Smart-Home-Control-System/
│
├── backend/
│   ├── bridge/
│   │   └── Node.js / Express TCP bridge
│   │
│   ├── client/
│   │   └── C++ TCP client
│   │
│   ├── devices/
│   │   └── Smart device classes
│   │
│   ├── server/
│   │   ├── Server.cpp
│   │   ├── Server.h
│   │   └── main_server.cpp
│   │
│   ├── tests/
│   │
│   └── utilities/
│       ├── CommandParser.h
│       ├── SocketSystem
│       ├── SocketUtils
│       ├── RoutingTable
│       └── ArpTable
│
├── client/
│   └── Standalone client executable/source
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
Concurrency

The C++ server uses a thread-per-client model.

When a new TCP connection is accepted:

Client connects
      │
      ▼
accept()
      │
      ▼
Create ClientHandler
      │
      ▼
Create std::thread
      │
      ▼
Process client independently

This allows multiple clients and bridge requests to be processed concurrently.

Shared server resources are synchronized using:

std::mutex
std::lock_guard

to prevent race conditions while multiple threads access shared state.

Technologies Used
Backend
C++17
TCP/IP
Socket API
Multithreading
std::thread
std::mutex
Object-Oriented Programming
Bridge
Node.js
Express
Node net TCP sockets
REST APIs
Frontend
React
Vite
JavaScript
React Router
Tailwind CSS
Development
Git
GitHub
WSL / Ubuntu
VS Code
What We Learned

This project provided practical experience with:

TCP client-server architecture
Concurrent network programming
Multithreaded C++ applications
Thread synchronization
Network command parsing
Object-oriented software design
REST API development
Bridging HTTP applications with TCP services
React frontend development
Synchronizing state between multiple clients
Full-stack application integration# BTN415-Project
