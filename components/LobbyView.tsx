
import React, { useState } from 'react';
import { Player } from '../types';
import { PT_BR } from '../utils/translations';
import Button from './Button';
import { useGame } from '../contexts/GameStateContext';

// PlayerStatus is now a local component within LobbyView
const PlayerStatus: React.FC<{ name: string | null; playerNumber: number }> = ({ name, playerNumber }) => {
  const colorClass = playerNumber % 2 !== 0 ? 'border-pink-500' : 'border-teal-500';
  const textColor = playerNumber % 2 !== 0 ? 'text-pink-300' : 'text-teal-300';

  return (
    <div className={`p-4 border-2 ${colorClass} bg-black bg-opacity-30 rounded-lg text-center transition-all duration-500 ease-in-out h-full flex flex-col justify-center`}>
      <p className={`text-lg font-semibold ${textColor}`}>{PT_BR.playerLabel} {playerNumber}</p>
      {name ? (
        <p className="text-2xl font-bold text-white animate-fadeIn">{name}</p>
      ) : (
        <p className="text-xl text-purple-200 animate-pulseSlow">Aguardando...</p>
      )}
    </div>
  );
};

interface LobbyViewProps {}

const LobbyView: React.FC<LobbyViewProps> = () => {
  const { peerId, players, handleStartGame, kickPlayer } = useGame();
  const [isStarting, setIsStarting] = useState(false);

  return (
    <div className="bg-purple-950 bg-opacity-80 p-6 md:p-8 rounded-3xl shadow-2xl text-slate-100 animate-fadeIn border border-purple-600 border-opacity-30 flex flex-col items-center">
      <h1 
        className="text-4xl lg:text-5xl font-bold text-center mb-4 text-pink-400 tracking-wider animate-pulseSlow" 
        style={{textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 0 10px rgba(233, 30, 99, 0.5), 0 0 20px rgba(233, 30, 99, 0.3)'}}
      >
        {PT_BR.appName}
      </h1>
      
      <p className="text-purple-200 text-center mb-6">Jogadores entram na sala usando o código abaixo.</p>

      <div className="bg-black bg-opacity-70 p-4 rounded-lg text-center shadow-lg mb-8 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
        <p className="text-purple-300 text-sm">CÓDIGO DA SALA</p>
        {peerId ? (
          <p className="text-3xl font-bold tracking-widest text-yellow-300 select-all">{peerId}</p>
        ) : (
          <p className="text-2xl font-bold tracking-widest text-gray-400 animate-pulse">CARREGANDO...</p>
        )}
      </div>

      <h2 className="text-xl font-semibold text-purple-200 mb-4">Jogadores na Sala ({players.length})</h2>
      <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[120px]">
        {players.length > 0 ? (
          players.map((player, index) => (
            <div key={player.id} className="relative group">
              <PlayerStatus name={player.name} playerNumber={index + 1} />
              <button 
                onClick={() => kickPlayer(player.id)}
                aria-label={`Expulsar ${player.name}`}
                className="absolute top-2 right-2 p-1 bg-red-700 text-white rounded-full h-6 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out hover:bg-red-600 hover:scale-110 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-purple-950"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        ) : (
          <p className="col-span-1 sm:col-span-2 lg:col-span-3 text-center text-purple-300 mt-4">Aguardando jogadores se conectarem...</p>
        )}
      </div>

      <Button
        onClick={() => { setIsStarting(true); handleStartGame(); }}
        size="lg"
        className="w-full max-w-md mt-8"
        disabled={players.length < 1 || isStarting}
      >
        {isStarting ? 'Iniciando...' : PT_BR.startGame}
      </Button>
    </div>
  );
};

export default LobbyView;
