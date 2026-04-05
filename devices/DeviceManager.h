#ifndef SENECA_DEVICEMANAGER_H
#define SENECA_DEVICEMANAGER_H

#include <unordered_map>
#include <memory>
#include <string>
#include <mutex>

#include "Light.h"
#include "Thermostat.h"
#include "SecurityCamera.h"

namespace seneca {

    class DeviceManager {
        std::unordered_map<std::string, std::unique_ptr<Device>> m_devices;
        std::mutex m_managerMutex;

    public:
        DeviceManager();

        std::string handleCommand(const std::string& device, const std::string& action);
        std::string getAllStatuses();
    };

}

#endif