// Popup React Entry Point
// Đây là placeholder cho Step 06: Popup Interface Foundation & React Setup

import React from 'react';
import ReactDOM from 'react-dom/client';
import '@/styles/globals.css';

// Placeholder component cho development
const PlaceholderPopup: React.FC = () => {
  return (
    <div className="w-80 bg-nen-chinh text-chu-chinh p-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-4">Copy To Notion</h1>
        <p className="text-xam-trung text-sm">
          Popup interface sẽ được hoàn thiện trong Step 06
        </p>
        <div className="mt-6 space-y-3">
          <div className="w-full h-10 bg-xam-nhat rounded border border-xam-nhe"></div>
          <div className="w-full h-10 bg-xam-nhat rounded border border-xam-nhe"></div>
          <div className="w-full h-10 bg-xam-nhat rounded border border-xam-nhe"></div>
        </div>
      </div>
    </div>
  );
};

// Mount React app
const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(<PlaceholderPopup />);
}
