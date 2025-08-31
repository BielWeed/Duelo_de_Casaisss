import React from 'react';

const GenericWaitingScreen: React.FC<{ message?: string, icon?: React.ReactNode }> = ({ message, icon }) => {
    const defaultIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-purple-400 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5l.415-.207a.75.75 0 011.085.67V10.5m0 0h6m-6 0a.75.75 0 00.75.75h4.5a.75.75 0 00.75-.75V7.5a.75.75 0 00-.75-.75h-4.5A.75.75 0 0010.5 7.5v3z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75z" />
        </svg>
    );

    return (
        <div className="text-center animate-fadeIn">
            <div className="animate-pulseSlow">
                {icon || defaultIcon}
            </div>
            <p className="text-xl text-purple-200">{message || "Aguardando o Host..."}</p>
            <div className="ellipsis-container inline-block ml-1 text-xl">
                <span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
            </div>
        </div>
    );
}

export default GenericWaitingScreen;
