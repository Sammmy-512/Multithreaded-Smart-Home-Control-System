#include "DeviceManager.h"
#include <sstream>

namespace seneca {

    DeviceManager::DeviceManager() {
        m_devices["light"] = std::make_unique<Light>("living_room_light");
        m_devices["thermostat"] = std::make_unique<Thermostat>("main_thermostat");
        m_devices["camera"] = std::make_unique<SecurityCamera>("front_door_camera");
    }

    std::string DeviceManager::handleCommand(const std::string& device, const std::string& action) {
        if (device == "all" && action == "status") {
            return getAllStatuses();
        }

        std::lock_guard<std::mutex> lock(m_managerMutex);

        auto it = m_devices.find(device);
        if (it == m_devices.end()) {
            return "404 ERROR: device not found";
        }

        try {
            return it->second->handleAction(action);
        }
        catch (const std::exception&) {
            return "400 ERROR: invalid value in action";
        }
    }

    std::string DeviceManager::getAllStatuses() {
        std::lock_guard<std::mutex> lock(m_managerMutex);

        std::ostringstream out;
        out << "200 OK: all device statuses\n";

        for (auto& [key, device] : m_devices) {
            out << device->getStatus() << "\n";
        }

        return out.str();
    }

}