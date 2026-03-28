#ifndef SENECA_CLIENT_H
#define SENECA_CLIENT_H

#include <iostream>
#include <string>
#include "../utilities/SocketUtils.h"

namespace seneca {
    class TCPClient {
        socket_t client_socket;
    public:
        TCPClient();
        ~TCPClient();
        bool connectToServer(const std::string& ip, int port);
        void run();
    };
} 
#endif