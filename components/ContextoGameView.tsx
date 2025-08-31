
import React, { useState, useEffect, useRef } from 'react';
import { Player, ContextoGuess, GameModeType, GamePhase } from '../types';
import { PT_BR } from '../utils/translations';
import PlayerScoreboard from './PlayerScoreboard';
import Button from './Button';
import TextInput from './TextInput'; 
import { playSound } from '../utils/soundManager';
import { useGame } from '../contexts/GameStateContext';
import { TOTAL_ROUNDS } from '../constants';

interface ContextoGameViewProps {}

const ThinkingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-pink-400 animate-pulse">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-3.4 8.25-7.75 8.25L12 21.75l-1.25-.5c-4.35 0-7.75-3.694-7.75-8.25S6.65 3.75 11 3.75h2c4.35 0 7.75 3.694 7.75 8.25z" />
  </svg>
);

const WordIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-teal-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);


const ContextoGameView: React.FC<ContextoGameViewProps> = () => {
  const {
    players,
    currentRound,
    mainRoundsWon,
    currentPlayerId,
    secretWord,
    guessedWords,
    handleContextoGuessSubmit,
    isCheckingSimilarity,
    gamePhase,
    selectedGameMode,
  } = useGame();
  
  const [currentGuess, setCurrentGuess] = useState('');
  const [error, setError] = useState<string | null>(null);
  const guessInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  if (!players || players.length === 0 || !guessedWords) {
      return null;
  }

  const player1 = players[0];
  const player2 = players[1] || null;
  const isLoadingSecretWord = gamePhase === GamePhase.CONTEXTO_LOADING_SECRET_WORD;
  const gameMode = selectedGameMode;
  
  const currentPlayer = currentPlayerId === player1.id ? player1 : player2;

  useEffect(() => {
    if (guessInputRef.current) {
      guessInputRef.current.focus();
    }
  }, [currentPlayerId, isLoadingSecretWord]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [guessedWords]);

  const handleGuessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only letters and spaces (for multi-word, though Contexto is usually single word)
    // For single word, just letters: /^[a-zA-ZÀ-ÿ]*$/
    if (/^[a-zA-ZÀ-ÿ]*$/.test(value) || value === '') {
        setCurrentGuess(value);
    }
    if (error) setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleContextoGuessSubmit) return;
    const guessTrimmed = currentGuess.trim().toLowerCase();

    if (guessTrimmed.length < 3) {
      setError(PT_BR.contextoWordTooShort);
      return;
    }
    if (guessedWords.some(g => g.word === guessTrimmed)) {
      setError(PT_BR.contextoAlreadyGuessed(guessTrimmed));
      return;
    }
    
    setError(null);
    handleContextoGuessSubmit(guessTrimmed);
    setCurrentGuess('');
    playSound('SELECT');
  };

  const sortedGuessedWords = [...guessedWords].sort((a, b) => a.rank - b.rank);
  const playersForScoreboard = [player1, player2].filter(p => p !== null) as Player[];

  if (isLoadingSecretWord || !secretWord) {
    return (
      <div className="bg-purple-950 bg-opacity-80 p-6 md:p-8 rounded-xl shadow-2xl text-white w-full flex flex-col items-center justify-center animate-viewEnter min-h-[400px]">
        <ThinkingIcon />
        <p className="mt-4 text-xl text-pink-300">{PT_BR.contextoGeneratingSecretWord}</p>
      </div>
    );
  }

  return (
    <div className="bg-purple-950 bg-opacity-80 p-4 md:p-6 rounded-xl shadow-2xl text-white w-full flex flex-col items-center animate-viewEnter">
      <PlayerScoreboard 
        players={playersForScoreboard}
        mainRoundsWon={mainRoundsWon}
        currentRound={currentRound} 
        totalRounds={TOTAL_ROUNDS} 
        hideKeyLabels={true} 
        activePlayerId={currentPlayer?.id}
        gameMode={gameMode}
      />

      <h2 className="text-3xl font-bold text-pink-400 my-3 text-center tracking-wide">{PT_BR.contextoPhaseTitle}</h2>
      
      {currentPlayer && (
        <div className="bg-black bg-opacity-40 p-3 rounded-lg text-center w-full max-w-md mx-auto mb-4">
          <p className="text-lg font-semibold text-yellow-300 animate-pulseSlow">
            {PT_BR.contextoYourTurn(currentPlayer.name)}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full max-w-sm mb-4 space-y-3">
        <TextInput
          id="contextoGuess"
          label={PT_BR.contextoEnterWord}
          value={currentGuess}
          onChange={handleGuessChange}
          error={error || undefined}
          maxLength={30}
          className="transition-all duration-300 focus-within:scale-105"
          disabled={isCheckingSimilarity}
          ref={guessInputRef}
          aria-describedby="contexto-instructions"
        />
        <Button
          type="submit"
          size="lg"
          className="w-full !bg-pink-600 hover:!bg-pink-700 focus:ring-pink-500"
          disabled={isCheckingSimilarity || currentGuess.trim().length < 3}
        >
          {isCheckingSimilarity ? PT_BR.contextoCheckingSimilarity : PT_BR.contextoSubmitGuess}
        </Button>
      </form>
      
      {guessedWords.length > 0 && (
        <div className="w-full max-w-lg bg-indigo-900 bg-opacity-40 p-3 sm:p-4 rounded-lg shadow-inner mt-2 mb-3">
          <h3 className="text-lg font-semibold text-purple-300 mb-2 text-center">{PT_BR.contextoHistoryTitle}</h3>
          <div ref={scrollRef} className="max-h-60 overflow-y-auto pr-2 space-y-1.5">
            {sortedGuessedWords.map((guess, index) => (
              <div 
                key={index} 
                className={`flex justify-between items-center p-2 rounded-md text-sm transition-all duration-300 ease-in-out
                            ${guess.rank === 1 ? 'bg-green-500 bg-opacity-30 border-l-4 border-green-400 shadow-lg' 
                                : guess.playerId === player1.id ? 'bg-pink-700 bg-opacity-20 border-l-4 border-pink-500' 
                                : 'bg-teal-700 bg-opacity-20 border-l-4 border-teal-500'}
                            ${guess.rank < 11 ? 'font-semibold' : ''}
                            hover:scale-[1.02] hover:shadow-md`}
              >
                <span className={`w-12 text-center ${guess.rank === 1 ? 'text-yellow-300 font-bold text-base' : guess.rank < 11 ? 'text-yellow-200' : 'text-purple-200'}`}>
                  {guess.rank === 1 ? '🏆 1' : guess.rank}
                </span>
                <span className={`flex-1 px-2 truncate ${guess.rank ===1 ? 'text-green-100' : 'text-slate-100'}`}>{guess.word}</span>
                <span className={`w-20 text-xs text-right truncate ${guess.playerId === player1.id ? 'text-pink-300' : 'text-teal-300'}`}>
                  {guess.playerId === player1.id ? player1.name : player2?.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

       <div id="contexto-instructions" className="text-xs text-purple-300 mt-4 p-3 bg-black bg-opacity-30 rounded-md w-full max-w-lg text-center space-y-1">
            <p className="font-semibold">{PT_BR.contextoInstructionsTitle}</p>
            <p>{PT_BR.contextoInstruction1}</p>
            <p>{PT_BR.contextoInstruction3}</p>
        </div>
    </div>
  );
};

export default ContextoGameView;
