
import React, { useState, useEffect, useRef } from 'react';
import { Player, GameModeType } from '../types';
import { PT_BR } from '../utils/translations';
import { MAIN_ROUND_TARGET_SCORE } from '../constants';

// Custom hook to get the previous value of a prop or state
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

// Small Trophy Icon SVG
const TrophyIconSmall = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-yellow-400 mr-1.5">
    <path d="M15.5 14.5A1.5 1.5 0 0114 16h-剂量A1.5 1.5 0 018.5 14.5V12H10V7.5A2.5 2.5 0 007.5 5H6.5a1.5 1.5 0 010-3h7a1.5 1.5 0 010 3H12.5a2.5 2.5 0 00-2.5 2.5V12h1.5v2.5z" />
    <path d="M5 5.5A1.5 1.5 0 016.5 4h7A1.5 1.5 0 0115 5.5V8H5V5.5z" />
  </svg>
);


interface PlayerScoreboardProps {
  players: Player[];
  mainRoundsWon: Record<string, number>;
  currentRound?: number;
  totalRounds?: number;
  hideKeyLabels?: boolean;
  activePlayerId?: string | null;
  gameMode?: GameModeType | null;
}

const PlayerScoreboard: React.FC<PlayerScoreboardProps> = ({ 
    players, 
    mainRoundsWon,
    currentRound, 
    totalRounds, 
    hideKeyLabels = false, 
    activePlayerId,
    gameMode = null
}) => {
  const [playerAnims, setPlayerAnims] = useState<Record<string, { scoreKey: number; cashOutFlair: boolean }>>({});
  const prevPlayers = usePrevious(players);

  useEffect(() => {
    // Initialize or update animations state
    setPlayerAnims(prevAnims => {
        const newAnims: Record<string, { scoreKey: number; cashOutFlair: boolean }> = {};
        let hasChanged = false;

        for (const player of players) {
            const prevPlayer = prevPlayers?.find(p => p.id === player.id);
            const currentAnim = prevAnims[player.id] || { scoreKey: 0, cashOutFlair: false };

            let newScoreKey = currentAnim.scoreKey;
            if (prevPlayer && player.score !== prevPlayer.score) {
                newScoreKey += 1;
                hasChanged = true;
            }

            let newCashOutFlair = currentAnim.cashOutFlair;
            if (prevPlayer && player.cashOutMultiplier !== null && prevPlayer.cashOutMultiplier === null) {
                newCashOutFlair = true;
                hasChanged = true;
            } else if (newCashOutFlair && !player.cashOutMultiplier) {
                 // Reset flair if cashout multiplier becomes null (e.g., new round)
                newCashOutFlair = false;
                hasChanged = true;
            }

            newAnims[player.id] = { scoreKey: newScoreKey, cashOutFlair: newCashOutFlair };
        }
        
        // Only update state if there's a meaningful change to avoid infinite loops
        return hasChanged ? newAnims : prevAnims;
    });
  }, [players, prevPlayers]);

  // Timer to turn off cash-out flair
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    players.forEach(player => {
        if (playerAnims[player.id]?.cashOutFlair) {
            const timer = setTimeout(() => {
                setPlayerAnims(prev => ({
                    ...prev,
                    [player.id]: { ...(prev[player.id] || { scoreKey: 0 }), cashOutFlair: false }
                }));
            }, 1500);
            timers.push(timer);
        }
    });

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [playerAnims, players]);

  const getProgressBarColor = (score: number) => {
    if (gameMode === GameModeType.CONTEXTO) return 'bg-teal-500';
    if (score <= 75) return 'bg-red-500';
    if (score >= 225) return 'bg-green-500';
    return 'bg-pink-500'; 
  };

  const playerDisplay = (player: Player, index: number) => {
    const isActive = activePlayerId === player.id;
    const anims = playerAnims[player.id] || { scoreKey: 0, cashOutFlair: false };
    const scoreAnimKey = `${player.id}-${anims.scoreKey}`;
    const cashedOutFlair = anims.cashOutFlair;
    
    let nameColor = index % 2 === 0 ? 'text-pink-400' : 'text-teal-400';
    let nameClasses = `text-xl font-bold ${nameColor}`;

    if (isActive) {
      nameClasses += ' brightness-110 scale-[1.03] transform transition-all duration-300';
    }
    
    let containerClasses = "text-center p-1 transition-all duration-300 ease-in-out rounded-lg";
    if (isActive) {
        containerClasses += ' animate-activePlayerGlow';
    }
    if (cashedOutFlair && gameMode !== GameModeType.CONTEXTO) {
        containerClasses += ' animate-cashOutFlair';
    }

    const scorePercentage = gameMode === GameModeType.CONTEXTO ? 100 : Math.max(0, Math.min(100, (player.score / MAIN_ROUND_TARGET_SCORE) * 100));
    const progressBarColor = getProgressBarColor(player.score);
    const roundsWon = mainRoundsWon[player.id] || 0;

    return (
      <div key={player.id} className={`${containerClasses} flex-1 max-w-xs min-w-[180px]`}> 
        <div className={isActive || (cashedOutFlair && gameMode !== GameModeType.CONTEXTO) ? 'p-2' : ''}>
          <h3 className={nameClasses}>{player.name}</h3>
          {gameMode !== GameModeType.CONTEXTO && (
            <p key={scoreAnimKey} className="text-2xl font-mono animate-scoreUpdate">
                {player.score.toFixed(0)} {PT_BR.score}
            </p>
          )}
          
          {gameMode !== GameModeType.CONTEXTO && (
            <div className="w-full bg-purple-700 bg-opacity-30 rounded-full h-2.5 my-2 shadow-inner">
              <div 
                className={`${progressBarColor} h-2.5 rounded-full transition-all duration-500 ease-out`} 
                style={{ width: `${scorePercentage}%` }}
                role="progressbar"
                aria-valuenow={player.score}
                aria-valuemin={0}
                aria-valuemax={MAIN_ROUND_TARGET_SCORE}
                aria-label={`Progresso de ${player.name}`}
              ></div>
            </div>
          )}
          
          <div className="flex items-center justify-center mt-2 text-sm">
            <TrophyIconSmall />
            <span className="text-purple-300 mr-1.5">{PT_BR.victoriesLabel}:</span>
            <span className={`font-bold ${index % 2 === 0 ? 'text-pink-400' : 'text-teal-400'}`}>{roundsWon}</span>
          </div>

          {!hideKeyLabels && gameMode !== GameModeType.CONTEXTO && (
            <p className={`text-xs text-purple-200 mt-2 bg-purple-800 bg-opacity-60 px-2.5 py-1 rounded-md shadow-sm inline-block transition-all duration-200 ease-in-out ${isActive ? 'animate-activeKeyLabelPulse' : ''}`}>
              {PT_BR.pressKeyToCashOut(player.keyLabel)}
            </p>
          )}
        </div>
      </div>
    );
  };
  
  const renderRoundCounter = () => (
    <div className="text-center px-1 sm:px-2 py-2 shrink-0">
        {gameMode === GameModeType.CONTEXTO ? (
            <>
                <h4 className="text-xs sm:text-sm font-semibold text-purple-300">{PT_BR.contextoGameLabel}</h4>
                <p className="text-2xl sm:text-3xl font-bold text-teal-300">🏆</p>
            </>
        ) : (
            <>
                <h4 className="text-xs sm:text-sm font-semibold text-purple-300">{PT_BR.round}</h4>
                <p className="text-2xl sm:text-3xl font-bold">{currentRound}/{totalRounds}</p>
            </>
        )}
    </div>
  );

  return (
    <div className="bg-purple-900 bg-opacity-50 p-3 sm:p-4 rounded-lg shadow-xl mb-4 sm:mb-6 w-full max-w-3xl">
      <div className="flex justify-around items-stretch text-white space-x-2 sm:space-x-4 flex-wrap gap-y-4">
        {players.length === 2 ? (
            <>
                {playerDisplay(players[0], 0)}
                {renderRoundCounter()}
                {playerDisplay(players[1], 1)}
            </>
        ) : (
            <>
                {players.map((player, index) => playerDisplay(player, index))}
                {renderRoundCounter()}
            </>
        )}
      </div>
    </div>
  );
};

export default PlayerScoreboard;
