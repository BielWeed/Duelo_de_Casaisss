import React, { useState } from 'react';
import HostView from './components/HostView';
import PlayerController from './components/PlayerController';
import { PT_BR } from './utils/translations';

// Icons for the selection screen
const TvIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3.75v3.75m-3.75 0h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z" />
    </svg>
);
const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
);


const App: React.FC = () => {
    const [view, setView] = useState<'selection' | 'host' | 'client'>('selection');

    if (view === 'host') {
        return <HostView />;
    }

    if (view === 'client') {
        return <PlayerController />;
    }

    // Selection View
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
             <div className="bg-purple-950 bg-opacity-80 p-6 md:p-8 rounded-3xl shadow-2xl text-slate-100 animate-fadeIn border border-purple-600 border-opacity-30 flex flex-col items-center text-center">
                <h1 
                    className="text-4xl lg:text-5xl font-bold mb-3 text-pink-400 tracking-wider animate-pulseSlow" 
                    style={{textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 0 10px rgba(233, 30, 99, 0.5), 0 0 20px rgba(233, 30, 99, 0.3)'}}
                >
                    {PT_BR.appName}
                </h1>
                <p className="text-xl text-purple-200 mb-8">Como você vai jogar?</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                    {/* Host Button */}
                    <button
                        onClick={() => setView('host')}
                        className="group flex flex-col items-center justify-center p-8 bg-indigo-800 rounded-2xl border-2 border-indigo-600 hover:border-pink-500 hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-pink-500/30 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 focus:ring-offset-purple-950"
                    >
                        <TvIcon />
                        <span className="text-2xl font-bold text-white">Tela (Host)</span>
                        <span className="text-sm text-purple-300">Exibir o jogo principal</span>
                    </button>
                    {/* Client Button */}
                    <button
                        onClick={() => setView('client')}
                        className="group flex flex-col items-center justify-center p-8 bg-teal-800 rounded-2xl border-2 border-teal-600 hover:border-yellow-400 hover:bg-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-400/30 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 focus:ring-offset-purple-950"
                    >
                        <PhoneIcon />
                        <span className="text-2xl font-bold text-white">Controle (Celular)</span>
                        <span className="text-sm text-purple-300">Entrar com código da sala</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default App;
