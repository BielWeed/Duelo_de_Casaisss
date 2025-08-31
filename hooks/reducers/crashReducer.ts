
import { GameState, GameAction, CrashState } from '../stateTypes';
import { GamePhase } from '../../types';
import { PREDEFINED_CRASH_BET_VALUES } from '../../constants';

export const initialCrashState: CrashState = {
  graphData: [{ time: 0, multiplier: 1 }],
  currentMultiplier: 1.0,
  actualCrashPointValue: null,
  crashMessage: null,
  isDrawCrashOutcome: false,
  crashIterationCount: 1,
  catchUpInfo: null,
};

export const crashReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'RESET_CRASH_ROUND':
        return {
            ...state,
            graphData: [{ time: 0, multiplier: 1 }],
            currentMultiplier: 1.0,
            actualCrashPointValue: null,
            crashMessage: null,
            isDrawCrashOutcome: false,
            crashIterationCount: action.payload.isNewMainRound ? 1 : state.crashIterationCount + 1,
            players: state.players.map(p => ({
                ...p,
                hasCashedOut: false,
                cashOutMultiplier: null,
                currentRoundBetAmount: null,
                selectedBetForConfirmation: action.payload.isNewMainRound ? PREDEFINED_CRASH_BET_VALUES[0] : p.selectedBetForConfirmation
            })),
            gamePhase: GamePhase.CRASH_BETTING,
        };
    
    case 'SET_PLAYER_CRASH_BET':
        return {
            ...state,
            players: state.players.map(p => p.id === action.payload.playerId ? { ...p, currentRoundBetAmount: action.payload.betAmount, selectedBetForConfirmation: action.payload.betAmount } : p)
        };
    
    case 'UPDATE_PLAYER_FOR_CASHOUT':
        return {
            ...state,
            players: state.players.map(p => p.id === action.payload.playerId ? { ...p, score: action.payload.newScore, hasCashedOut: true, cashOutMultiplier: action.payload.multiplier } : p)
        };

    case 'UPDATE_PLAYER_FOR_CRASH':
        return {
            ...state,
            players: state.players.map(p => p.id === action.payload.playerId ? { ...p, score: Math.max(0, action.payload.newScore) } : p)
        };

    case 'UPDATE_CRASH_MULTIPLIER':
        return {
            ...state,
            currentMultiplier: action.payload.newMultiplier,
            graphData: [...state.graphData, { time: action.payload.newTime, multiplier: action.payload.newMultiplier }]
        };

    case 'SET_ACTUAL_CRASH_POINT':
        return { ...state, actualCrashPointValue: action.payload };

    case 'SET_CRASH_MESSAGE':
        return { ...state, crashMessage: action.payload };
    
    case 'SET_CATCH_UP_INFO':
        return { ...state, catchUpInfo: action.payload };

    default:
      return state;
  }
};
