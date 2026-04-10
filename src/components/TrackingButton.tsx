import React, { useState } from 'react';
import { X } from 'lucide-react';

interface TrackingButtonProps {
  getTrackingData: () => any;
}

export function TrackingButton({ getTrackingData }: TrackingButtonProps) {
  const [showToast, setShowToast] = useState(false);

  const handleClick = () => {
    // 1. Get the tracking data payload
    const data = getTrackingData();
    
    // 2. Log to console in uppercase as requested
    console.log('TRACKING DATA PAYLOAD:\n', JSON.stringify(data, null, 2));
    
    // 3. Show toast notification
    setShowToast(true);
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <>
      <button 
        onClick={handleClick}
        className="bg-red-500 text-white px-4 py-2 rounded-full shadow-sm hover:bg-red-600 transition-all flex items-center gap-2 group text-sm"
      >
        <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
        <span className="font-medium">Bülteni Kapat</span>
      </button>

      {showToast && (
        <div className="fixed top-20 right-5 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-top-4 duration-300 flex items-center gap-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Verileriniz gönderildi, bültenden çıkılıyor...
        </div>
      )}
    </>
  );
}
