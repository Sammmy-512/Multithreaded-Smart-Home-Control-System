// src/components/DeviceCard.jsx
import React from 'react';

const DeviceCard = ({ title, icon, children, status, loading, error }) => {
  // Map status to Tailwind background/text colors
  const statusColors = {
    on: 'bg-amber-400 text-gray-900',
    off: 'bg-gray-500 text-white',
    armed: 'bg-red-500 text-white',
    disarmed: 'bg-yellow-500 text-gray-900',
    online: 'bg-green-400 text-gray-900',
    offline: 'bg-red-500 text-white',
  };

  return (
    <div className="bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg p-5 flex flex-col gap-4 text-gray-900">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="flex text-white items-center gap-2 text-lg font-semibold">
          {title}
        </h3>

        {status && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusColors[status.toLowerCase()] || 'bg-gray-400 text-white'}`}
          >
            {status}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex-1">{children}</div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 mt-2">
          <div className="w-5 h-5 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-200">Processing...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-2 text-sm text-red-500 font-semibold flex items-center gap-1">
          <span>⚠️</span>
          {error}
        </div>
      )}
    </div>
  );
};

export default DeviceCard;