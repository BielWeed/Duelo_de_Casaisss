
import React, { useEffect, useState } from 'react';
import { Player } from '../types';
import { PT_BR } from '../utils/translations';
import Button from './Button';
import { useGame } from '../contexts/GameStateContext';

// Larger Trophy Icon
const TrophyIconLarge = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3H5.25a3 3 0 013-3m9 0V13.5A2.25 2.25 0 0012 11.25h0A2.25 2.25 0 007.5 13.5v5.25m4.5 0V12m0 0H9.75m2.25 0H14.25m2.25 0V9.75M7.5 9.75V6.75M12 6.75V4.5m0 0H9.75M12 4.5H14.25m2.25 0V2.25M7.5 2.25h9M3.75 18.75h16.5" />
  </svg>
);


interface EndGameScreenProps {}

const EndGameScreen: React.FC<EndGameScreenProps> = () => {
  const { winningPlayer, players, handleBackToPlayerSetup } = useGame();
  
  const [confettiPieces, setConfettiPieces] = useState<JSX.Element[]>([]);

  if (players.length < 2) {
    return null; // or a waiting screen
  }
  
  const winner = winningPlayer;
  const player1Name = players[0].name;
  const player2Name = players[1].name;
  const player1Score = players[0].score;
  const player2Score = players[1].score;
  const onRestart = handleBackToPlayerSetup;

  const loserName = winner ? (winner.name === player1Name ? player2Name : player1Name) : null;

  useEffect(() => {
    if (winner) {
      const pieces: JSX.Element[] = [];
      const colors = ['bg-pink-500', 'bg-purple-500', 'bg-yellow-400', 'bg-teal-400', 'bg-indigo-500'];
      for (let i = 0; i < 30; i++) { // Number of confetti pieces
        const style = {
          left: `${Math.random() * 100}%`,
          animationDuration: `${2 + Math.random() * 2}s`, // 2-4 seconds
          animationDelay: `${Math.random() * 1.5}s`, // Stagger start times
          transform: `scale(${0.8 + Math.random() * 0.4})`, // Random size a bit
        };
        const colorClass = colors[Math.floor(Math.random() * colors.length)];
        pieces.push(
          <div
            key={i}
            className={`confetti-piece ${colorClass} rounded-sm`}
            style={style}
          />
        );
      }
      setConfettiPieces(pieces);
    }
  }, [winner]);

  return (
    <div className="relative bg-black bg-opacity-70 p-6 md:p-10 rounded-xl shadow-2xl text-white text-center max-w-lg mx-auto animate-viewEnter overflow-hidden">
      {winner && confettiPieces} {/* Render confetti pieces if there's a winner */}
      
      <h1 
        className="text-4xl sm:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-teal-400 tracking-wider"
        style={{textShadow: '0 0 10px rgba(233, 30, 99, 0.3)'}}
      >
        {PT_BR.endGame}
      </h1>
      
      <div className="mb-6 bg-white bg-opacity-10 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2 text-purple-300">{PT_BR.finalScores}</h2>
        <p className="text-lg"><span className="font-bold text-pink-300">{player1Name}:</span> {player1Score.toFixed(0)} {PT_BR.score}</p>
        <p className="text-lg"><span className="font-bold text-teal-300">{player2Name}:</span> {player2Score.toFixed(0)} {PT_BR.score}</p>
      </div>

      {winner && loserName ? (
        <div className="flex flex-col items-center">
          <div className="my-3 animate-iconPopIn" style={{animationDelay: '0.2s'}}>
            <TrophyIconLarge />
          </div>
          <p 
            className="text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-400 font-extrabold animate-pulseSlow mb-4 tracking-wide"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 15px rgba(250, 204, 21, 0.7)' }}
          >
            {PT_BR.finalWinnerIs(winner.name)}
          </p>
          <div className="bg-purple-900 bg-opacity-60 p-4 rounded-lg mb-4 text-sm shadow-inner w-full">
            <p className="mb-2">{PT_BR.winnerPrize(winner.name, loserName)}</p>
            <p>{PT_BR.loserPenalty(loserName)}</p>
          </div>
        </div>
      ) : (
        <p className="text-2xl mb-4 py-8">{PT_BR.roundDraw}!</p> 
      )}
      
      <Button onClick={onRestart} size="lg" className="w-full mt-8 !bg-pink-600 hover:!bg-pink-700 shadow-xl hover:shadow-pink-500/50">
        {PT_BR.playAgain}
      </Button>
    </div>
  );
};

export default EndGameScreen;
