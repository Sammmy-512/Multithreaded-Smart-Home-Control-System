// main_server.cpp
#include <iostream>
#include "../utilities/SocketSystem.h"
#include "Server.h"

using namespace seneca;

int main() {
    SocketSystem ss;
    try {
        TCPServer server;
        server.start(8080);
        server.accept_clients();
    } catch (std::exception& e) {
        std::cout << e.what() << std::endl;
    }
    return 0;
}