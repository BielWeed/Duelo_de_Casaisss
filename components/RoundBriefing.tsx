import React, { useEffect } from 'react';
import Button from './Button';
import { PT_BR } from '../utils/translations';

interface RoundBriefingProps {
  title: string;
  message: string | React.ReactNode;
  onContinue: () => void;
  autoContinueDelay?: number; // in ms
  buttonText?: string;
  iconType?: 'trophy' | 'info' | 'none';
  p1Name?: string;
  p1Score?: number;
  p2Name?: string;
  p2Score?: number;
}

const RoundBriefing: React.FC<RoundBriefingProps> = ({ 
  title, 
  message, 
  onContinue, 
  autoContinueDelay, 
  buttonText = "Continuar",
  iconType = 'info',
  p1Name,
  p1Score,
  p2Name,
  p2Score
}) => {
  useEffect(() => {
    let timer: number | undefined;
    if (autoContinueDelay) {
      timer = window.setTimeout(() => {
        onContinue();
      }, autoContinueDelay);
    }
    return () => {
      if (timer !== undefined) {
        clearTimeout(timer);
      }
    };
  }, [autoContinueDelay, onContinue]);

  const renderIcon = () => {
    if (iconType === 'none') return null;

    let iconSvg;
    let iconColorClass = 'text-blue-300'; // Default for info

    if (iconType === 'trophy') {
      iconColorClass = 'text-yellow-300';
      iconSvg = (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-12 h-12 md:w-14 md:h-14 mx-auto ${iconColorClass}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5A3 3 0 0012 9.75h0A3 3 0 007.5 14.25v4.5m4.5 0h0" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25L6 18.75m0 0h12M12 9.75V6.75m0 0H9.75m2.25 0H14.25m2.25 0V4.5m0 0H7.5m6.75 0V2.25" />
        </svg>
      );
    } else { // 'info'
      iconSvg = (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-12 h-12 md:w-14 md:h-14 mx-auto ${iconColorClass}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
      );
    }

    return (
      <div className="mb-3 md:mb-4 animate-iconPopIn">
        {iconSvg}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-40 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 p-6 md:p-8 rounded-xl shadow-2xl text-white max-w-md w-full text-center">
        {renderIcon()}
        <h2 className="text-3xl font-bold text-pink-400 pb-3 border-b-2 border-pink-500 border-opacity-60 mb-5">{title}</h2>
        <div className="text-lg mb-4 min-h-[50px]">{message}</div>

        {(typeof p1Score === 'number' && typeof p2Score === 'number' && p1Name && p2Name) && (
          <div className="text-sm mt-3 mb-5 pt-3 border-t border-purple-500 border-opacity-40 bg-black bg-opacity-20 p-3 rounded-md">
            <h3 className="font-semibold text-purple-300 mb-1.5 text-base">{PT_BR.finalScores}</h3>
            <div className="flex justify-around">
                <p><span className="font-bold text-pink-300">{p1Name}:</span> {p1Score.toFixed(0)} {PT_BR.score}</p>
                <p><span className="font-bold text-teal-300">{p2Name}:</span> {p2Score.toFixed(0)} {PT_BR.score}</p>
            </div>
          </div>
        )}

        {!autoContinueDelay && (
          <Button onClick={onContinue} size="lg" className="w-full">
            {buttonText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default RoundBriefing;