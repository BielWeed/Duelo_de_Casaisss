
import React, { useCallback } from 'react';
import { Player, GameModeType } from '../types';
import { PT_BR } from '../utils/translations';
import { TOTAL_ROUNDS, MAIN_ROUND_TARGET_SCORE, MAIN_ROUND_BANKRUPT_SCORE } from '../constants';
import { GameState, GameAction } from './stateTypes';

const ROUNDS_TO_WIN = Math.ceil(TOTAL_ROUNDS / 2);

export interface RoundManagerArgs {
    state: GameState;
    dispatch: React.Dispatch<GameAction>;
    setRoundBriefing: (briefing: any | null) => void;
    handleEndGame: () => void;
    resetActiveLogicForRound: (isNewMainRound: boolean) => void;
}

export interface RoundManagerReturn {
    checkEndGameCondition: () => boolean;
    continueOrEndRound: (updatedPlayers: Player[]) => void;
}

export const useRoundManager = ({
    state,
    dispatch,
    setRoundBriefing,
    handleEndGame,
    resetActiveLogicForRound,
}: RoundManagerArgs): RoundManagerReturn => {
    
    const { players, currentRound, mainRoundsWon, selectedGameMode } = state;

    const checkEndGameCondition = useCallback(() => {
        if(selectedGameMode === GameModeType.CONTEXTO || selectedGameMode === GameModeType.GEO_GUESSER) {
            return false;
        }

        const p1 = players[0];
        const p2 = players[1];
        if (!p1 || !p2) return false;

        let gameWinner: Player | null = null;
    
        const p1Rounds = mainRoundsWon[p1.id] || 0;
        const p2Rounds = mainRoundsWon[p2.id] || 0;

        if (p1Rounds >= ROUNDS_TO_WIN) gameWinner = p1;
        else if (p2Rounds >= ROUNDS_TO_WIN) gameWinner = p2;
        else if (currentRound > TOTAL_ROUNDS) {
            if (p1.score > p2.score) gameWinner = p1;
            else if (p2.score > p1.score) gameWinner = p2;
            else gameWinner = null; // Draw
        }
    
        if (gameWinner !== null || (currentRound > TOTAL_ROUNDS)) {
            dispatch({ type: 'SET_WINNING_PLAYER', payload: gameWinner });
            handleEndGame();
            return true;
        }
        return false;
    }, [players, currentRound, mainRoundsWon, handleEndGame, selectedGameMode, dispatch]);


    const continueOrEndRound = useCallback((updatedPlayers: Player[]) => {
        const anyPlayerBankrupt = updatedPlayers.some(p => p.score <= MAIN_ROUND_BANKRUPT_SCORE);
        const anyPlayerReachedTarget = updatedPlayers.some(p => p.score >= MAIN_ROUND_TARGET_SCORE);

        if (anyPlayerBankrupt || anyPlayerReachedTarget) {
            const p1 = updatedPlayers[0];
            const p2 = updatedPlayers[1];
            let roundWinner = null;

            if (p1.score >= MAIN_ROUND_TARGET_SCORE || (p2 && p2.score <= MAIN_ROUND_BANKRUPT_SCORE && p1.score > p2.score)) {
                roundWinner = p1;
            } else if (p2 && (p2.score >= MAIN_ROUND_TARGET_SCORE || (p1.score <= MAIN_ROUND_BANKRUPT_SCORE && p2.score > p1.score))) {
                roundWinner = p2;
            }
            
            if (roundWinner) {
                dispatch({ type: 'INCREMENT_MAIN_ROUND_VICTORY', payload: { playerId: roundWinner.id } });
            }

            // checkEndGameCondition needs the updated round wins, so we check it after dispatching
            // We create a temporary new state to check against to avoid race conditions
            const newWins = { ...mainRoundsWon };
            if (roundWinner) newWins[roundWinner.id] = (newWins[roundWinner.id] || 0) + 1;
            
            const isGameOver = () => {
                 if (newWins[p1.id] >= ROUNDS_TO_WIN || (p2 && newWins[p2.id] >= ROUNDS_TO_WIN)) {
                     return true;
                 }
                 return false;
            }

            if (!isGameOver()) {
                 setRoundBriefing({
                    title: roundWinner ? PT_BR.roundWinnerIs(roundWinner.name) : PT_BR.roundDraw,
                    message: ``,
                    onContinue: () => {
                        setRoundBriefing(null);
                        dispatch({ type: 'SET_CURRENT_ROUND', payload: currentRound + 1 });
                        resetActiveLogicForRound(true);
                    },
                    icon: 'trophy',
                    p1Name: p1.name, p1Score: p1.score,
                    p2Name: p2?.name, p2Score: p2?.score,
                 });
            } else {
                checkEndGameCondition(); // This will handle the end game transition
            }
        } else {
             resetActiveLogicForRound(false);
        }
    }, [checkEndGameCondition, resetActiveLogicForRound, setRoundBriefing, dispatch, currentRound, mainRoundsWon]);

    return {
        checkEndGameCondition,
        continueOrEndRound,
    };
};
