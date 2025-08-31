
import { GameState, GameAction, RouletteState } from '../stateTypes';
import { GamePhase } from '../../types';

export const initialRouletteState: RouletteState = {
  playerBets: {},
  rouletteResult: null,
  rouletteIteration: 1,
};

export const rouletteReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'RESET_ROULETTE_ROUND':
      return {
          ...state,
          playerBets: {},
          rouletteResult: null,
          rouletteIteration: action.payload.isNewMainRound ? 1 : state.rouletteIteration + 1,
          gamePhase: GamePhase.ROULETTE_BETTING,
      };

    case 'SET_PLAYER_ROULETTE_BET':
      return { ...state, playerBets: { ...state.playerBets, [action.payload.playerId]: action.payload.bet } };

    case 'SET_ROULETTE_RESULT':
      return { ...state, rouletteResult: action.payload };
      
    default:
      return state;
  }
};
