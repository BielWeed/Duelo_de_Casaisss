import { useEffect, useCallback, useRef, useReducer } from 'react';
import { GamePhase, Player, Gender, MiniGameType, GameModeType, PeerDataPayload, GameStateSyncPayload } from '../types';
import { PT_BR } from '../utils/translations';
import { INITIAL_SCORE, PLAYER_1_CONTROL_KEY, PLAYER_2_CONTROL_KEY } from '../constants';
import * as soundManager from '../utils/soundManager';
import { useUIState } from './useUIState';
import { useRoundManager } from './useRoundManager';
import { gameReducer, initialState } from './gameReducer';
import { useGameModeManager } from './useGameModeManager';
import { useConnectionManager } from './useConnectionManager';

export const useGameState = () => {
    const {
        isMuted,
        handleToggleMute,
        roundBriefing,
        setRoundBriefing,
        errorToast,
        setErrorToast,
        showInstructionModal,
        setShowInstructionModal,
    } = useUIState();

    const [state, dispatch] = useReducer(gameReducer, initialState);
    
    const gamePhaseRef = useRef(state.gamePhase);
    useEffect(() => { gamePhaseRef.current = state.gamePhase; }, [state.gamePhase]);

    const handleEndGame = useCallback((_e?: any) => {
        dispatch({ type: 'SET_GAME_PHASE', payload: GamePhase.GAME_OVER });
    }, [dispatch]);

    const continueOrEndRoundRef = useRef<(updatedPlayers: Player[]) => void>();

    const activeLogic = useGameModeManager({
        state,
        dispatch,
        continueOrEndRound: (players) => continueOrEndRoundRef.current?.(players),
        handleEndGame,
    });

    const { continueOrEndRound } = useRoundManager({
        state,
        dispatch,
        setRoundBriefing,
        handleEndGame,
        resetActiveLogicForRound: activeLogic.resetForNewRound || ((_: boolean) => {}),
    });

    useEffect(() => {
        continueOrEndRoundRef.current = continueOrEndRound;
    }, [continueOrEndRound]);
    
    const dataHandlerRef = useRef<(connId: string, data: PeerDataPayload) => void>();

    const onPlayerDisconnected = useCallback((connId: string) => {
        const disconnectedPlayer = state.players.find(p => p.id === connId);
        if (disconnectedPlayer && state.gamePhase !== GamePhase.GAME_OVER && state.gamePhase !== GamePhase.PLAYER_SETUP) {
            dispatch({
                type: 'SET_DISCONNECTED_PLAYER',
                payload: {
                    player: { id: disconnectedPlayer.id, name: disconnectedPlayer.name },
                    prePausePhase: state.gamePhase,
                },
            });
            dispatch({ type: 'SET_GAME_PHASE', payload: GamePhase.GAME_PAUSED_DISCONNECTED });
        } else if (disconnectedPlayer) {
             dispatch({ type: 'SET_PLAYERS', payload: state.players.filter(p => p.id !== connId) });
        }
    }, [state.players, state.gamePhase, dispatch]);

    const onPlayerConnected = useCallback((_conn: any) => {
        console.log('Player connected: a new player has established a connection.');
    }, []);
    
    const { peerId, kickPlayer, connections } = useConnectionManager({
        onDataReceived: (connId, data) => dataHandlerRef.current?.(connId, data),
        onPlayerConnected,
        onPlayerDisconnected
    });

    const handleDataReceived = useCallback((connId: string, data: PeerDataPayload) => {
        if (!data || !data.type) return;

        switch (data.type) {
            case 'IDENTIFY':
                if (data.payload.name) {
                    const connectingPlayerName = data.payload.name.trim();
                    const lowerCaseName = connectingPlayerName.toLowerCase();

                    // First, check if a player with this ID is already fully registered.
                    const existingPlayerById = state.players.find(p => p.id === connId);
                    if (existingPlayerById) return; // Player already exists, do nothing.

                    // Check for reconnection based on name
                    if (state.disconnectedPlayer && state.disconnectedPlayer.name.toLowerCase() === lowerCaseName) {
                        const oldPlayerId = state.disconnectedPlayer.id;
                        
                        // Update the player's ID in the main players array
                        dispatch({
                            type: 'SET_PLAYERS',
                            payload: state.players.map(p => 
                                p.id === oldPlayerId ? { ...p, id: connId } : p
                            )
                        });
                        
                        // Clear the disconnected player state
                        dispatch({ type: 'SET_DISCONNECTED_PLAYER', payload: { player: null, prePausePhase: null } });

                        // Resume the game
                        if (state.prePauseGamePhase) {
                            dispatch({ type: 'SET_GAME_PHASE', payload: state.prePauseGamePhase });
                        }
                        return;
                    }
                    
                    const existingPlayerByName = state.players.find(p => p.name.toLowerCase() === lowerCaseName);
                    // Check if name is taken by a different, active connection
                    if (existingPlayerByName) {
                        const conn = connections[connId];
                        if (conn) conn.send({ type: 'ERROR', payload: { message: `O nome "${connectingPlayerName}" já está em uso.` } });
                        return;
                    }

                    // Check if the room is full for a new player
                    if (state.players.length >= 2) {
                        const conn = connections[connId]; 
                        if (conn) conn.send({ type: 'ERROR', payload: { message: 'A sala já está cheia.' } });
                        return;
                    }

                    // If all checks pass, add the new player
                    const newPlayer: Player = {
                        id: connId,
                        name: connectingPlayerName,
                        score: INITIAL_SCORE,
                        gender: Gender.OUTRO,
                        hasCashedOut: false,
                        cashOutMultiplier: null,
                        keyLabel: state.players.length === 0 ? PT_BR.player1KeyLabel : PT_BR.player2KeyLabel,
                        controlKey: state.players.length === 0 ? PLAYER_1_CONTROL_KEY : PLAYER_2_CONTROL_KEY,
                        currentRoundBetAmount: null,
                        selectedBetForConfirmation: 0,
                    };
                    soundManager.playSound('SELECT');
                    dispatch({ type: 'SET_PLAYERS', payload: [...state.players, newPlayer] });
                }
                break;
            case 'PLAYER_ACTION':
                const { action, value } = data.payload;
                activeLogic.handlePlayerAction(connId, action, value);
                break;
        }
    }, [activeLogic, state.players, state.disconnectedPlayer, state.prePauseGamePhase, connections, dispatch]);

    useEffect(() => {
        dataHandlerRef.current = handleDataReceived;
    }, [handleDataReceived]);

    const handleRestartGame = useCallback(() => {
        dispatch({ type: 'RESET_GAME_STATE' });
    }, [dispatch]);

    const handleStartGame = useCallback(() => {
        if (state.players.length > 0) {
          dispatch({ type: 'SET_GAME_PHASE', payload: GamePhase.GAME_CUSTOMIZATION });
        }
    }, [state.players.length, dispatch]);

    const handleContinueFromBriefing = useCallback(() => {
        const callback = roundBriefing?.onContinue;
        setRoundBriefing(null);
        if (callback && typeof callback === 'function') {
            callback();
        }
    }, [roundBriefing, setRoundBriefing]);

    const handleCustomizationComplete = useCallback((gameMode: GameModeType, miniGames: MiniGameType[], useAdultMode: boolean) => {
        dispatch({ type: 'SET_GAME_CUSTOMIZATION', payload: { gameMode, miniGames, adultMode: useAdultMode } });
        setShowInstructionModal(true);
    }, [dispatch, setShowInstructionModal]);

    const handleStartGameFromInstructions = useCallback(() => {
        setShowInstructionModal(false);
        switch(state.selectedGameMode) {
            case GameModeType.CRASH: 
                dispatch({ type: 'SET_GAME_PHASE', payload: GamePhase.CRASH_BETTING });
                break;
            case GameModeType.ROULETTE: 
                dispatch({ type: 'SET_GAME_PHASE', payload: GamePhase.ROULETTE_BETTING });
                break;
            case GameModeType.CONTEXTO: 
                dispatch({ type: 'START_CONTEXTO_LOADING' });
                break;
            case GameModeType.GEO_GUESSER: 
                dispatch({ type: 'START_GEOGUESSER_LOADING' });
                break;
        }
    }, [state.selectedGameMode, dispatch, setShowInstructionModal]);

    const handleBackToPlayerSetup = useCallback(() => {
        handleRestartGame();
    }, [handleRestartGame]);
    
    // === UNIFIED STATE SYNCHRONIZATION ===
    useEffect(() => {
        if (!sendData) return;
        
        const syncPayload: GameStateSyncPayload = {
            gamePhase: state.gamePhase,
            allPlayers: state.players,
            losingPlayer: state.losingPlayer,
            winningPlayer: state.winningPlayer,
            miniGameQuestion: state.miniGameQuestion,
            miniGameAnswerOptions: state.miniGameAnswerOptions,
            currentMiniGameType: state.currentMiniGameType,
            miniGamePlayerChoice: state.miniGamePlayerChoice,
            
            // Crash
            currentMultiplier: state.currentMultiplier,
            crashMessage: state.crashMessage,
            actualCrashPointValue: state.actualCrashPointValue,
            isDrawCrashOutcome: state.isDrawCrashOutcome,
            crashIterationCount: state.crashIterationCount,
            catchUpInfo: state.catchUpInfo,
            
            // Roulette
            playerBets: state.playerBets,
            rouletteResult: state.rouletteResult,
            rouletteIteration: state.rouletteIteration,
            
            // Contexto
            secretWord: state.secretWord,
            guessedWords: state.guessedWords,
            isCheckingSimilarity: state.isCheckingSimilarity,
            isLoadingSecretWord: state.isLoadingSecretWord,
            
            // GeoGuessr
            locationData: state.locationData,
            geoGuessrRound: state.geoGuessrRound,
            isLoadingLocation: state.isLoadingLocation,
            
            // Shared
            currentPlayerId: state.currentPlayerId,
        };

        sendData({ type: 'GAME_STATE_SYNC', payload: syncPayload });
    }, [state, sendData]);
    
    return {
        ...state,
        // UI state & handlers
        isMuted,
        handleToggleMute,
        roundBriefing,
        errorToast,
        setErrorToast,
        showInstructionModal,
        // Top-level handlers
        handleStartGame,
        handleCustomizationComplete,
        handleBackToPlayerSetup,
        handleStartGameFromInstructions,
        handleContinueFromBriefing,
        
        // Connection related
        peerId,
        kickPlayer,
        
        // Active logic handlers
        ...activeLogic,
    };
};