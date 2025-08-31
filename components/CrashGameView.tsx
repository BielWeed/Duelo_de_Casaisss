
import React, { useEffect, useState, useCallback } from 'react';
import { Player, CrashDataPoint, GamePhase } from '../types';
import { PT_BR } from '../utils/translations';
import PlayerScoreboard from './PlayerScoreboard';
import LineGraph from './LineGraph';
import { playSound } from '../utils/soundManager';
import { useGame } from '../contexts/GameStateContext';
import { TOTAL_ROUNDS } from '../constants';

interface CatchUpInfo {
  laggingPlayerName: string;
  leadingPlayerName: string;
  multiplierNeeded: string;
}

interface CrashGameViewProps {}

const CrashGameView: React.FC<CrashGameViewProps> = () => {
  const {
    players,
    currentRound,
    crashIterationCount,
    graphData,
    gamePhase,
    handleStartRoundCountdown,
    handleActualRoundStart,
    crashMessage,
    actualCrashPointValue,
    catchUpInfo,
    isDrawCrashOutcome,
    mainRoundsWon,
  } = useGame();

  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownValue, setCountdownValue] = useState<number | string | null>(null);

  if (!players || players.length === 0 || !graphData || !crashIterationCount) {
    return null; // or a loading/error state
  }
  
  const player1 = players[0];
  const player2 = players[1] || null;

  const p1HasConfirmedBetThisRound = player1.currentRoundBetAmount !== null;
  const p2HasConfirmedBetThisRound = player2 ? player2.currentRoundBetAmount !== null : false;
  const allPlayersConfirmedBet = p1HasConfirmedBetThisRound && (!player2 || p2HasConfirmedBetThisRound);

  useEffect(() => {
    if (gamePhase === GamePhase.CRASH_BETTING) {
      setIsCountingDown(false);
      setCountdownValue(null);
    }
  }, [gamePhase, currentRound, crashIterationCount]);

  const handleInitiateRoundCountdown = useCallback(() => {
    if (!allPlayersConfirmedBet) return; 
    handleStartRoundCountdown(); 
    setIsCountingDown(true);
    setCountdownValue(3);
    playSound('COUNTDOWN_TICK', 0.5);
  }, [allPlayersConfirmedBet, handleStartRoundCountdown, setIsCountingDown, setCountdownValue]);


  useEffect(() => {
    if (gamePhase === GamePhase.CRASH_BETTING && allPlayersConfirmedBet && !isCountingDown) {
      const timerId = setTimeout(() => {
          handleInitiateRoundCountdown();
      }, 1000); // 1-second delay
      return () => clearTimeout(timerId);
    }
  }, [gamePhase, allPlayersConfirmedBet, isCountingDown, handleInitiateRoundCountdown]);

  useEffect(() => {
    if (!isCountingDown || countdownValue === null) return;

    let timerId: number;

    if (typeof countdownValue === 'number' && countdownValue > 1) {
      timerId = window.setTimeout(() => {
        setCountdownValue(countdownValue - 1);
        playSound('COUNTDOWN_TICK', 0.5);
      }, 1000);
    } else if (countdownValue === 1) {
      timerId = window.setTimeout(() => {
        setCountdownValue("GO!");
        playSound('MINIGAME_START', 0.7);
      }, 1000);
    } else if (countdownValue === "GO!") {
      timerId = window.setTimeout(() => {
        setIsCountingDown(false);
        setCountdownValue(null);
        handleActualRoundStart(); 
      }, 800);
    }
    return () => clearTimeout(timerId);
  }, [isCountingDown, countdownValue, handleActualRoundStart]);


  const isCrashed = gamePhase === GamePhase.CRASH_ENDED;

  const playersForScoreboard = [player1, player2].filter(p => p !== null) as Player[];

  return (
    <div className="bg-purple-950 bg-opacity-80 p-4 md:p-6 rounded-xl shadow-2xl text-white w-full flex flex-col items-center animate-viewEnter">
      <PlayerScoreboard players={playersForScoreboard} mainRoundsWon={mainRoundsWon} currentRound={currentRound} totalRounds={TOTAL_ROUNDS} />

      {gamePhase === GamePhase.CRASH_BETTING && !isCountingDown && (
        <h2 className="text-2xl font-bold text-pink-400 my-4 text-center animate-pulseSlow">
          {PT_BR.iterationCrashLabel} {crashIterationCount}
        </h2>
      )}

      { (gamePhase === GamePhase.CRASH_BETTING || gamePhase === GamePhase.CRASH_READY || gamePhase === GamePhase.CRASH_ACTIVE || gamePhase === GamePhase.CRASH_ENDED) &&
        <LineGraph
          data={graphData}
          isCrashed={isCrashed}
          crashPointValue={actualCrashPointValue}
          gamePhase={gamePhase}
        >
          {gamePhase === GamePhase.CRASH_READY && isCountingDown && countdownValue !== null && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black bg-opacity-30">
              <p
                key={countdownValue.toString()}
                className="text-7xl md:text-9xl font-extrabold text-yellow-300 animate-countdownPulse"
                style={{ textShadow: '0 0 10px rgba(250,204,21,0.7), 0 0 20px rgba(250,204,21,0.5)' }}
              >
                {countdownValue}
              </p>
            </div>
          )}
        </LineGraph>
      }
      
      {gamePhase === GamePhase.CRASH_BETTING && !isCountingDown && (
        <div className="mt-4 mb-3 text-center w-full"> 
           <div className="my-4 p-3 bg-black bg-opacity-40 rounded-lg text-center min-h-[50px] w-full max-w-md mx-auto flex items-center justify-center">
            {allPlayersConfirmedBet ? (
              <p className="text-lg font-semibold text-yellow-300 animate-fadeInPulseSlow">
                {PT_BR.betsConfirmedStartCountdown}
              </p>
            ) : (
              <p className="text-lg font-semibold text-purple-200 animate-waitingPulse">
                {PT_BR.waitingForBets}
                <span className="ellipsis-container inline-block ml-1">
                  <span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
                </span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl mb-4 mx-auto">
             <div className={`p-4 rounded-lg text-center animate-fadeInUpShort border md:min-w-xs flex-1 ${player1.currentRoundBetAmount ? 'bg-purple-800 bg-opacity-70 border-purple-600' : 'bg-purple-900 bg-opacity-60 border-purple-700'}`}>
                <h3 className="text-xl font-semibold text-pink-400 mb-2">{player1.name}</h3>
                {player1.currentRoundBetAmount ? (
                    <p className="text-lg text-yellow-200">{PT_BR.betConfirmedMessage(player1.currentRoundBetAmount)}</p>
                ) : (
                    <p className="text-lg text-purple-200 animate-waitingPulse">Aguardando aposta...</p>
                )}
            </div>
            {player2 && (
                <div className={`p-4 rounded-lg text-center animate-fadeInUpShort border md:min-w-xs flex-1 ${player2.currentRoundBetAmount ? 'bg-purple-800 bg-opacity-70 border-purple-600' : 'bg-purple-900 bg-opacity-60 border-purple-700'}`}>
                    <h3 className="text-xl font-semibold text-teal-400 mb-2">{player2.name}</h3>
                    {player2.currentRoundBetAmount ? (
                        <p className="text-lg text-yellow-200">{PT_BR.betConfirmedMessage(player2.currentRoundBetAmount)}</p>
                    ) : (
                        <p className="text-lg text-purple-200 animate-waitingPulse">Aguardando aposta...</p>
                    )}
                </div>
            )}
          </div>
        </div>
      )}
      
      {gamePhase === GamePhase.CRASH_READY && isCountingDown && (
         <div className="my-4 p-4 bg-yellow-600 bg-opacity-60 rounded-lg text-center text-yellow-100 shadow-lg ring-1 ring-yellow-400 animate-pulseSlow text-base font-semibold">
            {PT_BR.crashRoundReadyMessage(currentRound)}
        </div>
      )}

      {catchUpInfo && (gamePhase === GamePhase.CRASH_BETTING || gamePhase === GamePhase.CRASH_READY) && !isCountingDown && (
        <div className="my-4 p-4 bg-yellow-600 bg-opacity-60 rounded-lg text-center text-yellow-100 shadow-lg ring-1 ring-yellow-400 animate-pulseSlow text-base font-semibold">
          {PT_BR.catchUpMessage(
            catchUpInfo.laggingPlayerName,
            catchUpInfo.multiplierNeeded,
            catchUpInfo.leadingPlayerName
          )}
        </div>
      )}
      
      {gamePhase === GamePhase.CRASH_ACTIVE && !isCountingDown && (
        <div className="mt-6 text-center">
          <p className="text-lg text-yellow-300">
            {PT_BR.waitingForCrash}
            <span className="ellipsis-container inline-block ml-1">
              <span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
            </span>
          </p>
        </div>
      )}

      {crashMessage && gamePhase === GamePhase.CRASH_ENDED && (
        <div
          className={`mt-6 p-3 rounded-lg text-center font-semibold ${isCrashed && !isDrawCrashOutcome ? 'bg-red-700 bg-opacity-80' : 'bg-green-700 bg-opacity-80'}`}
          role="status"
          aria-live={isCrashed ? "assertive" : "polite"}
        >
          {crashMessage.map((msg, i) => <div key={i}>{msg}</div>)}
        </div>
      )}
    </div>
  );
};

export default CrashGameView;