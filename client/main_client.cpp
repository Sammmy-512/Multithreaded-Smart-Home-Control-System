#include <iostream>
#include "../utilities/SocketUtils.h"

using namespace seneca;

int main() {
    socket_t sock = socket(AF_INET, SOCK_STREAM, 0);
    if (sock == INVALID_SOC) {
        report_error("Failed to create socket");
        return 1;
    }

    sockaddr_in addr{};
    addr.sin_family = AF_INET;
    addr.sin_port   = htons(8080);
    inet_pton(AF_INET, "127.0.0.1", &addr.sin_addr);

    if (connect(sock, (sockaddr*)&addr, sizeof(addr)) < 0) {
        report_error("Failed to connect");
        close_socket(sock);
        return 1;
    }

    std::cout << "Connected" << std::endl;
    std::cin.get();

    close_socket(sock);
    return 0;
}
