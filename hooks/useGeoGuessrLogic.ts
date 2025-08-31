
import { useEffect, useCallback } from 'react';
import { GameLogic, TurnBasedGameLogicArgs } from './logic-types';
import { GamePhase } from '../types';
import * as aiService from '../services/aiService';
import { GEO_GUESSER_TOTAL_ROUNDS, GEO_GUESSER_POINTS_COUNTRY } from '../constants';

export const useGeoGuessrLogic = ({ state, dispatch, handleEndGame }: TurnBasedGameLogicArgs): GameLogic => {
    const { players, gamePhase, currentPlayerId, locationData, geoGuessrRound } = state;

    const loadLocation = useCallback(async () => {
        try {
            const data = await aiService.generateGeoGuessrLocation();
            dispatch({ type: 'SET_GEOGUESSER_LOCATION', payload: { locationData: data, startingPlayerId: players[0]?.id }});
        } catch (error) {
            console.error("Error generating GeoGuessr location:", error);
            dispatch({ type: 'SET_GAME_PHASE', payload: GamePhase.GEO_GUESSER_PLAYER_GUESSING });
        }
    }, [dispatch, players]);

    useEffect(() => {
        if (gamePhase === GamePhase.GEO_GUESSER_LOADING_LOCATION) {
            loadLocation();
        }
    }, [gamePhase, loadLocation]);

    const handleGeoGuessrSubmit = useCallback((guessCountry: string) => {
        if (!currentPlayerId) return;
        dispatch({ type: 'SET_GEOGUESSER_GUESS', payload: { playerId: currentPlayerId, guess: { country: guessCountry } }});

        const currentPlayerIndex = players.findIndex(p => p.id === currentPlayerId);
        const nextPlayerIndex = (currentPlayerIndex + 1);

        if (nextPlayerIndex < players.length) {
            dispatch({ type: 'SET_GEOGUESSER_CURRENT_PLAYER', payload: players[nextPlayerIndex].id });
        } else {
            dispatch({ type: 'SET_GAME_PHASE', payload: GamePhase.GEO_GUESSER_REVEAL_ANSWER });
        }
    }, [currentPlayerId, players, dispatch]);

    const handleContinue = useCallback(() => {
        let updatedPlayers = [...players];
        if (locationData) {
            updatedPlayers = players.map(player => {
                const guess = player.geoGuessrGuess?.country?.trim().toLowerCase();
                if (guess === locationData.targetCountry.toLowerCase()) {
                    return { ...player, score: player.score + GEO_GUESSER_POINTS_COUNTRY };
                }
                return player;
            });
            dispatch({ type: 'SET_PLAYERS', payload: updatedPlayers });
        }
        
        if (geoGuessrRound >= GEO_GUESSER_TOTAL_ROUNDS) {
            handleEndGame();
        } else {
            dispatch({ type: 'ADVANCE_GEOGUESSER_ROUND' });
            dispatch({ type: 'START_GEOGUESSER_LOADING' });
        }
    }, [geoGuessrRound, players, locationData, dispatch, handleEndGame]);

    const handlePlayerAction = (playerId: string, action: string, value?: any) => {
        if (action === 'GEOGUESSER_SUBMIT' && playerId === currentPlayerId && typeof value === 'string') {
            handleGeoGuessrSubmit(value);
        }
        if (action === 'GEOGUESSER_CONTINUE') {
            handleContinue();
        }
    };
    
    const resetForNewRound = useCallback((_isNewMainRound: boolean) => {
        dispatch({ type: 'START_GEOGUESSER_LOADING' });
    }, [dispatch]);

    return {
        handlePlayerAction,
        resetForNewRound,
        handleGeoGuessrSubmit,
        handleContinue,
    };
};
