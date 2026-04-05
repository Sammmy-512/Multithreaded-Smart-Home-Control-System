/**
 * BTN415 — educational demo for rubric items:
 *  - subnet membership (local vs remote)
 *  - routing / next-hop selection (default gateway)
 *  - ARP resolves IP -> MAC for the *next hop* (local host or gateway)
 *
 * Build: g++ -std=c++17 -o network_routing_demo network_routing_demo.cpp
 *
 * Your TCP server/client uses the real OS stack; this file shows the same
 * decisions the kernel makes before Ethernet frames are sent.
 */
#include <cstdint>
#include <iostream>
#include <stdexcept>
#include <sstream>
#include <string>
#include <unordered_map>
#include <vector>

namespace {

uint32_t parseIPv4(const std::string& s) {
    unsigned a{}, b{}, c{}, d{};
    char dot1{}, dot2{}, dot3{};
    std::istringstream in(s);
    in >> a >> dot1 >> b >> dot2 >> c >> dot3 >> d;
    if (!in || dot1 != '.' || dot2 != '.' || dot3 != '.')
        throw std::runtime_error("bad IPv4: " + s);
    return static_cast<uint32_t>(a << 24 | b << 16 | c << 8 | d);
}

std::string ipv4ToString(uint32_t ip) {
    std::ostringstream o;
    o << ((ip >> 24) & 0xFF) << '.' << ((ip >> 16) & 0xFF) << '.' << ((ip >> 8) & 0xFF) << '.'
      << (ip & 0xFF);
    return o.str();
}

bool onSameSubnet(uint32_t host, uint32_t dest, uint32_t mask) {
    return (host & mask) == (dest & mask);
}

struct Route {
    uint32_t network;
    uint32_t mask;
    uint32_t next_hop; // 0 = on-link (use dest as next hop IP for ARP)
};

int prefixLength(uint32_t mask) {
    int n = 0;
    while (mask) {
        n += static_cast<int>(mask & 1);
        mask >>= 1;
    }
    return n;
}

// Longest-prefix match; 0.0.0.0/0 matches everything (default route).
uint32_t nextHopForRemote(uint32_t dest, const std::vector<Route>& routes) {
    int best_len = -1;
    uint32_t chosen = 0;
    for (const Route& r : routes) {
        if ((dest & r.mask) != (r.network & r.mask))
            continue;
        int len = prefixLength(r.mask);
        if (len > best_len) {
            best_len = len;
            chosen = r.next_hop;
        }
    }
    return chosen;
}

class ArpTable {
    std::unordered_map<uint32_t, std::string> ip_to_mac_;

public:
    void learn(uint32_t ip, std::string mac) { ip_to_mac_[ip] = std::move(mac); }

    bool resolve(uint32_t ip, std::string& mac) const {
        auto it = ip_to_mac_.find(ip);
        if (it == ip_to_mac_.end())
            return false;
        mac = it->second;
        return true;
    }

    void print(std::ostream& os) const {
        os << "ARP table:\n";
        for (const auto& [ip, mac] : ip_to_mac_)
            os << "  " << ipv4ToString(ip) << " -> " << mac << '\n';
    }
};

void demoPacket(uint32_t src_ip,
                uint32_t mask,
                uint32_t default_gw,
                uint32_t dest_ip,
                const std::vector<Route>& extra_routes,
                ArpTable& arp,
                const char* label) {
    std::cout << "\n=== " << label << " ===\n";
    std::cout << "From " << ipv4ToString(src_ip) << " to " << ipv4ToString(dest_ip) << '\n';

    bool local = onSameSubnet(src_ip, dest_ip, mask);
    uint32_t next_hop_ip;
    if (local) {
        // On-link: Ethernet goes to destination; ARP for dest IP.
        next_hop_ip = dest_ip;
    } else {
        std::vector<Route> routes = extra_routes;
        routes.push_back({0, 0, default_gw});
        next_hop_ip = nextHopForRemote(dest_ip, routes);
        if (next_hop_ip == 0)
            next_hop_ip = default_gw;
    }

    std::cout << "Same subnet as dest: " << (local ? "yes" : "no") << '\n';
    std::cout << "Next-hop IP (for ARP): " << ipv4ToString(next_hop_ip) << '\n';

    std::string mac;
    if (arp.resolve(next_hop_ip, mac))
        std::cout << "ARP: " << ipv4ToString(next_hop_ip) << " -> " << mac << '\n';
    else
        std::cout << "ARP: need to resolve " << ipv4ToString(next_hop_ip) << " (no entry yet)\n";
}

void demoIcmpEcho(uint32_t src_ip,
                  uint32_t mask,
                  uint32_t default_gw,
                  uint32_t dest_ip,
                  ArpTable& arp) {
    std::cout << "\n=== ICMP echo (conceptual) ===\n";
    std::cout << "Ping " << ipv4ToString(dest_ip) << " from " << ipv4ToString(src_ip) << '\n';
    uint32_t nh = onSameSubnet(src_ip, dest_ip, mask) ? dest_ip : default_gw;
    std::string mac;
    if (arp.resolve(nh, mac))
        std::cout << "Encapsulate ICMP in IP, Ethernet dest MAC " << mac << " (next hop "
                  << ipv4ToString(nh) << ")\n";
    else
        std::cout << "Would ARP for " << ipv4ToString(nh) << " first, then send ICMP\n";
    std::cout << "(Real ping uses raw ICMP + OS routing; logic above is the same path.)\n";
}

} // namespace

int main() {
    try {
        // Host: 192.168.1.10/24, gateway 192.168.1.1
        const uint32_t host = parseIPv4("192.168.1.10");
        const uint32_t mask = parseIPv4("255.255.255.0");
        const uint32_t gw = parseIPv4("192.168.1.1");

        ArpTable arp;
        arp.learn(parseIPv4("192.168.1.50"), "aa:bb:cc:dd:ee:01"); // another PC on LAN
        arp.learn(gw, "aa:bb:cc:dd:ee:f1");                      // router MAC on this LAN

        arp.print(std::cout);

        // Local: ARP should target the destination host itself.
        demoPacket(host, mask, gw, parseIPv4("192.168.1.50"), {}, arp, "Local TCP/UDP (same subnet)");

        // Remote: ARP targets default gateway; IP header still has final dest.
        demoPacket(host, mask, gw, parseIPv4("10.0.5.20"), {}, arp, "Remote (other subnet via default GW)");

        // Optional: more specific route than default (advanced routing).
        const uint32_t p16 = parseIPv4("255.255.0.0");
        std::vector<Route> extra = {
            {parseIPv4("10.0.0.0") & p16, p16, parseIPv4("192.168.1.2")},
        };
        arp.learn(parseIPv4("192.168.1.2"), "aa:bb:cc:dd:ee:02");
        demoPacket(host, mask, gw, parseIPv4("10.0.99.1"), extra, arp,
                   "Remote with static route 10.0.0.0/16 via 192.168.1.2");

        demoIcmpEcho(host, mask, gw, parseIPv4("192.168.1.50"), arp);
        demoIcmpEcho(host, mask, gw, parseIPv4("8.8.8.8"), arp);

        std::cout << "\nDone.\n";
    } catch (const std::exception& e) {
        std::cerr << e.what() << '\n';
        return 1;
    }
    return 0;
}
