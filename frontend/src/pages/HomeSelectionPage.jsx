// src/pages/HomeSelectionPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const homes = [
  { id: 1, name: "Home 1" },
  { id: 2, name: "Home 2" },
  { id: 3, name: "Home 3" }
];

const HomeSelectionPage = () => {
  const navigate = useNavigate();

  const selectHome = (home) => {
    localStorage.setItem("selectedHomeId", home.id);
    navigate("/dashboard");
  };

  return (
    <div className="home-selection-page">
      <h2>Select Your Home</h2>
      <div className="home-buttons">
        {homes.map((home) => (
          <button key={home.id} onClick={() => selectHome(home)}>
            {home.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomeSelectionPage;