
import { GameState, GameAction, ContextoState } from '../stateTypes';
import { GamePhase } from '../../types';

export const initialContextoState: ContextoState = {
  secretWord: null,
  guessedWords: [],
  isCheckingSimilarity: false,
  isLoadingSecretWord: false,
};

export const contextoReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'START_CONTEXTO_LOADING':
        return {
            ...state,
            secretWord: null,
            guessedWords: [],
            currentPlayerId: null,
            isCheckingSimilarity: false,
            isLoadingSecretWord: true,
            gamePhase: GamePhase.CONTEXTO_LOADING_SECRET_WORD,
        };

    case 'SET_CONTEXTO_WORD':
        return { ...state, secretWord: action.payload.secretWord, currentPlayerId: action.payload.startingPlayerId, isLoadingSecretWord: false, gamePhase: GamePhase.CONTEXTO_PLAYING };
    
    case 'ADD_CONTEXTO_GUESS':
        return { ...state, guessedWords: [...state.guessedWords, action.payload] };

    case 'SET_CONTEXTO_CURRENT_PLAYER':
        return { ...state, currentPlayerId: action.payload };

    case 'SET_CONTEXTO_CHECKING_SIMILARITY':
        return { ...state, isCheckingSimilarity: action.payload };
        
    default:
        return state;
  }
};
