
import {
  GamePhase, Player, MiniGameType, GameModeType,
  CrashDataPoint, PlayerBet, RouletteResult, ContextoGuess, GeoGuessrLocation
} from '../types';

export interface CrashState {
  graphData: CrashDataPoint[];
  currentMultiplier: number;
  actualCrashPointValue: number | null;
  crashMessage: string[] | null;
  isDrawCrashOutcome: boolean;
  crashIterationCount: number;
  catchUpInfo: { laggingPlayerName: string, leadingPlayerName: string, multiplierNeeded: string } | null;
}

export interface RouletteState {
  playerBets: Record<string, PlayerBet>;
  rouletteResult: RouletteResult | null;
  rouletteIteration: number;
}

export interface ContextoState {
  secretWord: string | null;
  guessedWords: ContextoGuess[];
  isCheckingSimilarity: boolean;
  isLoadingSecretWord: boolean;
}

export interface GeoGuessrState {
  locationData: GeoGuessrLocation | null;
  geoGuessrRound: number; // Specific to this mode
  isLoadingLocation: boolean;
}


export interface GameState extends CrashState, RouletteState, ContextoState, GeoGuessrState {
  // Core State
  gamePhase: GamePhase;
  players: Player[];
  currentRound: number; // For main game loop if applicable
  mainRoundsWon: Record<string, number>;
  selectedGameMode: GameModeType;
  selectedMiniGames: MiniGameType[];
  adultMode: boolean;
  winningPlayer: Player | null; // Overall game winner

  // Disconnection State
  disconnectedPlayer: { id: string, name:string } | null;
  prePauseGamePhase: GamePhase | null;
  
  // MiniGame State
  losingPlayer: Player | null; // Player who lost main round, plays minigame
  miniGameQuestion: string | null;
  miniGameAnswerOptions: string[] | null;
  miniGamePlayerChoice: string | number | null;
  currentMiniGameType: MiniGameType | null;

  // Shared Logic State
  currentPlayerId: string | null; // For turn-based modes like Contexto/GeoGuessr
}

// Action Types
export type GameAction =
  | { type: 'RESET_GAME_STATE' }
  | { type: 'SET_GAME_PHASE', payload: GamePhase }
  | { type: 'SET_PLAYERS', payload: Player[] }
  | { type: 'SET_CURRENT_ROUND', payload: number }
  | { type: 'INCREMENT_MAIN_ROUND_VICTORY', payload: { playerId: string } }
  | { type: 'SET_GAME_CUSTOMIZATION', payload: { gameMode: GameModeType, miniGames: MiniGameType[], adultMode: boolean } }
  | { type: 'SET_WINNING_PLAYER', payload: Player | null }
  | { type: 'SET_DISCONNECTED_PLAYER', payload: { player: {id: string, name: string} | null, prePausePhase: GamePhase | null } }

  // MiniGame Actions
  | { type: 'START_MINI_GAME', payload: { loser: Player, winner?: Player | null, gameType: MiniGameType } }
  | { type: 'SET_MINI_GAME_CONTENT', payload: { question: string, options: string[] | null } }
  | { type: 'SET_MINI_GAME_CHOICE', payload: string | number | null }
  | { type: 'END_MINI_GAME' }

  // Crash Actions
  | { type: 'RESET_CRASH_ROUND', payload: { isNewMainRound: boolean } }
  | { type: 'UPDATE_CRASH_MULTIPLIER', payload: { newMultiplier: number, newTime: number } }
  | { type: 'SET_CRASH_MESSAGE', payload: string[] | null }
  | { type: 'SET_ACTUAL_CRASH_POINT', payload: number | null }
  | { type: 'UPDATE_PLAYER_FOR_CASHOUT', payload: { playerId: string, multiplier: number, newScore: number } }
  | { type: 'UPDATE_PLAYER_FOR_CRASH', payload: { playerId: string, newScore: number } }
  | { type: 'SET_CATCH_UP_INFO', payload: { laggingPlayerName: string, leadingPlayerName: string, multiplierNeeded: string } | null }
  | { type: 'SET_PLAYER_CRASH_BET', payload: { playerId: string, betAmount: number } }

  // Roulette Actions
  | { type: 'RESET_ROULETTE_ROUND', payload: { isNewMainRound: boolean } }
  | { type: 'SET_PLAYER_ROULETTE_BET', payload: { playerId: string, bet: PlayerBet } }
  | { type: 'SET_ROULETTE_RESULT', payload: RouletteResult | null }

  // Contexto Actions
  | { type: 'START_CONTEXTO_LOADING' }
  | { type: 'SET_CONTEXTO_WORD', payload: { secretWord: string, startingPlayerId: string } }
  | { type: 'ADD_CONTEXTO_GUESS', payload: ContextoGuess }
  | { type: 'SET_CONTEXTO_CURRENT_PLAYER', payload: string }
  | { type: 'SET_CONTEXTO_CHECKING_SIMILARITY', payload: boolean }

  // GeoGuessr Actions
  | { type: 'START_GEOGUESSER_LOADING' }
  | { type: 'SET_GEOGUESSER_LOCATION', payload: { locationData: GeoGuessrLocation, startingPlayerId: string } }
  | { type: 'SET_GEOGUESSER_GUESS', payload: { playerId: string, guess: { country: string } } }
  | { type: 'SET_GEOGUESSER_CURRENT_PLAYER', payload: string }
  | { type: 'ADVANCE_GEOGUESSER_ROUND' }
  ;