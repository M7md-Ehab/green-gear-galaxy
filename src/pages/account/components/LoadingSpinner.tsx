
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-green mx-auto mb-4"></div>
      <p>Loading...</p>
    </div>
  );
};

export default LoadingSpinner;
