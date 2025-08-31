import React from 'react';
import { PT_BR } from '../utils/translations';

interface HomeScreenProps {
  peerId: string | null;
  player1Name: string | null;
  player2Name: string | null;
}

const PlayerStatus: React.FC<{ name: string | null; playerNumber: number }> = ({ name, playerNumber }) => {
  const colorClass = playerNumber === 1 ? 'border-pink-500' : 'border-teal-500';
  const textColor = playerNumber === 1 ? 'text-pink-300' : 'text-teal-300';

  return (
    <div className={`p-4 border-2 ${colorClass} bg-black bg-opacity-30 rounded-lg text-center transition-all duration-500 ease-in-out`}>
      <p className={`text-lg font-semibold ${textColor}`}>Jogador {playerNumber}</p>
      {name ? (
        <p className="text-2xl font-bold text-white animate-fadeIn">{name}</p>
      ) : (
        <p className="text-xl text-purple-200 animate-pulseSlow">Aguardando...</p>
      )}
    </div>
  );
};

const HomeScreen: React.FC<HomeScreenProps> = ({ peerId, player1Name, player2Name }) => {
  return (
    <div className="bg-purple-950 bg-opacity-80 p-6 md:p-8 rounded-3xl shadow-2xl text-slate-100 animate-fadeIn border border-purple-600 border-opacity-30 flex flex-col items-center">
      <h1 
        className="text-4xl lg:text-5xl font-bold text-center mb-4 text-pink-400 tracking-wider animate-pulseSlow" 
        style={{textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 0 10px rgba(233, 30, 99, 0.5), 0 0 20px rgba(233, 30, 99, 0.3)'}}
      >
        {PT_BR.appName}
      </h1>
      
      <p className="text-purple-200 text-center mb-6">Conecte-se com seu celular para jogar!</p>

      <div className="bg-black bg-opacity-70 p-4 rounded-lg text-center shadow-lg mb-8 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
        <p className="text-purple-300 text-sm">CÓDIGO DA SALA</p>
        {peerId ? (
          <p className="text-3xl font-bold tracking-widest text-yellow-300 select-all">{peerId}</p>
        ) : (
          <p className="text-2xl font-bold tracking-widest text-gray-400 animate-pulse">CARREGANDO...</p>
        )}
      </div>

      <div className="w-full max-w-md grid grid-cols-1 md:grid-cols-2 gap-6">
        <PlayerStatus playerNumber={1} name={player1Name} />
        <PlayerStatus playerNumber={2} name={player2Name} />
      </div>

       {player1Name && player2Name && (
        <div className="mt-8 text-center animate-fadeIn" style={{ animationDelay: '0.5s' }}>
          <p className="text-xl text-green-300 animate-pulseSlow">Tudo pronto! Iniciando o jogo...</p>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;