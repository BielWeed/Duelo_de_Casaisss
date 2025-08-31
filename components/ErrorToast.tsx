import React, { useState, useEffect, useRef } from 'react';
import { PT_BR } from '../utils/translations';

// Exclamation Triangle Icon
const ExclamationTriangleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-red-300">
    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
  </svg>
);

interface ErrorToastProps {
  message: string;
  onClose: () => void;
}

const AUTO_DISMISS_DURATION = 7000; // 7 seconds
const ANIMATION_DURATION = 400; // Must match CSS animation duration

const ErrorToast: React.FC<ErrorToastProps> = ({ message, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  const toastRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Start auto-dismiss timer
    timerRef.current = window.setTimeout(() => {
      setIsExiting(true);
    }, AUTO_DISMISS_DURATION);

    return () => {
      // Clear timer if component unmounts or message changes (due to key prop)
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [message]); // Re-run effect if message changes (toast re-mounts)

  useEffect(() => {
    const node = toastRef.current;
    if (node && isExiting) {
      const handleAnimationEnd = (event: AnimationEvent) => {
        if (event.animationName === 'toastExitBottom') {
          onClose();
        }
      };
      node.addEventListener('animationend', handleAnimationEnd);
      return () => {
        node.removeEventListener('animationend', handleAnimationEnd);
      };
    }
  }, [isExiting, onClose]);

  const handleManualClose = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current); // Clear auto-dismiss if manually closed
    }
    setIsExiting(true);
  };

  return (
    <div
      ref={toastRef}
      className={`fixed bottom-4 right-4 z-[100] w-full max-w-sm p-4 rounded-lg shadow-2xl
                  bg-gradient-to-br from-red-600 via-red-700 to-red-800 
                  text-white border-2 border-red-500 border-opacity-70
                  flex items-start space-x-3
                  ${isExiting ? 'animate-toastExitBottom' : 'animate-toastEnterBottom'}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex-shrink-0 pt-0.5">
        <ExclamationTriangleIcon />
      </div>
      <div className="flex-grow">
        <p className="text-sm font-semibold text-red-100">{PT_BR.errorOccurred}</p>
        <p className="text-sm text-red-200">{message}</p>
      </div>
      <button
        onClick={handleManualClose}
        className="ml-auto -mx-1.5 -my-1.5 bg-transparent text-red-200 hover:text-white p-1.5 rounded-md inline-flex items-center justify-center h-8 w-8 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
        aria-label="Fechar notificação de erro"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </button>
    </div>
  );
};

export default ErrorToast;