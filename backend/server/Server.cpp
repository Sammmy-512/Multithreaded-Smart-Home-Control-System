// Server.cpp
#include "Server.h"
#include <algorithm>
#include "../utilities/CommandParser.h"
#include "../devices/DeviceManager.h"

namespace seneca {

    // set the socket to invalid so we know its not open yet
    TCPServer::TCPServer() {
        server_socket = INVALID_SOC;
    }

    // close the socket on the way out if it was opened
    TCPServer::~TCPServer() {
        if (server_socket != INVALID_SOC)
            close_socket(server_socket);
    }

    // create the socket, bind it to the port, and start listening for incoming connections
    // AF_INET means we're using IPv4, SOCK_STREAM means TCP
    // INADDR_ANY means we accept connections on any network interface
    void TCPServer::start(int port) {
        server_socket = socket(AF_INET, SOCK_STREAM, 0);
        if (server_socket == INVALID_SOC)
            throw std::runtime_error("Failed to create socket");

        sockaddr_in addr{};
        addr.sin_family      = AF_INET;
        addr.sin_port        = htons(port);   // htons converts port to network byte order
        addr.sin_addr.s_addr = INADDR_ANY;    // listen on all available network interfaces

        if (bind(server_socket, (sockaddr*)&addr, sizeof(addr)) < 0)
            throw std::runtime_error("Failed to bind");

        if (listen(server_socket, SOMAXCONN) < 0)
            throw std::runtime_error("Failed to listen");

        std::cout << "Server started on port " << port << std::endl;
    }

    // wait for clients to connect and spin up a new thread for each one
    // detach() lets the thread run independently so the main loop can keep accepting new clients
    void TCPServer::accept_clients() {
        std::cout << "Waiting for clients..." << std::endl;
        int client_id = 0;
        while (true) {
            // accept() blocks until a client connects, then returns their socket
            socket_t client = accept(server_socket, nullptr, nullptr);
            if (client == INVALID_SOC) {
                report_error("Failed to accept client");
                continue;
            }
            client_id++;
            {
                std::lock_guard<std::mutex> lock(clients_mutex);
                clients.push_back(client);
                std::cout << "Client " << client_id << " connected. Active clients: "
                    << clients.size() << std::endl;
            }
            // each client runs in their own thread so multiple clients can be handled at the same time
            std::thread([this, client, client_id]() {
                ClientHandler handler(client, client_id, clients, clients_mutex, deviceManager, routingTable, arpTable);
                handler.run();
                }).detach();
        }
    }

    // store the socket, id, and references to the shared server resources
    // each client gets their own handler when they connect
    ClientHandler::ClientHandler(socket_t socket, int id, std::vector<socket_t>& clients, std::mutex& clients_mutex, DeviceManager& deviceManager, RoutingTable& routingTable, ArpTable& arpTable)
        : client_socket(socket), client_id(id), clients(clients), clients_mutex(clients_mutex), deviceManager(deviceManager), routingTable(routingTable), arpTable(arpTable) {}

    // keeps listening for data from the client until they disconnect
    // recv() blocks until data arrives, so this loop just waits and processes one command at a time
    // when the client disconnects, recv() returns 0 and we break out and call disconnect()
    void ClientHandler::run() {
        char buffer[1024];
        std::cout << "Client " << client_id << " connected" << std::endl;
        while (true) {
            // recv() waits for the client to send something and stores it in buffer
            int bytes = recv(client_socket, buffer, sizeof(buffer) - 1, 0);
            if (bytes <= 0) {
                // 0 means they disconnected cleanly, negative means something went wrong
                if (bytes < 0)
                    report_error("recv failed for client " + std::to_string(client_id));
                break;
            }
            buffer[bytes] = '\0';
            std::string raw(buffer);
            // trim trailing newline/carriage return characters that clients may send
            while (!raw.empty() && (raw.back() == '\n' || raw.back() == '\r'))
                raw.pop_back();

            // try to parse the command, send a response depending on whether it was valid
            std::string device, action;
            if (parseCommand(raw, device, action)) {
                std::cout << "Client " << client_id << " -> device: " << device << ", action: " << action << std::endl;
                std::string response;
                if (device == "network" && action == "routing") {
                    response = routingTable.getTable() + "\n";
                } else if (device == "network" && action == "arp") {
                    response = arpTable.getTable() + "\n";
                } else {
                    response = deviceManager.handleCommand(device, action) + "\n";
                }
                send(client_socket, response.c_str(), response.size(), 0);
            } else {
                std::string response = "ERROR: invalid command format. Use GET /device/action\n";
                send(client_socket, response.c_str(), response.size(), 0);
            }
        }
        disconnect();
    }

    // remove this client from the tracking list and close their socket
    // called automatically when the client disconnects or an error occurs in run()
    void ClientHandler::disconnect() {
        std::lock_guard<std::mutex> lock(clients_mutex);
        clients.erase(std::remove(clients.begin(), clients.end(), client_socket), clients.end());
        close_socket(client_socket);
        std::cout << "Client " << client_id << " disconnected. Active clients: " << clients.size() << std::endl;
    }

} // namespace seneca
