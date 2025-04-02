
import React from 'react';

interface ScanFrameProps {
  scanMode: 'single' | 'shelf';
}

const ScanFrame = ({ scanMode }: ScanFrameProps) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Scan frame guides */}
      <div className={`
        border-2 border-white border-opacity-70 rounded-lg 
        absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
        ${scanMode === 'single' ? 'w-4/5 h-2/3' : 'w-11/12 h-4/5'}
      `}>
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white border-opacity-80 rounded-tl"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white border-opacity-80 rounded-tr"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white border-opacity-80 rounded-bl"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white border-opacity-80 rounded-br"></div>
      </div>
    </div>
  );
};

export default ScanFrame;
