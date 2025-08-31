
import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { GameModeType } from '../types';
import { PT_BR } from '../utils/translations';
import { useGame } from '../contexts/GameStateContext';

// Icons for the instruction modal
const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-pink-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
);
const TargetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-teal-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-2.621-1.343-5.024-3.5-6.5-2.157-1.476-4.843-1.476-7 0-2.157 1.476-3.5 3.879-3.5 6.5s1.343 5.024 3.5 6.5c2.157 1.476 4.843 1.476 7 0 2.157-1.476 3.5-3.879 3.5-6.5z" />
    </svg>
);

interface InstructionModalProps {}

const InstructionModal: React.FC<InstructionModalProps> = () => {
    const { selectedGameMode, handleStartGameFromInstructions } = useGame();
    
    if (!selectedGameMode) return null;
    
    const getGameObjective = () => {
        switch (selectedGameMode) {
            case GameModeType.CRASH: return PT_BR.crashObjective;
            case GameModeType.ROULETTE: return PT_BR.rouletteObjective;
            case GameModeType.CONTEXTO: return PT_BR.contextoObjective;
            case GameModeType.GEO_GUESSER: return PT_BR.geoGuessrObjective;
            default: return "";
        }
    };

    const getGameTitle = () => {
        switch (selectedGameMode) {
            case GameModeType.CRASH: return PT_BR.crashGameMode;
            case GameModeType.ROULETTE: return PT_BR.rouletteGameMode;
            case GameModeType.CONTEXTO: return PT_BR.contextoGameMode;
            case GameModeType.GEO_GUESSER: return PT_BR.geoGuessrGameMode;
            default: return "";
        }
    };

    const modalTitle = `${PT_BR.instructionModalTitle}: ${getGameTitle()}`;

    return (
        <Modal 
            isOpen={true} 
            title={modalTitle} 
            onClose={handleStartGameFromInstructions}
            modalClassName="bg-gradient-to-br from-purple-800 via-indigo-900 to-black p-4 sm:p-6 rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-modalPanelEnter"
        >
            <div className="space-y-6 text-slate-200">
                {/* Section 1: How to Connect */}
                <div className="flex items-start gap-4 p-4 bg-black bg-opacity-20 rounded-lg">
                    <div className="flex-shrink-0 pt-1">
                        <PhoneIcon />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-purple-300 mb-1">{PT_BR.instructionModalConnectTitle}</h3>
                        <p className="text-sm leading-relaxed">{PT_BR.instructionModalConnectBody}</p>
                    </div>
                </div>

                {/* Section 2: Game Objective */}
                <div className="flex items-start gap-4 p-4 bg-black bg-opacity-20 rounded-lg">
                    <div className="flex-shrink-0 pt-1">
                        <TargetIcon />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-purple-300 mb-1">{PT_BR.instructionModalObjectiveTitle}</h3>
                        <p className="text-sm leading-relaxed">{getGameObjective()}</p>
                    </div>
                </div>
            </div>

            <Button onClick={handleStartGameFromInstructions} size="lg" className="w-full mt-8 animate-pulseSlow">
                {PT_BR.instructionModalReadyButton}
            </Button>
        </Modal>
    );
};

export default InstructionModal;
