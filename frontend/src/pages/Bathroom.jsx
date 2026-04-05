// src/pages/Bathroom.jsx
import React, { useState, useEffect } from "react";
import ThermostatControl from "../components/ThermostatControl";
import ShowerControl from "../components/ShowerControl";
import MirrorControl from "../components/MirrorControl";
import ExhaustFanControl from "../components/ExhaustFanControl";
import LightControl from "../components/LightControl";
import SecurityControl from "../components/SecurityControl";
import Navbar from "../components/Navbar";

const Bathroom = () => {
  const [serverStatus, setServerStatus] = useState({ bridge: "checking", cppServer: "checking" });
  const [showCommandInput, setShowCommandInput] = useState(false);
  const [customCommand, setCustomCommand] = useState("");
  const [commandResponse, setCommandResponse] = useState(null);

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch("/api/health").then((res) => res.json());
        setServerStatus({ bridge: response.bridge || "online", cppServer: response.cppServer || "offline" });
      } catch (err) {
        setServerStatus({ bridge: "offline", cppServer: "unknown" });
      }
    };

    checkServerStatus();
    const interval = setInterval(checkServerStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const sendCustomCommand = async (e) => {
    e.preventDefault();
    if (!customCommand.trim()) return;

    try {
      const response = await fetch(`/api/command?cmd=${encodeURIComponent(customCommand)}`).then((res) => res.json());
      setCommandResponse(response);
    } catch (err) {
      setCommandResponse({ success: false, error: err.message });
    }
  };

  return (
    <div className="relative min-h-screen text-white">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url('/assets/bathroom.jpeg')` }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      {/* Main content */}
      <div className="relative z-10 p-6">
        <Navbar />

        <main className="pt-24 grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Thermostat Control */}
          <ThermostatControl roomId="bathroom"/>

          {/* Security Control */}
          <SecurityControl roomId="bathroom"/>

          {/* Light Control */}
          <LightControl roomId="bathroom" />

          {/* Shower */}
          <ShowerControl roomId="bathroom"/>

          {/* Mirror */}
          <MirrorControl roomId="bathroom"/>

          {/* Exhaust Fan */}
          <ExhaustFanControl roomId="bathroom"/>

          {/* System Terminal */}
          <div className="bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg p-5 md:col-span-3 text-white">
            <button
              className="w-full text-left font-mono font-semibold text-sm px-3 py-2 bg-white/30 hover:bg-white/40 rounded text-white"
              onClick={() => setShowCommandInput(!showCommandInput)}
            >
              {showCommandInput ? "▼" : "▶"} SYSTEM TERMINAL
            </button>

            {showCommandInput && (
              <div className="mt-4">
                <form onSubmit={sendCustomCommand} className="flex gap-3 mb-3">
                  <input
                    type="text"
                    value={customCommand}
                    onChange={(e) => setCustomCommand(e.target.value)}
                    placeholder="GET /device/status"
                    className="flex-1 px-4 py-2 rounded bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 backdrop-blur-sm"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-500 hover:bg-blue-400 rounded font-semibold text-white"
                  >
                    EXECUTE
                  </button>
                </form>

                {commandResponse && (
                  <pre className="bg-white/20 p-4 rounded text-sm text-white overflow-x-auto backdrop-blur-sm">
                    {JSON.stringify(commandResponse, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
};

export default Bathroom;