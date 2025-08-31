
import { useMemo } from 'react';
import { GameModeType, Player } from '../types';
import { GameState, GameAction } from './stateTypes';
import { GameLogic } from './logic-types';
import { useCrashLogic } from './useCrashLogic';
import { useRouletteLogic } from './useRouletteLogic';
import { useContextoLogic } from './useContextoLogic';
import { useGeoGuessrLogic } from './useGeoGuessrLogic';

/**
 * Defines the complete set of arguments required by the GameModeManager.
 * It combines all dependencies needed by any of the individual game logic hooks.
 */
export interface GameModeManagerArgs {
    state: GameState;
    dispatch: React.Dispatch<GameAction>;
    continueOrEndRound: (updatedPlayers: Player[]) => void;
    handleEndGame: () => void;
}

/**
 * A custom hook that acts as a factory for game logic.
 * It instantiates all available game logic hooks and returns the
 * active one based on the current `selectedGameMode` from the game state.
 *
 * @param {GameModeManagerArgs} args - The state, dispatch, and callback functions.
 * @returns {GameLogic} The active game logic object containing handlers for the current mode.
 */
export const useGameModeManager = ({
    state,
    dispatch,
    continueOrEndRound,
    handleEndGame,
}: GameModeManagerArgs): GameLogic => {
    
    // Instantiate all logic hooks, passing their required arguments.
    const crashLogic = useCrashLogic({ state, dispatch, continueOrEndRound });
    const rouletteLogic = useRouletteLogic({ state, dispatch, continueOrEndRound });
    const contextoLogic = useContextoLogic({ state, dispatch, handleEndGame });
    const geoGuessrLogic = useGeoGuessrLogic({ state, dispatch, handleEndGame });

    // Use useMemo to select the active logic based on the game mode.
    // This ensures we only re-evaluate when the game mode or a specific logic object changes.
    const activeLogic: GameLogic = useMemo(() => {
        switch (state.selectedGameMode) {
            case GameModeType.CRASH:
                return crashLogic;
            case GameModeType.ROULETTE:
                return rouletteLogic;
            case GameModeType.CONTEXTO:
                return contextoLogic;
            case GameModeType.GEO_GUESSER:
                return geoGuessrLogic;
            default:
                // Return a default, non-functional logic object to prevent errors if a mode is not mapped.
                return {
                    handlePlayerAction: () => {
                        console.warn(`No logic handler for game mode: ${state.selectedGameMode}`);
                    },
                };
        }
    }, [state.selectedGameMode, crashLogic, rouletteLogic, contextoLogic, geoGuessrLogic]);

    return activeLogic;
};
