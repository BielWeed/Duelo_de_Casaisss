
import React, { useState, useEffect } from 'react';
import Button from '../Button';
import { PT_BR } from '../../utils/translations';
import { PREDEFINED_CRASH_BET_VALUES } from '../../constants';
import { ControlProps } from './control-types';

const CrashBettingControls: React.FC<ControlProps> = ({ gameState, sendAction }) => {
    const { player } = gameState;

    if (!player) {
        return null;
    }

    const [selectedBet, setSelectedBet] = useState(PREDEFINED_CRASH_BET_VALUES[0]);

    useEffect(() => {
        if (player.score < PREDEFINED_CRASH_BET_VALUES[0]) {
            setSelectedBet(player.score > 0 ? player.score : 0);
        } else if (!PREDEFINED_CRASH_BET_VALUES.includes(selectedBet)){
            setSelectedBet(PREDEFINED_CRASH_BET_VALUES[0]);
        }
    }, [player.score, selectedBet]);

    const handleConfirm = () => {
        sendAction('CONFIRM_CRASH_BET', selectedBet);
    };

    if (player.currentRoundBetAmount) {
        return (
            <div className="text-center">
                <p className="text-lg font-semibold text-yellow-200">{PT_BR.betConfirmedMessage(player.currentRoundBetAmount)}</p>
                <p className="text-purple-200 mt-2 animate-pulseSlow">Aguardando outros jogadores...</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-4 animate-fadeIn">
            <h2 className="text-xl font-bold text-center text-pink-300">{PT_BR.crashBettingPhaseTitle}</h2>
            <p className="text-center text-purple-200">{PT_BR.score}: {player.score.toFixed(0)}</p>
            <div className="text-center my-2 bg-black bg-opacity-30 p-2 rounded-md border border-purple-700">
                <p className="text-3xl font-mono text-yellow-300">{selectedBet}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
                {PREDEFINED_CRASH_BET_VALUES.map(value => (
                    <Button key={value} onClick={() => setSelectedBet(value)}
                        variant={selectedBet === value ? 'primary' : 'secondary'}
                        disabled={player.score < value}
                        className="!py-3"
                    >
                        {value}
                    </Button>
                ))}
            </div>
            <Button onClick={handleConfirm} size="lg" className="w-full" disabled={player.score < selectedBet || selectedBet === 0}>
                {PT_BR.confirmCrashBetButtonLabel}
            </Button>
        </div>
    );
};

export default CrashBettingControls;