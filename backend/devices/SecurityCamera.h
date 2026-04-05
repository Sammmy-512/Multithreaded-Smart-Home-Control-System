#ifndef SENECA_SECURITYCAMERA_H
#define SENECA_SECURITYCAMERA_H

#include "Device.h"
#include <sstream>

namespace seneca {

    class SecurityCamera : public Device {
        bool m_recording{ false };
        bool m_motionDetection{ true };
        int m_framesCaptured{ 0 };

    protected:
        void tick() override {
            if (m_powerOn && m_recording) {
                ++m_framesCaptured;
            }
        }

    public:
        SecurityCamera(const std::string& name) : Device(name) {
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
                m_recording = false;
                return "200 OK: " + m_name + " turned OFF";
            }
            if (action == "status") {
                std::ostringstream out;
                out << "200 OK: " << m_name
                    << " [type=camera, power=" << (m_powerOn ? "ON" : "OFF")
                    << ", recording=" << (m_recording ? "ON" : "OFF")
                    << ", motion=" << (m_motionDetection ? "ON" : "OFF")
                    << ", framesCaptured=" << m_framesCaptured << "]";
                return out.str();
            }
            if (action == "record:on") {
                if (!m_powerOn) return "400 ERROR: camera must be ON before recording";
                m_recording = true;
                return "200 OK: " + m_name + " recording started";
            }
            if (action == "record:off") {
                m_recording = false;
                return "200 OK: " + m_name + " recording stopped";
            }
            if (action == "motion:on") {
                m_motionDetection = true;
                return "200 OK: " + m_name + " motion detection enabled";
            }
            if (action == "motion:off") {
                m_motionDetection = false;
                return "200 OK: " + m_name + " motion detection disabled";
            }

            return "400 ERROR: invalid action for camera";
        }

        std::string getStatus() const override {
            std::lock_guard<std::mutex> lock(m_mutex);
            std::ostringstream out;
            out << "200 OK: " << m_name
                << " [type=camera, power=" << (m_powerOn ? "ON" : "OFF")
                << ", recording=" << (m_recording ? "ON" : "OFF")
                << ", motion=" << (m_motionDetection ? "ON" : "OFF")
                << ", framesCaptured=" << m_framesCaptured << "]";
            return out.str();
        }
    };

}

#endif