
import React from 'react';
import Button from '../Button';
import { PT_BR } from '../../utils/translations';
import { ControlProps } from './control-types';

const CrashActiveControls: React.FC<ControlProps> = ({ gameState, sendAction }) => {
    const { player, currentMultiplier } = gameState;

    if (!player) {
        return null;
    }

    return (
        <div className="w-full flex flex-col items-center space-y-4 animate-fadeIn">
            <p className="text-6xl font-mono font-bold text-teal-300">{currentMultiplier ? currentMultiplier.toFixed(2) : '1.00'}x</p>
            {player.hasCashedOut ? (
                <div className="text-center p-4 bg-green-800 bg-opacity-60 rounded-lg">
                    <p className="text-xl text-green-300 font-bold">Você retirou em {player.cashOutMultiplier?.toFixed(2)}x!</p>
                </div>
            ) : (
                <Button onClick={() => sendAction('CASH_OUT', null)} size="lg" className="w-full !py-8 !text-2xl animate-buttonActivePulse !bg-pink-600 hover:!bg-pink-700">
                    {PT_BR.cashOut}
                </Button>
            )}
        </div>
    );
};

export default CrashActiveControls;