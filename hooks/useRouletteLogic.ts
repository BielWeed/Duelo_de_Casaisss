import { useEffect, useCallback } from 'react';
import { GameLogic, MainGameLogicArgs } from './logic-types';
import { Player, GamePhase, PlayerBet, RouletteResult, BetColor } from '../types';
import * as soundManager from '../utils/soundManager';
import { ROULETTE_WHEEL_SEGMENTS, ROULETTE_SPIN_DURATION_MS, ROULETTE_PAYOUTS, ROULETTE_RESULT_DISPLAY_MS } from '../constants';
import { useMiniGameManager } from './useMiniGameManager';

export const useRouletteLogic = ({ state, dispatch, continueOrEndRound }: MainGameLogicArgs): GameLogic => {
    const { players, playerBets } = state;
    
    const onMiniGameComplete = useCallback(() => {
        continueOrEndRound(state.players);
    }, [continueOrEndRound, state.players]);

    const miniGameManager = useMiniGameManager({
        state,
        dispatch,
        onMiniGameComplete,
    });
    
    const allPlayersHaveBet = useCallback(() => {
        return players.length > 0 && players.every(p => playerBets[p.id]);
    }, [players, playerBets]);

    const determineRouletteOutcome = useCallback((result: RouletteResult) => {
        let roundLoser: Player | null = null;
        let roundWinner: Player | null = null;
        let highestWinnings = 0;
        let allLost = true;
        let someonePlayed = false;

        const updatedPlayers = players.map(p => {
            const bet = playerBets[p.id];
            if (!bet) return p;

            someonePlayed = true;
            if (bet.color === result.winningColor) {
                allLost = false;
                const profit = bet.amount * (ROULETTE_PAYOUTS[bet.color] - 1);
                const newScore = p.score + profit;
                if (profit > highestWinnings) {
                    highestWinnings = profit;
                    roundWinner = { ...p, score: newScore };
                }
                return { ...p, score: newScore };
            } else {
                const newScore = Math.max(0, p.score - bet.amount);
                 if (!roundLoser) {
                    roundLoser = { ...p, score: newScore };
                }
                return { ...p, score: newScore };
            }
        });
        
        dispatch({ type: 'SET_PLAYERS', payload: updatedPlayers });

        if (roundWinner && updatedPlayers.length > 1) {
            roundLoser = updatedPlayers.find(p => p.id !== roundWinner!.id) || null;
        } else if (allLost && someonePlayed && updatedPlayers.length > 1) {
            const p1Bet = playerBets[players[0].id]?.amount || 0;
            const p2Bet = playerBets[players[1].id]?.amount || 0;
            roundLoser = p1Bet >= p2Bet ? updatedPlayers[0] : updatedPlayers[1];
        }

        setTimeout(() => {
            if (roundLoser && roundWinner) {
                miniGameManager.initiateMiniGame(roundLoser, roundWinner);
            } else {
                continueOrEndRound(updatedPlayers);
            }
        }, ROULETTE_RESULT_DISPLAY_MS);

    }, [players, playerBets, dispatch, miniGameManager, continueOrEndRound]);


    const spinRoulette = useCallback(() => {
        soundManager.playSound('ROULETTE_SPIN');
        dispatch({ type: 'SET_GAME_PHASE', payload: GamePhase.ROULETTE_SPINNING });

        setTimeout(() => {
            const winningSegmentIndex = Math.floor(Math.random() * ROULETTE_WHEEL_SEGMENTS.length);
            const winningSegment = ROULETTE_WHEEL_SEGMENTS[winningSegmentIndex];
            const result: RouletteResult = {
                winningColor: winningSegment.color,
                winningNumber: winningSegment.number,
                winningSegmentIndex,
            };
            dispatch({ type: 'SET_ROULETTE_RESULT', payload: result });
            soundManager.playSound('ROULETTE_STOP');
            dispatch({ type: 'SET_GAME_PHASE', payload: GamePhase.ROULETTE_ENDED });
            determineRouletteOutcome(result);
        }, ROULETTE_SPIN_DURATION_MS);
    }, [dispatch, determineRouletteOutcome]);


    useEffect(() => {
        if (allPlayersHaveBet()) {
            const timer = setTimeout(spinRoulette, 1500);
            return () => clearTimeout(timer);
        }
    }, [allPlayersHaveBet, spinRoulette]);


    const handlePlayerAction = (playerId: string, action: string, value?: any) => {
        if (state.gamePhase === GamePhase.MINI_GAME_DISPLAY) {
            miniGameManager.handleMinigameAction(value);
            return;
        }

        if (action === 'CONFIRM_ROULETTE_BET' && value) {
            const { color, amount } = value as { color: BetColor; amount: number };
            const player = players.find(p => p.id === playerId);
            if (!player || player.score < amount) return;

            dispatch({ type: 'SET_PLAYER_ROULETTE_BET', payload: { playerId, bet: { playerId, color, amount } } });
            soundManager.playSound('SELECT');
        }
    };
    
    const resetForNewRound = useCallback((isNewMainRound: boolean) => {
        dispatch({ type: 'RESET_ROULETTE_ROUND', payload: { isNewMainRound } });
    }, [dispatch]);

    return {
        handlePlayerAction,
        resetForNewRound,
    };
};