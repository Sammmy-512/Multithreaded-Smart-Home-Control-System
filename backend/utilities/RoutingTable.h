// RoutingTable.h
// simulates a static routing table for the smart home network
// stores routes for each device subnet and formats them for display
#ifndef SENECA_ROUTING_TABLE_H
#define SENECA_ROUTING_TABLE_H

#include <string>
#include <vector>
#include <sstream>
#include <iomanip>

namespace seneca {

    struct RouteEntry {
        std::string network;
        std::string nextHop;
        std::string interface;
        int cost;
    };

    class RoutingTable {
        std::vector<RouteEntry> m_routes;
    public:
        inline RoutingTable() {
            // static routes for each device subnet
            m_routes.push_back({"192.168.1.0", "0.0.0.0",     "eth0", 1});
            m_routes.push_back({"192.168.2.0", "192.168.1.1", "eth1", 2});
            m_routes.push_back({"192.168.3.0", "192.168.1.1", "eth1", 3});
        }

        // returns the routing table as a formatted string
        inline std::string getTable() const {
            std::ostringstream out;
            out << "Routing table:\n";
            out << std::left
                << std::setw(16) << "Network"
                << std::setw(16) << "NextHop"
                << std::setw(13) << "Interface"
                << "Cost\n";
            for (const auto& r : m_routes) {
                out << std::left
                    << std::setw(16) << r.network
                    << std::setw(16) << r.nextHop
                    << std::setw(13) << r.interface
                    << r.cost << "\n";
            }
            return out.str();
        }
    };

} // namespace seneca
#endif
