import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  duration?: number;
  onClose: () => void;
  type?: 'success' | 'error' | 'info';
}

const Toast: React.FC<ToastProps> = ({ message, duration = 3000, onClose, type = 'info' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Wait for fade-out animation before calling onClose
        setTimeout(onClose, 300); 
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  let bgColor = 'bg-gray-700';
  let textColor = 'text-white';
  let iconSvg;

  switch (type) {
    case 'success':
      bgColor = 'bg-green-500';
      iconSvg = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
      break;
    case 'error':
      bgColor = 'bg-red-500';
       iconSvg = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      break;
    case 'info':
    default:
      bgColor = 'bg-blue-500';
       iconSvg = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      break;
  }


  return (
    <div 
      className={`fixed bottom-5 right-5 sm:bottom-8 sm:right-8 p-3 sm:p-4 rounded-lg shadow-xl ${bgColor} ${textColor} 
                  flex items-center space-x-3 z-[200] transition-all duration-300 ease-in-out
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
      role="alert"
      aria-live="assertive"
    >
      {iconSvg && <span className="flex-shrink-0">{iconSvg}</span>}
      <span className="text-sm sm:text-base">{message}</span>
      <button 
        onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }} 
        className={`ml-auto -mr-1 p-1 rounded-md hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-white/50`}
        aria-label="Close toast"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
