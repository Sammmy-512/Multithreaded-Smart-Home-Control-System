// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Kitchen from './pages/Kitchen';
import Bathroom from './pages/Bathroom';
import Garage from './pages/Garage';
import Room1 from './pages/Room1';
import Room2 from './pages/Room2';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/kitchen" element={<Kitchen />} />
      <Route path="/bathroom" element={<Bathroom />} />
      <Route path="/garage" element={<Garage />} />
      <Route path="/room1" element={<Room1 />} />
      <Route path="/room2" element={<Room2 />} />
    </Routes>
  );
}

export default App;