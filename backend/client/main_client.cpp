#include <iostream>
#include "../utilities/SocketSystem.h"
#include "Client.h"

using namespace seneca;

int main() {
    SocketSystem ss; 
    TCPClient client;

    if (client.connectToServer("127.0.0.1", 8080)) {
        client.run();
    } else {
        std::cout << "Client failed to connect. Please ensure the central server is running first." << std::endl;
    }
    return 0;
}