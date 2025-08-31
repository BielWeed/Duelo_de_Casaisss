
import { useEffect, useCallback } from 'react';
import { GameLogic, TurnBasedGameLogicArgs } from './logic-types';
import { GamePhase, ContextoGuess } from '../types';
import * as aiService from '../services/aiService';

export const useContextoLogic = ({ state, dispatch, handleEndGame }: TurnBasedGameLogicArgs): GameLogic => {
    const { players, secretWord, currentPlayerId, gamePhase } = state;

    const loadSecretWord = useCallback(async () => {
        try {
            const word = await aiService.generateContextoSecretWord();
            dispatch({ type: 'SET_CONTEXTO_WORD', payload: { secretWord: word, startingPlayerId: players[0]?.id } });
        } catch (error) {
            console.error(error);
            dispatch({ type: 'SET_CONTEXTO_WORD', payload: { secretWord: "erro", startingPlayerId: players[0]?.id } });
        }
    }, [dispatch, players]);

    useEffect(() => {
        if (gamePhase === GamePhase.CONTEXTO_LOADING_SECRET_WORD) {
            loadSecretWord();
        }
    }, [gamePhase, loadSecretWord]);

    const handleContextoGuessSubmit = useCallback(async (guess: string) => {
        if (!secretWord || !currentPlayerId) return;

        dispatch({ type: 'SET_CONTEXTO_CHECKING_SIMILARITY', payload: true });
        const rank = await aiService.getContextoWordSimilarityRank(secretWord, guess);
        
        const newGuess: ContextoGuess = { word: guess, rank, playerId: currentPlayerId };
        dispatch({ type: 'ADD_CONTEXTO_GUESS', payload: newGuess });

        if (rank === 1) {
            const winner = players.find(p => p.id === currentPlayerId);
            if (winner) {
                dispatch({ type: 'SET_WINNING_PLAYER', payload: winner });
            }
            const updatedPlayers = players.map(p => p.id === currentPlayerId ? {...p, score: p.score + 5000 } : p);
            dispatch({ type: 'SET_PLAYERS', payload: updatedPlayers });
            dispatch({ type: 'SET_GAME_PHASE', payload: GamePhase.CONTEXTO_ROUND_OVER });
            setTimeout(handleEndGame, 3000); 
        } else {
            const currentPlayerIndex = players.findIndex(p => p.id === currentPlayerId);
            const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
            dispatch({ type: 'SET_CONTEXTO_CURRENT_PLAYER', payload: players[nextPlayerIndex].id });
        }

        dispatch({ type: 'SET_CONTEXTO_CHECKING_SIMILARITY', payload: false });
    }, [secretWord, currentPlayerId, players, dispatch, handleEndGame]);

    const handlePlayerAction = (playerId: string, action: string, value?: any) => {
        if (action === 'CONTEXTO_GUESS' && playerId === currentPlayerId && typeof value === 'string') {
            handleContextoGuessSubmit(value);
        }
    };

    const resetForNewRound = useCallback((_isNewMainRound: boolean) => {
        dispatch({ type: 'START_CONTEXTO_LOADING' });
    }, [dispatch]);

    return {
        handlePlayerAction,
        resetForNewRound,
        handleContextoGuessSubmit,
    };
};
