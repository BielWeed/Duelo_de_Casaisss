
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Player, GamePhase, BetColor, PlayerBet, RouletteResult, RouletteSegment } from '../types';
import { PT_BR } from '../utils/translations';
import PlayerScoreboard from './PlayerScoreboard';
import { playSound } from '../utils/soundManager';
import { ROULETTE_WHEEL_SEGMENTS, ROULETTE_SPIN_DURATION_MS, ROULETTE_PAYOUTS, TOTAL_ROUNDS } from '../constants';
import { useGame } from '../contexts/GameStateContext';


interface RouletteGameViewProps {}

const PlayerBetStatusDisplay: React.FC<{ player: Player; confirmedBet: PlayerBet | null; isPlayer1Style: boolean; areAllBetsIn: boolean }> = ({ player, confirmedBet, isPlayer1Style, areAllBetsIn }) => {
    const playerNameColor = isPlayer1Style ? 'text-pink-400' : 'text-teal-400';
    const baseClasses = "p-4 rounded-lg text-center animate-fadeInUpShort border md:min-w-xs flex flex-col justify-center items-center min-h-[120px]";

    if (confirmedBet) {
        return (
            <div className={`${baseClasses} bg-purple-800 bg-opacity-70 border-purple-600`}>
                <h3 className={`text-xl font-semibold ${playerNameColor} mb-2`}>{player.name}</h3>
                <p className="text-lg text-yellow-200">
                    {PT_BR.betConfirmedMessage(confirmedBet.amount, PT_BR.getBetColorName(confirmedBet.color))}
                </p>
                {!areAllBetsIn && (
                    <p className="mt-3 text-sm text-purple-200 animate-pulseSlow">
                        Aguardando oponente...
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className={`${baseClasses} bg-purple-900 bg-opacity-60 border-purple-700`}>
            <h3 className={`text-xl font-semibold ${playerNameColor} mb-2`}>{player.name}</h3>
            <div className='flex-grow flex items-center justify-center'>
                 <p className="text-lg text-purple-200 animate-waitingPulse">Aguardando aposta...</p>
            </div>
        </div>
    );
};


interface RouletteWheelDisplayProps {
  segments: RouletteSegment[];
  isSpinning: boolean;
  winningSegmentIndex: number | null | undefined;
}

const WHEEL_RADIUS = 120; 
const CANVAS_SIZE = WHEEL_RADIUS * 2;
const POINTER_OFFSET_DEGREES = -90; // The pointer is at the top of the wheel

const SEGMENT_BORDER_COLOR = '#4A00E0'; 
const WINNING_SEGMENT_BORDER_COLOR = '#FACC15'; 
const WINNING_SEGMENT_FILL_BRIGHTNESS = "brightness(1.3) saturate(1.2)";

const colorMap = {
  [BetColor.RED]: '#EF4444', 
  [BetColor.BLACK]: '#374151', 
  [BetColor.GREEN]: '#22C55E', 
};

const RouletteWheelDisplay: React.FC<RouletteWheelDisplayProps> = ({ segments, isSpinning, winningSegmentIndex }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0); 
  
  const segmentAngleRad = (2 * Math.PI) / segments.length;

  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.save();
    ctx.translate(WHEEL_RADIUS, WHEEL_RADIUS);

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const startAngle = i * segmentAngleRad; 
      const endAngle = (i + 1) * segmentAngleRad;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, WHEEL_RADIUS, startAngle, endAngle, false);
      ctx.closePath();
      
      const isLandedAndWinning = !isSpinning && i === winningSegmentIndex;
      
      if (isLandedAndWinning) {
          ctx.save();
          ctx.filter = WINNING_SEGMENT_FILL_BRIGHTNESS;
          ctx.fillStyle = colorMap[segment.color];
          ctx.fill();
          ctx.restore();
          ctx.strokeStyle = WINNING_SEGMENT_BORDER_COLOR;
          ctx.lineWidth = 4; 
      } else {
          ctx.fillStyle = colorMap[segment.color];
          ctx.fill();
          ctx.strokeStyle = SEGMENT_BORDER_COLOR;
          ctx.lineWidth = 1.5;
      }
      ctx.stroke();
    }
    ctx.restore();
  }, [segments, segmentAngleRad, isSpinning, winningSegmentIndex]);


  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  useEffect(() => {
    if (isSpinning && typeof winningSegmentIndex === 'number') {
      const segmentDegrees = 360 / segments.length;
      const winningAngle = (winningSegmentIndex * segmentDegrees) + (segmentDegrees / 2);
      const targetStoppingAngle = POINTER_OFFSET_DEGREES - winningAngle;
      const randomRevolutions = 5 + Math.floor(Math.random() * 3);
      const totalRotationValue = 360 * randomRevolutions;
  
      setRotation(prevRotation => {
          const currentAngle = prevRotation % 360;
          const rotationAdjustment = targetStoppingAngle - currentAngle;
          return prevRotation + totalRotationValue + rotationAdjustment;
      });
    }
  }, [isSpinning, winningSegmentIndex, segments]);


  return (
    <div className="roulette-wheel-container">
      <canvas 
        ref={canvasRef} 
        width={CANVAS_SIZE} 
        height={CANVAS_SIZE} 
        className="roulette-canvas-wheel"
        style={{ transform: `rotate(${rotation}deg)` }}
        role="img" 
        aria-label="Roleta giratória"
      />
      <div className="roulette-pointer"></div>
    </div>
  );
};


const RouletteGameView: React.FC<RouletteGameViewProps> = () => {
  const { 
    players, currentRound, gamePhase, 
    playerBets, rouletteResult, rouletteIteration, mainRoundsWon
  } = useGame();
  
  if (!players || !playerBets || !rouletteIteration) {
      return null;
  }

  const isBettingPhase = gamePhase === GamePhase.ROULETTE_BETTING;
  const isSpinningPhase = gamePhase === GamePhase.ROULETTE_SPINNING;
  const isEndedPhase = gamePhase === GamePhase.ROULETTE_ENDED;
  
  const allBetsIn = players.length > 0 && players.every(p => playerBets[p.id]);

  let statusMessage = "";
  if (isBettingPhase) {
    if (!allBetsIn) {
      statusMessage = PT_BR.placeYourBets;
    } else {
      statusMessage = PT_BR.allBetsConfirmed; 
    }
  } else if (isSpinningPhase) {
    statusMessage = PT_BR.spinningInProgress;
  } else if (isEndedPhase && rouletteResult) {
    statusMessage = PT_BR.rouletteResultColorOnlyStop(PT_BR.getBetColorName(rouletteResult.winningColor));
  }

  return (
    <div className="bg-purple-950 bg-opacity-80 p-4 md:p-6 rounded-xl shadow-2xl text-white w-full flex flex-col items-center animate-viewEnter">
      <PlayerScoreboard players={players} mainRoundsWon={mainRoundsWon} currentRound={currentRound} totalRounds={TOTAL_ROUNDS} hideKeyLabels={true} />
      
      <h2 className="text-2xl font-bold text-pink-400 mb-4 text-center">
         {PT_BR.rouletteIterationLabel} {rouletteIteration}
      </h2>

      <RouletteWheelDisplay 
        segments={ROULETTE_WHEEL_SEGMENTS} 
        isSpinning={isSpinningPhase} 
        winningSegmentIndex={rouletteResult?.winningSegmentIndex} 
      />

      <div className="my-4 p-3 bg-black bg-opacity-40 rounded-lg text-center min-h-[50px] w-full max-w-md flex items-center justify-center">
        <p className={`text-lg font-semibold ${isEndedPhase ? 'text-yellow-300 animate-fadeInPulseSlow' : 'text-purple-200'}`}>
            {statusMessage || (isBettingPhase ? PT_BR.placeYourBets : "...")}
            {(isSpinningPhase || (isBettingPhase && !allBetsIn )) && (
                 <span className="ellipsis-container inline-block ml-1">
                    <span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
                </span>
            )}
        </p>
      </div>

      { (isBettingPhase || isSpinningPhase || isEndedPhase) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl mt-2">
          {players.map((player, index) => (
             <PlayerBetStatusDisplay
              key={player.id}
              player={player}
              confirmedBet={playerBets[player.id] || null}
              isPlayer1Style={index % 2 === 0}
              areAllBetsIn={allBetsIn}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RouletteGameView;