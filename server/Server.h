// Server.h
#ifndef SENECA_SERVER_H
#define SENECA_SERVER_H

#include <iostream>
#include <string>
#include <stdexcept>
#include "../utilities/SocketUtils.h"

namespace seneca {

    class TCPServer {
        SOCKET server_socket;
    public:
        TCPServer();
        ~TCPServer();
        void start(int port);
    };

} // namespace seneca
#endif