import React from 'react';
import { GameState, GameAction } from './stateTypes';
import {
    Player,
} from '../types';


export interface LogicHookArgs {
    state: GameState;
    dispatch: React.Dispatch<GameAction>;
}

export interface MainGameLogicArgs extends LogicHookArgs {
    continueOrEndRound: (updatedPlayers: Player[]) => void;
}

export interface TurnBasedGameLogicArgs extends LogicHookArgs {
    handleEndGame: () => void;
}

export interface GameLogic {
    handlePlayerAction: (playerId: string, action: string, value?: any) => void;
    resetForNewRound?: (isNewMainRound: boolean) => void;
    
    // Crash handlers
    handleStartRoundCountdown?: () => void;
    handleActualRoundStart?: () => void;

    // Contexto handlers
    handleContextoGuessSubmit?: (guess: string) => void;

    // GeoGuessr handlers
    handleGeoGuessrSubmit?: (guess: string) => void;
    handleContinue?: () => void;
}