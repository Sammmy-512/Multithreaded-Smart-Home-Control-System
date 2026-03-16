// Server.cpp
#include "Server.h"

namespace seneca {
    // constructor to initialize server socket to invalid state
    TCPServer::TCPServer() {
        server_socket = INVALID_SOC;
    }
    // destructor that closes the socket if not in an invalid state
    TCPServer::~TCPServer() {
        if (server_socket != INVALID_SOC)
            close_socket(server_socket);
    }
    // start function to create a socket, bind to port then listen for connections
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
    // accept incoming client connects and spawn a new thread for each one
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
            std::cout << "Client connected!" << std::endl;
            // spawn detached thread for client using a lambda to capture client socket and id
            // will replace lambda with a dedicated client handler function later
            std::thread([client, client_id]() {
                std::cout << "Client " << client_id << " handler started" << std::endl;
                close_socket(client);
            }).detach();
        }
    }

} // namespace seneca