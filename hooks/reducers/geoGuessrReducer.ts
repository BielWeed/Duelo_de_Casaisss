
import { GameState, GameAction, GeoGuessrState } from '../stateTypes';
import { GamePhase } from '../../types';

export const initialGeoGuessrState: GeoGuessrState = {
  locationData: null,
  geoGuessrRound: 1,
  isLoadingLocation: false,
};

export const geoGuessrReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'START_GEOGUESSER_LOADING':
        return {
            ...state,
            locationData: null,
            isLoadingLocation: true,
            players: state.players.map(p => ({ ...p, geoGuessrGuess: null })),
            gamePhase: GamePhase.GEO_GUESSER_LOADING_LOCATION,
        };
    case 'SET_GEOGUESSER_LOCATION':
        return {
            ...state,
            locationData: action.payload.locationData,
            currentPlayerId: action.payload.startingPlayerId,
            isLoadingLocation: false,
            gamePhase: GamePhase.GEO_GUESSER_PLAYER_GUESSING,
        };
    case 'SET_GEOGUESSER_GUESS':
        return {
            ...state,
            players: state.players.map(p => p.id === action.payload.playerId ? { ...p, geoGuessrGuess: action.payload.guess } : p)
        };
    case 'SET_GEOGUESSER_CURRENT_PLAYER':
        return { ...state, currentPlayerId: action.payload };

    case 'ADVANCE_GEOGUESSER_ROUND':
        return { ...state, geoGuessrRound: state.geoGuessrRound + 1 };
        
    default:
        return state;
  }
};
