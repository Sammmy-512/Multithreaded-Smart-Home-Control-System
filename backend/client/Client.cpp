#include "Client.h"

namespace seneca {

    TCPClient::TCPClient() {
        client_socket = INVALID_SOC;
    }

    TCPClient::~TCPClient() {
        if (client_socket != INVALID_SOC) {
            close_socket(client_socket);
        }
    }

    bool TCPClient::connectToServer(const std::string& ip, int port) {
        client_socket = socket(AF_INET, SOCK_STREAM, 0);
        if (client_socket == INVALID_SOC) {
            report_error("Failed to create socket");
            return false;
        }

        sockaddr_in addr{};
        addr.sin_family = AF_INET;
        addr.sin_port = htons(port);
        inet_pton(AF_INET, ip.c_str(), &addr.sin_addr);

        if (connect(client_socket, (sockaddr*)&addr, sizeof(addr)) < 0) {
            report_error("Failed to connect");
            close_socket(client_socket);
            client_socket = INVALID_SOC;
            return false;
        }

        std::cout << "Connected to Smart Home Server at " << ip << ":" << port << std::endl;
        return true;
    }

    void TCPClient::run() {
        std::string input;
        char buffer[1024];

        std::cout << "--- Smart Home Control Panel ---" << std::endl;
        std::cout << "Format: GET /<device>/<action>" << std::endl;
        std::cout << "Examples: GET /light/on, GET /thermostat/set/22" << std::endl;
        std::cout << "Type 'quit' or 'exit' to disconnect." << std::endl;
        std::cout << "--------------------------------\n" << std::endl;

        while (true) {
            std::cout << "> ";
            std::getline(std::cin, input);

            if (input.empty()) continue;
            
            if (input == "quit" || input == "exit") {
                std::cout << "Disconnecting from server..." << std::endl;
                break;
            }

            if (send(client_socket, input.c_str(), input.length(), 0) < 0) {
                report_error("Failed to send command to server");
                break;
            }

            int bytes_received = recv(client_socket, buffer, sizeof(buffer) - 1, 0);
            if (bytes_received > 0) {
                buffer[bytes_received] = '\0';
                std::cout << "Server: " << buffer; 
            } else if (bytes_received == 0) {
                std::cout << "Server dropped the connection." << std::endl;
                break;
            } else {
                report_error("Failed to receive data from server");
                break;
            }
        }
    }
}