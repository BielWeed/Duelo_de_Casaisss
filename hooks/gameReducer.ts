import { GameState, GameAction } from './stateTypes';
import { GamePhase, GameModeType, MiniGameType } from '../types';
import { 
    initialCrashState, 
    initialRouletteState, 
    initialContextoState,
    initialGeoGuessrState,
    crashReducer,
    rouletteReducer,
    contextoReducer,
    geoGuessrReducer,
} from './reducers';

export const initialState: GameState = {
  // Core
  gamePhase: GamePhase.PLAYER_SETUP,
  players: [],
  currentRound: 1,
  mainRoundsWon: {},
  selectedGameMode: GameModeType.CRASH,
  selectedMiniGames: Object.values(MiniGameType),
  adultMode: false,
  winningPlayer: null,
  
  // Disconnect
  disconnectedPlayer: null,
  prePauseGamePhase: null,

  // MiniGame
  losingPlayer: null,
  currentMiniGameType: null,
  miniGameQuestion: null,
  miniGameAnswerOptions: null,
  miniGamePlayerChoice: null,
  
  // Shared
  currentPlayerId: null,

  // Game Mode States
  ...initialCrashState,
  ...initialRouletteState,
  ...initialContextoState,
  ...initialGeoGuessrState,
};

const subReducers = [crashReducer, rouletteReducer, contextoReducer, geoGuessrReducer];

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  // First, handle the core actions that don't belong to a specific game mode logic
  switch (action.type) {
    case 'RESET_GAME_STATE':
      return {
          ...initialState,
          players: [],
          mainRoundsWon: {},
      };

    case 'SET_GAME_PHASE':
      return { ...state, gamePhase: action.payload };

    case 'SET_PLAYERS':
      return { ...state, players: action.payload };
      
    case 'SET_CURRENT_ROUND':
        return { ...state, currentRound: action.payload };

    case 'INCREMENT_MAIN_ROUND_VICTORY': {
        const newWins = { ...state.mainRoundsWon };
        newWins[action.payload.playerId] = (newWins[action.payload.playerId] || 0) + 1;
        return { ...state, mainRoundsWon: newWins };
    }

    case 'SET_GAME_CUSTOMIZATION':
      return { ...state, ...action.payload };

    case 'SET_WINNING_PLAYER':
      return { ...state, winningPlayer: action.payload };
      
    case 'SET_DISCONNECTED_PLAYER':
        return { ...state, disconnectedPlayer: action.payload.player, prePauseGamePhase: action.payload.prePausePhase };

    // --- MiniGame Reducers ---
    case 'START_MINI_GAME':
        return { 
            ...state, 
            losingPlayer: action.payload.loser, 
            winningPlayer: action.payload.winner || null,
            currentMiniGameType: action.payload.gameType,
            miniGamePlayerChoice: null,
            gamePhase: GamePhase.MINI_GAME_LOADING
        };

    case 'SET_MINI_GAME_CONTENT':
        return { ...state, miniGameQuestion: action.payload.question, miniGameAnswerOptions: action.payload.options, gamePhase: GamePhase.MINI_GAME_DISPLAY };

    case 'SET_MINI_GAME_CHOICE':
        return { ...state, miniGamePlayerChoice: action.payload };

    case 'END_MINI_GAME':
        return {
            ...state,
            miniGameQuestion: null,
            miniGameAnswerOptions: null,
            losingPlayer: null,
            currentMiniGameType: null,
            miniGamePlayerChoice: null,
        };

    default:
      // If no core action matched, delegate to the sub-reducers.
      // Each sub-reducer will check the action type and either handle it or return the state unchanged.
      return subReducers.reduce(
          (currentState, reducerFn) => reducerFn(currentState, action),
          state
      );
  }
};
