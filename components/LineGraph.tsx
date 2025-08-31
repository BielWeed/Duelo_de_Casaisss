
import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { CrashDataPoint, GamePhase } from '../types';
import { PT_BR } from '../utils/translations';

interface LineGraphProps {
  data: CrashDataPoint[];
  isCrashed: boolean; // Derived from gamePhase === GamePhase.CRASH_ENDED
  crashPointValue?: number | null;
  gamePhase: GamePhase; // To determine aria-label states like "ready"
  children?: React.ReactNode; // To allow overlaying countdown text
}

// Custom hook to get the previous value of a prop or state
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

const LineGraph: React.FC<LineGraphProps> = ({ data, isCrashed, crashPointValue, gamePhase, children }) => {
  const lastDataPoint = data.length > 0 ? data[data.length - 1] : { multiplier: 1 };
  const [animateCrashVisual, setAnimateCrashVisual] = useState(false);
  const prevIsCrashed = usePrevious(isCrashed);
  
  const yDomain = [0.9, Math.max(2, Math.ceil(lastDataPoint.multiplier * 1.2))];

  useEffect(() => {
    if (isCrashed && !prevIsCrashed) {
      setAnimateCrashVisual(true);
      const timer = setTimeout(() => setAnimateCrashVisual(false), 500); // Duration of animation matches CSS
      return () => clearTimeout(timer);
    }
  }, [isCrashed, prevIsCrashed]);

  let ariaLabel = PT_BR.appName; // Default label
  if (isCrashed && crashPointValue) {
    ariaLabel = `${PT_BR.crashOccurredAt(crashPointValue)}.`;
  } else if (gamePhase === GamePhase.CRASH_ACTIVE) {
    ariaLabel = `${PT_BR.multiplier}: ${lastDataPoint.multiplier.toFixed(2)}x. ${PT_BR.waitingForCrash}`;
  } else if (gamePhase === GamePhase.CRASH_READY) {
    ariaLabel = `${PT_BR.crashPhaseTitle}. ${PT_BR.initialInstructions}. ${PT_BR.round} ${data[0]?.time === 0 && lastDataPoint.multiplier === 1 ? 'pronta para iniciar' : 'em andamento'}.`;
  }


  return (
    <div 
      className={`h-64 md:h-80 w-full bg-black bg-opacity-60 p-4 rounded-xl shadow-2xl relative overflow-hidden border-2 border-transparent
                  ${animateCrashVisual ? 'animate-graphCrashImpact' : ''}`}
      role="img" // More appropriate for a chart
      aria-label={ariaLabel}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}> {/* Changed left margin */}
          <defs>
            <linearGradient id="lineGradientActive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00BCD4" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="#007B8A" stopOpacity={0.7}/>
            </linearGradient>
            <linearGradient id="lineGradientCrashed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF5252" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="#D32F2F" stopOpacity={0.7}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#4A0072" strokeOpacity={0.5} />
          <XAxis 
            dataKey="time" 
            tick={false}
            axisLine={false}
            tickLine={false} 
          />
          <YAxis 
            domain={yDomain}
            tickFormatter={(value) => `${value.toFixed(2)}x`} 
            stroke="#E91E63" 
            allowDataOverflow={true}
          />
          <Tooltip
            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #E91E63', borderRadius: '8px' }}
            labelStyle={{ color: '#FFC107', fontWeight: 'bold' }}
            itemStyle={{ color: '#FFFFFF' }}
            formatter={(value: number) => [`${value.toFixed(2)}x`, PT_BR.multiplier]}
          />
          <Line
            type="monotone"
            dataKey="multiplier"
            stroke={isCrashed ? "url(#lineGradientCrashed)" : "url(#lineGradientActive)"}
            strokeWidth={3.5} // Slightly thicker for better gradient visibility
            dot={false}
            isAnimationActive={false} 
          />
          {isCrashed && crashPointValue && (
            <ReferenceLine y={crashPointValue} label={{ value: `${PT_BR.crashOccurredAt(crashPointValue)}`, fill: '#FF0000', fontSize: 14, fontWeight: 'bold', position: 'insideTopRight' }} stroke="red" strokeDasharray="3 3" strokeWidth={2} />
          )}
        </LineChart>
      </ResponsiveContainer>
      {!isCrashed && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <p 
            className="text-5xl md:text-7xl font-bold text-white" 
            style={{ textShadow: '0 0 10px #E91E63, 0 0 20px #E91E63' }}
            aria-live="polite" // Announce multiplier changes
            role="status" 
            aria-atomic="true"
          >
            {lastDataPoint.multiplier.toFixed(2)}x
          </p>
        </div>
      )}
       {isCrashed && crashPointValue && (
         <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center animate-crashTextPop"
            aria-live="assertive" // Announce crash immediately
            role="alert"
          >
          <p className="text-5xl md:text-7xl font-bold text-red-500" style={{ textShadow: '0 0 10px #FF0000, 0 0 20px #FF0000' }}>
            CRASH!
          </p>
          <p className="text-2xl text-red-400">{crashPointValue.toFixed(2)}x</p>
        </div>
      )}
      {children /* For countdown overlay */}
    </div>
  );
};

export default LineGraph;