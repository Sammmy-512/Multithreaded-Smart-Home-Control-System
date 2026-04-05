#ifndef SENECA_DEVICE_H
#define SENECA_DEVICE_H

#include <string>
#include <thread>
#include <mutex>
#include <atomic>
#include <chrono>

namespace seneca {

    class Device {
    protected:
        std::string m_name;
        bool m_powerOn{};
        mutable std::mutex m_mutex;

        std::thread m_worker;
        std::atomic<bool> m_stop{ false };

        void startWorker() {
            m_worker = std::thread([this]() {
                while (!m_stop) {
                    {
                        std::lock_guard<std::mutex> lock(m_mutex);
                        tick();
                    }
                    std::this_thread::sleep_for(std::chrono::milliseconds(1000));
                }
                });
        }

        virtual void tick() = 0;

    public:
        Device(const std::string& name) : m_name(name), m_powerOn(false) {}
        virtual ~Device() {
            m_stop = true;
            if (m_worker.joinable()) {
                m_worker.join();
            }
        }

        virtual std::string handleAction(const std::string& action) = 0;
        virtual std::string getStatus() const = 0;

        std::string name() const {
            return m_name;
        }
    };

}

#endif