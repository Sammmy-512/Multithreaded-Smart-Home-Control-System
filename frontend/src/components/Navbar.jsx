// src/components/Navbar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const rooms = [
  { name: "Living Room", path: "/" },
  { name: "Kitchen", path: "/kitchen" },
  { name: "Bathroom", path: "/bathroom" },
  { name: "Garage", path: "/garage" },
  { name: "Room 1", path: "/room1" },
  { name: "Room 2", path: "/room2" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2
                    backdrop-blur-lg bg-white/10 border border-white/10
                    rounded-full shadow-lg px-4 py-2 flex gap-2 z-50">
      {rooms.map((room) => {
        const isActive = location.pathname === room.path;
        return (
          <button
            key={room.name}
            onClick={() => navigate(room.path)}
            className={`px-4 py-1.5 rounded-full font-medium text-base transition
              ${isActive
                ? "bg-white text-gray-900 font-semibold shadow-inner"
                : "bg-white/10 text-white hover:bg-white/20"
              }`}
          >
            {room.name}
          </button>
        );
      })}
    </div>
  );
};

export default Navbar;