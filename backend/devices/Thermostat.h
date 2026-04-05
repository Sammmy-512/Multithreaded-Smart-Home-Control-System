#ifndef SENECA_THERMOSTAT_H
#define SENECA_THERMOSTAT_H

#include "Device.h"
#include <sstream>

namespace seneca {

    class Thermostat : public Device {
        int m_currentTemp{ 20 };
        int m_targetTemp{ 22 };

    protected:
        void tick() override {
            if (!m_powerOn) return;

            if (m_currentTemp < m_targetTemp) {
                ++m_currentTemp;
            }
            else if (m_currentTemp > m_targetTemp) {
                --m_currentTemp;
            }
        }

    public:
        Thermostat(const std::string& name) : Device(name) {
            startWorker();
        }

        std::string handleAction(const std::string& action) override {
            std::lock_guard<std::mutex> lock(m_mutex);

            if (action == "on") {
                m_powerOn = true;
                return "200 OK: " + m_name + " turned ON";
            }
            if (action == "off") {
                m_powerOn = false;
                return "200 OK: " + m_name + " turned OFF";
            }
            if (action == "status") {
                std::ostringstream out;
                out << "200 OK: " << m_name
                    << " [type=thermostat, power=" << (m_powerOn ? "ON" : "OFF")
                    << ", current=" << m_currentTemp
                    << ", target=" << m_targetTemp << "]";
                return out.str();
            }

            if (action.rfind("set:", 0) == 0) {
                std::string valueStr = action.substr(4);
                int value = std::stoi(valueStr);

                if (value < 10 || value > 35) {
                    return "400 ERROR: temperature must be between 10 and 35";
                }

                m_targetTemp = value;
                return "200 OK: " + m_name + " target temperature set to " + std::to_string(m_targetTemp);
            }

            return "400 ERROR: invalid action for thermostat";
        }

        std::string getStatus() const override {
            std::lock_guard<std::mutex> lock(m_mutex);
            std::ostringstream out;
            out << "200 OK: " << m_name
                << " [type=thermostat, power=" << (m_powerOn ? "ON" : "OFF")
                << ", current=" << m_currentTemp
                << ", target=" << m_targetTemp << "]";
            return out.str();
        }
    };

}

#endif