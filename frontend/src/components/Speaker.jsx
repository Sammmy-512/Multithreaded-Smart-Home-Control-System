// src/components/Speaker.jsx
import React, { useState, useEffect } from 'react';
import DeviceCard from './DeviceCard';
import api from '../utils/api';

const Speaker = ({ roomId }) => {
  const [status, setStatus] = useState('stopped'); // playing/paused/stopped
  const [volume, setVolume] = useState(50);
  const [track, setTrack] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Play or pause speaker
  const playPause = async () => {
    setLoading(true);
    setError(null);
    try {
      const action = status === 'playing' ? 'pause' : 'play';
      const response = await api.controlSpeaker(action, roomId);
      if (response.success) {
        setStatus(action === 'play' ? 'playing' : 'paused');
      } else {
        setError(response.error || 'Command failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Adjust speaker volume
  const adjustVolume = async (vol) => {
    setVolume(vol);
    try {
      await api.setSpeakerVolume(vol, roomId);
    } catch (err) {
      console.error('Failed to set volume:', err);
    }
  };

  // Fetch initial status for the room
  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.getSpeakerStatus(roomId);
        if (response.success) {
          setStatus(response.status || 'stopped');
          setVolume(response.volume || 50);
          setTrack(response.track || '');
        }
      } catch (err) {
        console.error('Failed to fetch speaker status:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [roomId]);

  return (
    <DeviceCard
      title={`Speaker - ${roomId}`}
      status={status}
      loading={loading}
      error={error}
      className="bg-white/10 backdrop-blur-lg border border-white/10 text-white shadow-lg rounded-2xl"
    >
      <div className="space-y-4">
        {/* Play / Pause Button */}
        <div className="flex gap-3">
          <button
            onClick={playPause}
            disabled={loading}
            className="flex-1 py-2 rounded-full font-medium text-white transition bg-white/10 hover:bg-white/20 border border-white/20"
          >
            {status === 'playing' ? 'Pause' : 'Play'}
          </button>
        </div>

        {/* Current Track */}
        <div className="text-sm text-white">
          Track: <span className="font-semibold">{track || 'No track playing'}</span>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2 text-sm text-white">
          <span>Volume:</span>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => adjustVolume(Number(e.target.value))}
            className="flex-1 accent-white/80"
          />
          <span>{volume}%</span>
        </div>
      </div>
    </DeviceCard>
  );
};

export default Speaker;