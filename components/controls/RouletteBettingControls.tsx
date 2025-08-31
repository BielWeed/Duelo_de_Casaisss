
import React, { useState, useEffect } from 'react';
import Button from '../Button';
import { PT_BR } from '../../utils/translations';
import { BetColor } from '../../types';
import { ROULETTE_PAYOUTS } from '../../constants';
import { ControlProps } from './control-types';

const getRouletteButtonClass = (color: BetColor, selectedColor: BetColor | null) => {
    const isSelected = selectedColor === color;
    let baseClass = 'w-full !py-3 !px-2 transition-all duration-200 ease-in-out transform hover:scale-105 ';
    if (isSelected) {
        baseClass += 'ring-2 ring-offset-2 ring-offset-purple-900 shadow-lg ';
    } else {
        baseClass += 'shadow-md ';
    }
    switch (color) {
        case BetColor.RED: return baseClass + `!bg-red-600 hover:!bg-red-500 ${isSelected ? 'ring-red-300' : ''}`;
        case BetColor.BLACK: return baseClass + `!bg-gray-700 hover:!bg-gray-600 ${isSelected ? 'ring-gray-400' : ''}`;
        case BetColor.GREEN: return baseClass + `!bg-green-600 hover:!bg-green-500 ${isSelected ? 'ring-green-300' : ''}`;
    }
};

const RouletteBettingControls: React.FC<ControlProps> = ({ gameState, sendAction }) => {
    const { player, playerBets } = gameState;

    if (!player || !playerBets) {
        return null;
    }

    const myBet = playerBets[player.id] || null;
    const [amount, setAmount] = useState(50);
    const [color, setColor] = useState<BetColor | null>(null);

    useEffect(() => {
        if (player.score < 50) setAmount(25);
        if (player.score < 25) setAmount(0);
    }, [player.score]);

    if (myBet) {
         return (
            <div className="text-center animate-fadeIn">
                <p className="text-lg font-semibold text-yellow-200">{PT_BR.betConfirmedMessage(myBet.amount, PT_BR.getBetColorName(myBet.color))}</p>
                <p className="text-purple-200 mt-2 animate-pulseSlow">Aguardando outros jogadores...</p>
            </div>
        );
    }
    
    return (
        <div className="w-full space-y-4 animate-fadeIn">
            <h2 className="text-xl font-bold text-center text-pink-300">{PT_BR.roulettePhaseBettingTitle}</h2>
            <p className="text-center text-purple-200">{PT_BR.score}: {player.score.toFixed(0)}</p>
            <div className="grid grid-cols-3 gap-2">
                {[25, 50, 100].map(value => (
                    <Button key={value} onClick={() => setAmount(value)} variant={amount === value ? 'primary' : 'secondary'} disabled={player.score < value}>
                        {value}
                    </Button>
                ))}
            </div>
            <div className="color-selection-buttons-container">
                 {(Object.keys(BetColor) as Array<keyof typeof BetColor>).map(key => (
                    <Button key={key} onClick={() => setColor(BetColor[key])} className={getRouletteButtonClass(BetColor[key], color)}>
                        {PT_BR.getBetColorName(BetColor[key])} ({ROULETTE_PAYOUTS[BetColor[key]]}x)
                    </Button>
                ))}
            </div>
             <Button onClick={() => sendAction('CONFIRM_ROULETTE_BET', {color, amount})} size="lg" className="w-full" disabled={!color || player.score < amount || amount === 0}>
                {PT_BR.confirmBetButtonLabel}
            </Button>
        </div>
    );
}

export default RouletteBettingControls;