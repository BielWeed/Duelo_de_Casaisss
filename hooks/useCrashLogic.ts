import { useEffect, useCallback, useRef } from 'react';
import { GameLogic, MainGameLogicArgs } from './logic-types';
import { Player, GamePhase } from '../types';
import { PT_BR } from '../utils/translations';
import * as soundManager from '../utils/soundManager';
import {
  CRASH_MULTIPLIER_INCREMENT,
  CRASH_TICK_INTERVAL_MS,
  CRASH_POST_MESSAGE_DELAY_MS,
  MAX_CRASH_MULTIPLIER_CAP,
  BASE_CRASH_PROBABILITY,
  PROBABILITY_INCREASE_PER_MULTIPLIER_UNIT,
  PROBABILITY_INCREASE_PER_SECOND_ELAPSED,
  MIN_MULTIPLIER_BEFORE_CRASH_CAN_OCCUR,
  MIN_DURATION_MS_BEFORE_CRASH_CAN_OCCUR,
  PREDEFINED_CRASH_BET_VALUES,
} from '../constants';
import { useMiniGameManager } from './useMiniGameManager';


export const useCrashLogic = ({ state, dispatch, continueOrEndRound }: MainGameLogicArgs): GameLogic => {
    const { players, currentMultiplier } = state;
    const gameIntervalIdRef = useRef<number | null>(null);
    const crashTimeRef = useRef(0);
    const crashStartTimestampRef = useRef<number | null>(null);

    const onMiniGameComplete = useCallback(() => {
        continueOrEndRound(state.players);
    }, [continueOrEndRound, state.players]);

    const miniGameManager = useMiniGameManager({
        state,
        dispatch,
        onMiniGameComplete,
    });

    const multiplierRef = useRef(currentMultiplier);
    useEffect(() => {
        multiplierRef.current = currentMultiplier;
    }, [currentMultiplier]);

    const resetForNewRound = useCallback((isNewMainRound: boolean) => {
        if (gameIntervalIdRef.current) {
            clearInterval(gameIntervalIdRef.current);
            gameIntervalIdRef.current = null;
        }
        crashTimeRef.current = 0;
        crashStartTimestampRef.current = null;
        dispatch({ type: 'RESET_CRASH_ROUND', payload: { isNewMainRound } });
    }, [dispatch]);
    
    const handleCashOut = useCallback((playerId: string) => {
        const player = players.find(p => p.id === playerId);
        if (!player || player.hasCashedOut) return;
        
        const cashOutMultiplier = currentMultiplier;
        const winnings = (player.currentRoundBetAmount || 0) * cashOutMultiplier;
        const newScore = player.score + winnings;
        
        dispatch({ type: 'UPDATE_PLAYER_FOR_CASHOUT', payload: { playerId, multiplier: cashOutMultiplier, newScore } });
        soundManager.playSound('CASHOUT');
    }, [dispatch, players, currentMultiplier]);
    
    const determineCrashOutcome = useCallback((crashedAt: number) => {
        let localPlayers = [...players]; // Use a local copy to calculate outcomes
        const messages: string[] = [];

        localPlayers.forEach(p => {
            if (p.hasCashedOut && p.cashOutMultiplier) {
                const winnings = (p.currentRoundBetAmount || 0) * p.cashOutMultiplier;
                messages.push(PT_BR.playerCashedOut(p.name, p.cashOutMultiplier, winnings, p.currentRoundBetAmount || 0));
            } else {
                const betLost = p.currentRoundBetAmount || 0;
                const newScore = p.score - betLost;
                dispatch({ type: 'UPDATE_PLAYER_FOR_CRASH', payload: { playerId: p.id, newScore } });
                // Update local copy for winner/loser logic
                localPlayers = localPlayers.map(player => player.id === p.id ? { ...player, score: Math.max(0, newScore) } : player);
                messages.push(PT_BR.playerCrashed(p.name, betLost));
            }
        });
        dispatch({ type: 'SET_CRASH_MESSAGE', payload: messages });

        let roundLoser: Player | null = null;
        let roundWinner: Player | null = null;

        const cashedOutPlayers = localPlayers.filter(p => p.hasCashedOut);
        const crashedPlayers = localPlayers.filter(p => !p.hasCashedOut);

        if (crashedPlayers.length === 2 || cashedOutPlayers.length === 2) {
             const p1 = localPlayers[0];
             const p2 = localPlayers[1];
             if (p1.cashOutMultiplier && p2.cashOutMultiplier) {
                if(p1.cashOutMultiplier > p2.cashOutMultiplier) roundWinner = p1; else if (p2.cashOutMultiplier > p1.cashOutMultiplier) roundWinner = p2;
             }
        } else if (cashedOutPlayers.length === 1 && crashedPlayers.length === 1) {
            roundWinner = cashedOutPlayers[0];
            roundLoser = crashedPlayers[0];
        }

        setTimeout(() => {
            if (roundLoser) {
                miniGameManager.initiateMiniGame(roundLoser, roundWinner || undefined);
            } else {
                continueOrEndRound(localPlayers);
            }
        }, CRASH_POST_MESSAGE_DELAY_MS);
        
    }, [players, dispatch, miniGameManager, continueOrEndRound]);
    
    const gameTick = useCallback(() => {
        const newMultiplier = multiplierRef.current + CRASH_MULTIPLIER_INCREMENT;
        const timeSinceStart = (Date.now() - (crashStartTimestampRef.current || Date.now())) / 1000;
        
        const crashProbability = BASE_CRASH_PROBABILITY +
            (PROBABILITY_INCREASE_PER_MULTIPLIER_UNIT * Math.floor(newMultiplier)) +
            (PROBABILITY_INCREASE_PER_SECOND_ELAPSED * Math.floor(timeSinceStart));
        
        const canCrash = newMultiplier >= MIN_MULTIPLIER_BEFORE_CRASH_CAN_OCCUR && timeSinceStart * 1000 >= MIN_DURATION_MS_BEFORE_CRASH_CAN_OCCUR;

        if (canCrash && (Math.random() < crashProbability || newMultiplier >= MAX_CRASH_MULTIPLIER_CAP)) {
            if(gameIntervalIdRef.current) {
                clearInterval(gameIntervalIdRef.current);
                gameIntervalIdRef.current = null;
            }
            dispatch({ type: 'SET_GAME_PHASE', payload: GamePhase.CRASH_ENDED });
            dispatch({ type: 'SET_ACTUAL_CRASH_POINT', payload: newMultiplier });
            soundManager.playSound('CRASH');
            determineCrashOutcome(newMultiplier);
            return;
        }

        crashTimeRef.current += 1;
        dispatch({ type: 'UPDATE_CRASH_MULTIPLIER', payload: { newMultiplier, newTime: crashTimeRef.current }});
    }, [dispatch, determineCrashOutcome]);

    const handleActualRoundStart = useCallback(() => {
        dispatch({ type: 'SET_GAME_PHASE', payload: GamePhase.CRASH_ACTIVE });
        crashStartTimestampRef.current = Date.now();
        const intervalId = window.setInterval(gameTick, CRASH_TICK_INTERVAL_MS);
        gameIntervalIdRef.current = intervalId;
    }, [dispatch, gameTick]);

    const handleStartRoundCountdown = useCallback(() => {
        dispatch({ type: 'SET_GAME_PHASE', payload: GamePhase.CRASH_READY });
    }, [dispatch]);

    const handlePlayerAction = (playerId: string, action: string, value?: any) => {
        if (state.gamePhase === GamePhase.MINI_GAME_DISPLAY) {
            miniGameManager.handleMinigameAction(value);
            return;
        }

        switch (action) {
            case 'CONFIRM_CRASH_BET':
                dispatch({ type: 'SET_PLAYER_CRASH_BET', payload: { playerId, betAmount: value } });
                break;
            case 'CASH_OUT':
                handleCashOut(playerId);
                break;
        }
    };

    useEffect(() => {
        if (players.length < 2) return;
        const p1 = players[0];
        const p2 = players[1];
        if (p1.score === p2.score) {
            dispatch({ type: 'SET_CATCH_UP_INFO', payload: null });
            return;
        }
        const [laggingPlayer, leadingPlayer] = p1.score < p2.score ? [p1, p2] : [p2, p1];
        const scoreDifference = leadingPlayer.score - laggingPlayer.score;
        const laggingPlayerBet = laggingPlayer.selectedBetForConfirmation || PREDEFINED_CRASH_BET_VALUES[0];

        if (laggingPlayerBet <= 0) {
            dispatch({ type: 'SET_CATCH_UP_INFO', payload: null });
            return;
        }
        const multiplierNeeded = (scoreDifference / laggingPlayerBet) + 1;

        if (multiplierNeeded > 1.01) {
            dispatch({ type: 'SET_CATCH_UP_INFO', payload: {
                laggingPlayerName: laggingPlayer.name,
                leadingPlayerName: leadingPlayer.name,
                multiplierNeeded: multiplierNeeded.toFixed(2),
            }});
        } else {
            dispatch({ type: 'SET_CATCH_UP_INFO', payload: null });
        }
    }, [players, dispatch]);

    return {
        handlePlayerAction,
        resetForNewRound,
        handleStartRoundCountdown,
        handleActualRoundStart,
    };
};