

import { ClientState } from './components/controls/control-types';

export enum Gender {
  MASCULINO = 'Masculino',
  FEMININO = 'Feminino',
  OUTRO = 'Outro',
}

export interface Player {
  id: string;
  name: string;
  score: number;
  gender: Gender;
  hasCashedOut: boolean; // Specific to Crash mode
  cashOutMultiplier: number | null; // Specific to Crash mode
  keyLabel: string;
  controlKey: string;
  currentRoundBetAmount: number | null; // For Crash mode: the confirmed bet for the current round
  selectedBetForConfirmation: number; // For Crash mode UI: temporary bet selection before confirmation
  // GeoGuessr specific - stores current guess for a round
  geoGuessrGuess?: { country?: string; continent?: string; } | null;
}

export enum MiniGameType {
  VERDADE = 'Verdade',
  EU_NUNCA = 'Eu Nunca',
  FARIA_NAO_FARIA = 'Faria ou Não Faria?',
  QUIZ_CASAL = 'Quiz do Casal',
}

export enum GamePhase {
  PLAYER_SETUP = 'PLAYER_SETUP',
  GAME_CUSTOMIZATION = 'GAME_CUSTOMIZATION',
  GAME_PAUSED_DISCONNECTED = 'GAME_PAUSED_DISCONNECTED',
  // Crash Game Phases
  CRASH_BETTING = 'CRASH_BETTING', // New phase for betting before countdown
  CRASH_READY = 'CRASH_READY', // Countdown phase
  CRASH_ACTIVE = 'CRASH_ACTIVE',
  CRASH_ENDED = 'CRASH_ENDED',
  // Roulette Game Phases
  ROULETTE_BETTING = 'ROULETTE_BETTING',
  ROULETTE_SPINNING = 'ROULETTE_SPINNING',
  ROULETTE_ENDED = 'ROULETTE_ENDED',
  // Contexto Game Phases
  CONTEXTO_LOADING_SECRET_WORD = 'CONTEXTO_LOADING_SECRET_WORD',
  CONTEXTO_PLAYING = 'CONTEXTO_PLAYING',
  CONTEXTO_ROUND_OVER = 'CONTEXTO_ROUND_OVER', // Intermediate phase before briefing
  // GeoGuessr Game Phases
  GEO_GUESSER_LOADING_LOCATION = 'GEO_GUESSER_LOADING_LOCATION',
  GEO_GUESSER_PLAYER_GUESSING = 'GEO_GUESSER_PLAYER_GUESSING',
  GEO_GUESSER_REVEAL_ANSWER = 'GEO_GUESSER_REVEAL_ANSWER',
  // Minigame Phases
  MINI_GAME_LOADING = 'MINI_GAME_LOADING',
  MINI_GAME_DISPLAY = 'MINI_GAME_DISPLAY',
  GAME_OVER = 'GAME_OVER',
}

export enum GameModeType {
  CRASH = 'Crash',
  ROULETTE = 'Roleta',
  CONTEXTO = 'Contexto',
  GEO_GUESSER = 'GeoGuessr',
}

export interface CrashDataPoint {
  time: number; // Represents an abstract time unit or tick
  multiplier: number;
}

// Roulette Specific Types
export enum BetColor {
  RED = 'RED',
  BLACK = 'BLACK',
  GREEN = 'GREEN',
}

export interface PlayerBet {
  playerId: string;
  color: BetColor;
  amount: number; // Amount bet by the player
}

export interface RouletteSegment {
  number: number;
  color: BetColor;
  // Order in the ROULETTE_WHEEL_SEGMENTS array determines visual position
}

export interface RouletteResult {
  winningColor: BetColor;
  winningNumber: number; 
  winningSegmentIndex?: number; // Index in the ROULETTE_WHEEL_SEGMENTS array
}

// Contexto Specific Types
export interface ContextoGuess {
  word: string;
  rank: number;
  playerId: string;
}

// GeoGuessr Specific Types
export interface GeoGuessrLocation {
  description: string; // Textual clues, still useful as secondary hint
  targetCity?: string | null;
  targetCountry: string;
  targetContinent: string;
  imageUrl: string | null; // base64 data URL of the generated image
}

// --- Peer-to-Peer Communication Message Types ---

// Unified state sync message payload. This mirrors the `ClientState` type
// from `control-types.ts` to avoid circular dependencies.
export type GameStateSyncPayload = Partial<Omit<ClientState, 'player'>>;


export interface GameStateSyncMessage {
    type: 'GAME_STATE_SYNC';
    payload: GameStateSyncPayload;
}


export interface ErrorMessage {
    type: 'ERROR';
    payload: { message: string };
}

export interface KickMessage {
    type: 'KICK';
    payload: { message: string };
}

export interface IdentifyMessage {
    type: 'IDENTIFY';
    payload: { name: string };
}

export interface PlayerActionMessage {
    type: 'PLAYER_ACTION';
    payload: { action: string; value?: any };
}

export type PeerDataPayload = 
    | GameStateSyncMessage
    | ErrorMessage
    | KickMessage
    | IdentifyMessage
    | PlayerActionMessage;