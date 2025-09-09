import React from 'react';

const Wrapper = ({ children }) => {
  return (
    <div className="min-h-screen game-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">{children}</div>
    </div>
  );
};

export default Wrapper;
