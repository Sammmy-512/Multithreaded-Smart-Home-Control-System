#ifndef SENECA_LIGHT_H
#define SENECA_LIGHT_H

#include "Device.h"
#include <sstream>

namespace seneca {

    class Light : public Device {
        int m_brightness{ 50 };

    protected:
        void tick() override {
            // simple simulation thread for the light
            // you can add blinking, timers, or auto-dim later if you want
        }

    public:
        Light(const std::string& name) : Device(name) {
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
                    << " [type=light, power=" << (m_powerOn ? "ON" : "OFF")
                    << ", brightness=" << m_brightness << "]";
                return out.str();
            }

            if (action.rfind("brightness:", 0) == 0) {
                std::string valueStr = action.substr(11);
                int value = std::stoi(valueStr);

                if (value < 0 || value > 100) {
                    return "400 ERROR: brightness must be between 0 and 100";
                }

                m_brightness = value;
                return "200 OK: " + m_name + " brightness set to " + std::to_string(m_brightness);
            }

            return "400 ERROR: invalid action for light";
        }

        std::string getStatus() const override {
            std::lock_guard<std::mutex> lock(m_mutex);
            std::ostringstream out;
            out << "200 OK: " << m_name
                << " [type=light, power=" << (m_powerOn ? "ON" : "OFF")
                << ", brightness=" << m_brightness << "]";
            return out.str();
        }
    };

}

#endif