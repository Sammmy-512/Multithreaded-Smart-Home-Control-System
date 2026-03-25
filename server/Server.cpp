// Server.cpp
#include "Server.h"
#include <algorithm>

namespace seneca {

    // store the socket, id, and a reference to the client list
    ClientHandler::ClientHandler(socket_t socket, int id, std::vector<socket_t>& clients)
        : client_socket(socket), client_id(id), clients(clients) {}

    // helper to parse commands like "GET /light/on" into device and action
    // so "GET /light/on" gives us device="light" and action="on"
    // and "GET /thermostat/set/22" gives device="thermostat" and action="set/22"
    static bool parseCommand(const std::string& raw, std::string& device, std::string& action) {
        // make sure it starts with GET
        if (raw.substr(0, 4) != "GET ")
            return false;

        std::string path = raw.substr(4); // grab everything after "GET "
        if (path.empty() || path[0] != '/')
            return false;

        path = path.substr(1); // remove the leading slash
        size_t slash = path.find('/');
        if (slash == std::string::npos)
            return false;

        device = path.substr(0, slash);
        action = path.substr(slash + 1);
        return true;
    }

    // keeps listening for data from the client until they disconnect
    void ClientHandler::run() {
        char buffer[1024];
        std::cout << "Client " << client_id << " connected" << std::endl;
        while (true) {
            int bytes = recv(client_socket, buffer, sizeof(buffer) - 1, 0);
            if (bytes <= 0) {
                // 0 means they disconnected cleanly, negative means something went wrong
                if (bytes < 0)
                    report_error("recv failed for client " + std::to_string(client_id));
                break;
            }
            buffer[bytes] = '\0';
            std::string raw(buffer);

            std::string device, action;
            if (parseCommand(raw, device, action)) {
                std::cout << "Client " << client_id << " -> device: " << device << ", action: " << action << std::endl;
                // todo: hook into sam's device manager here
                // something like: deviceManager.handleCommand(device, action);
                std::string response = "OK: " + device + " -> " + action + "\n";
                send(client_socket, response.c_str(), response.size(), 0);
            } else {
                std::string response = "ERROR: invalid command format. Use GET /device/action\n";
                send(client_socket, response.c_str(), response.size(), 0);
            }
        }
        disconnect();
    }

    // remove this client from the list and close the connection
    void ClientHandler::disconnect() {
        clients.erase(std::remove(clients.begin(), clients.end(), client_socket), clients.end());
        close_socket(client_socket);
        std::cout << "Client " << client_id << " disconnected. Active clients: " << clients.size() << std::endl;
    }

    // set the socket to invalid so we know its not open yet
    TCPServer::TCPServer() {
        server_socket = INVALID_SOC;
    }

    // close the socket on the way out if it was opened
    TCPServer::~TCPServer() {
        if (server_socket != INVALID_SOC)
            close_socket(server_socket);
    }

    // create the socket, bind it to the port, and start listening
    void TCPServer::start(int port) {
        server_socket = socket(AF_INET, SOCK_STREAM, 0);
        if (server_socket == INVALID_SOC)
            throw std::runtime_error("Failed to create socket");

        sockaddr_in addr{};
        addr.sin_family      = AF_INET;
        addr.sin_port        = htons(port);
        addr.sin_addr.s_addr = INADDR_ANY;

        if (bind(server_socket, (sockaddr*)&addr, sizeof(addr)) < 0)
            throw std::runtime_error("Failed to bind");

        if (listen(server_socket, SOMAXCONN) < 0)
            throw std::runtime_error("Failed to listen");

        std::cout << "Server started on port " << port << std::endl;
    }

    // wait for clients to connect and spin up a new thread for each one
    void TCPServer::accept_clients() {
        std::cout << "Waiting for clients..." << std::endl;
        int client_id = 0;
        while (true) {
            // will add client address info later, using placeholders for now
            socket_t client = accept(server_socket, nullptr, nullptr);
            if (client == INVALID_SOC) {
                report_error("Failed to accept client");
                continue;
            }
            client_id++;
            clients.push_back(client);
            std::cout << "Client " << client_id << " connected. Active clients: " << clients.size() << std::endl;
            std::thread([client, client_id, &clients = clients]() {
                ClientHandler handler(client, client_id, clients);
                handler.run();
            }).detach();
        }
    }


} // namespace seneca
