import React from 'react';

const Header = ({ ollamaStatus }) => {
  return (
    <div className="flex justify-between items-center py-4">
      <h1 className="text-2xl font-bold text-brand-yellow uppercase">Quote Generator</h1>
      <div className="text-sm font-semibold">
        <span className="text-gray-400 uppercase tracking-wider">Ollama Status:</span>
        <span
          className={`ml-2 status-badge ${
            ollamaStatus === 'connected'
              ? 'status-connected'
              : ollamaStatus === 'disconnected'
              ? 'status-disconnected'
              : 'status-unknown'
          }`}>
          {ollamaStatus}
        </span>
      </div>
    </div>
  );
};

export default Header;
