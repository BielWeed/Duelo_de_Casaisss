
import { useCallback } from 'react';
import { Player, MiniGameType, GamePhase } from '../types';
import * as soundManager from '../utils/soundManager';
import { generateQuestion } from '../services/aiService';
import { LogicHookArgs } from './logic-types';

export interface UseMiniGameManagerArgs extends LogicHookArgs {
    onMiniGameComplete: () => void;
}

export interface MiniGameManagerActions {
    initiateMiniGame: (loser: Player, winner?: Player) => Promise<void>;
    handleMinigameAction: (choice: string | number) => void;
}

export const useMiniGameManager = ({
    state,
    dispatch,
    onMiniGameComplete,
}: UseMiniGameManagerArgs): MiniGameManagerActions => {
    const { selectedMiniGames, adultMode } = state;

    const concludeMiniGame = useCallback(() => {
        dispatch({ type: 'END_MINI_GAME' });
        onMiniGameComplete();
    }, [dispatch, onMiniGameComplete]);

    const handleMinigameAction = useCallback((choice: string | number) => {
        dispatch({ type: 'SET_MINI_GAME_CHOICE', payload: choice });
        setTimeout(() => {
            concludeMiniGame();
        }, 2500);
    }, [dispatch, concludeMiniGame]);

    const initiateMiniGame = useCallback(async (loser: Player, winner?: Player) => {
        soundManager.playSound('MINIGAME_START');
    
        if (selectedMiniGames.length === 0) {
            console.warn("No minigames selected, skipping.");
            setTimeout(concludeMiniGame, 500);
            return;
        }

        const gameType = selectedMiniGames[Math.floor(Math.random() * selectedMiniGames.length)];
        dispatch({ type: 'START_MINI_GAME', payload: { loser, winner, gameType } });
    
        const { questionText, options } = await generateQuestion(gameType, adultMode, loser, winner);
    
        dispatch({ type: 'SET_MINI_GAME_CONTENT', payload: { question: questionText, options: options || null } });
    }, [selectedMiniGames, adultMode, dispatch, concludeMiniGame]);

    return {
        initiateMiniGame,
        handleMinigameAction,
    };
};
