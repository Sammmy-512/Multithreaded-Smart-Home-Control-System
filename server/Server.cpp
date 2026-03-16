// Server.cpp
#include "Server.h"

namespace seneca {

    TCPServer::TCPServer() {
        server_socket = INVALID_SOC;
    }

    TCPServer::~TCPServer() {
        if (server_socket != INVALID_SOC)
            close_socket(server_socket);
    }

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

    void TCPServer::accept_clients() {
        std::cout << "Waiting for clients..." << std::endl;
        while (true) {
            socket_t client = accept(server_socket, nullptr, nullptr);
            if (client == INVALID_SOC) {
                report_error("Failed to accept client");
                continue;
            }
            std::cout << "Client connected!" << std::endl;
            std::thread([client]() {
                std::cout << "Client handler started" << std::endl;
                close_socket(client);
            }).detach();
        }
    }

} // namespace seneca