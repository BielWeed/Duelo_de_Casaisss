import React from 'react';
import Button from '../Button';
import { PT_BR } from '../../utils/translations';
import { MiniGameType } from '../../types';
import { ControlProps } from './control-types';

const getMiniGameBinaryChoices = (miniGameType: MiniGameType | null) => {
    switch (miniGameType) {
        case MiniGameType.EU_NUNCA: return [{ text: PT_BR.iHaveDoneIt, value: PT_BR.iHaveDoneIt }, { text: PT_BR.iHaveNeverDoneIt, value: PT_BR.iHaveNeverDoneIt }];
        case MiniGameType.FARIA_NAO_FARIA: return [{ text: PT_BR.iWouldDoIt, value: PT_BR.iWouldDoIt }, { text: PT_BR.iWouldNotDoIt, value: PT_BR.iWouldNotDoIt }];
        case MiniGameType.VERDADE: return [{ text: PT_BR.itsTrue, value: PT_BR.itsTrue }, { text: PT_BR.itsALie, value: PT_BR.itsALie }];
        default: return null;
    }
};

const MiniGameControls: React.FC<ControlProps> = ({ gameState, sendAction }) => {
    const { player, losingPlayer, winningPlayer, miniGameQuestion, miniGameAnswerOptions: answerOptions, currentMiniGameType } = gameState;
    
    if (losingPlayer?.id !== player.id) {
        return <p className="text-lg text-purple-200 animate-pulseSlow text-center">Aguardando {losingPlayer?.name || 'oponente'} responder...</p>;
    }
    
    const binaryChoices = getMiniGameBinaryChoices(currentMiniGameType);

    return (
        <div className="w-full space-y-3 text-center animate-fadeIn">
            <h2 className="text-2xl font-bold text-yellow-300">Sua Vez!</h2>
            <p className="text-md text-slate-200 bg-black bg-opacity-20 p-3 rounded-md min-h-[80px] flex items-center justify-center">{miniGameQuestion}</p>
            <div className="space-y-2 pt-2">
            {answerOptions ? ( // Quiz do Casal
                answerOptions.map((option: string, index: number) => (
                    <Button key={index} onClick={() => sendAction('MINIGAME_CHOICE', index)} variant="secondary" className="w-full text-left !justify-start">
                       <span className="font-semibold mr-2">{String.fromCharCode(65 + index)}.</span> {option}
                    </Button>
                ))
            ) : binaryChoices ? ( // Eu Nunca, Faria/Não Faria, Verdade
                binaryChoices.map(choice => (
                    <Button key={choice.value} onClick={() => sendAction('MINIGAME_CHOICE', choice.value)} variant="secondary" className="w-full">
                        {choice.text}
                    </Button>
                ))
            ) : ( // Default case, simple continue
                 <Button onClick={() => sendAction('MINIGAME_CHOICE', 'continue')} size="lg" className="w-full">
                    {PT_BR.completeMinigameButton}
                </Button>
            )}
            </div>
        </div>
    );
};

export default MiniGameControls;
