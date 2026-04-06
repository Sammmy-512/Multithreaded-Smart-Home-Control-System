// ArpTable.h
// simulates a static ARP table for the smart home network
// maps IP addresses to MAC addresses for each device subnet
#ifndef SENECA_ARP_TABLE_H
#define SENECA_ARP_TABLE_H

#include <string>
#include <vector>
#include <sstream>
#include <iomanip>

namespace seneca {

    struct ArpEntry {
        std::string ip;
        std::string mac;
        std::string interface;
        std::string status;
    };

    class ArpTable {
        std::vector<ArpEntry> m_entries;
    public:
        inline ArpTable() {
            // static ARP entries for devices on each subnet
            m_entries.push_back({"192.168.1.10", "AA:BB:CC:DD:EE:01", "eth0", "Resolved"});
            m_entries.push_back({"192.168.2.5",  "AA:BB:CC:DD:EE:02", "eth1", "Resolved"});
            m_entries.push_back({"192.168.3.8",  "AA:BB:CC:DD:EE:03", "eth1", "Resolved"});
        }

        // returns the ARP table as a formatted string
        inline std::string getTable() const {
            std::ostringstream out;
            out << "ARP table:\n";
            out << std::left
                << std::setw(17) << "IP Address"
                << std::setw(21) << "MAC Address"
                << std::setw(12) << "Interface"
                << "Status\n";
            for (const auto& e : m_entries) {
                out << std::left
                    << std::setw(17) << e.ip
                    << std::setw(21) << e.mac
                    << std::setw(12) << e.interface
                    << e.status << "\n";
            }
            return out.str();
        }
    };

} // namespace seneca
#endif
