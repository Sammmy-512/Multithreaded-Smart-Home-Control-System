// Server.h
#ifndef SENECA_SERVER_H
#define SENECA_SERVER_H

#include <iostream>
#include <string>
#include <stdexcept>
#include <thread>
#include <vector>
#include <mutex>
#include "../devices/DeviceManager.h"
#include "../utilities/SocketUtils.h"

namespace seneca {

    class ClientHandler {
        socket_t client_socket;
        int client_id;
        std::vector<socket_t>& clients;
        std::mutex& clients_mutex;
        DeviceManager& deviceManager;
    public:
        ClientHandler(socket_t socket, int id, std::vector<socket_t>& clients,
            std::mutex& clients_mutex, DeviceManager& deviceManager);
        void run();
        void disconnect();
        
    };

    class TCPServer {
        SOCKET server_socket;
        std::vector<socket_t> clients;
        std::mutex clients_mutex;
        DeviceManager deviceManager;
    public:
        TCPServer();
        ~TCPServer();
        void start(int port);
        void accept_clients();
    };

} // namespace seneca
#endif