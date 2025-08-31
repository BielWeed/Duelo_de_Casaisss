
import { RouletteSegment, BetColor } from './types';

export const INITIAL_SCORE = 150;
export const TOTAL_ROUNDS = 9; // Max rounds for Crash/Roulette if not won by points earlier
export const PLAYER_1_CONTROL_KEY = 'ArrowLeft';
export const PLAYER_2_CONTROL_KEY = 'ArrowRight';

export const MAIN_ROUND_TARGET_SCORE = 300; // For Crash/Roulette
export const MAIN_ROUND_BANKRUPT_SCORE = 0; // For Crash/Roulette

// Crash game mechanics
export const CRASH_MULTIPLIER_INCREMENT = 0.01; // How much multiplier increases each tick
export const CRASH_TICK_INTERVAL_MS = 55; // Base speed of multiplier increase
export const CRASH_INTERVAL_REDUCTION_PER_MULTIPLIER = 15; // e.g., reduce interval by 15ms for each 1.0x increase in multiplier
export const CRASH_MIN_TICK_INTERVAL_MS = 25; // Minimum interval allowed between ticks
export const CRASH_POST_MESSAGE_DELAY_MS = 1500; // Delay after crash message before determining outcome
export const MAX_CRASH_MULTIPLIER_CAP = 50; // Maximum multiplier the crash can reach
export const PREDEFINED_CRASH_BET_VALUES = [10, 25, 50];

export const BASE_CRASH_PROBABILITY = 0.004; 
export const PROBABILITY_INCREASE_PER_MULTIPLIER_UNIT = 0.0025; 
export const PROBABILITY_INCREASE_PER_SECOND_ELAPSED = 0.0008; 
export const MIN_MULTIPLIER_BEFORE_CRASH_CAN_OCCUR = 1.05; 
export const MIN_DURATION_MS_BEFORE_CRASH_CAN_OCCUR = 1500; 

// Sound files
export const SOUND_FILES = {
  CLICK: 'click.wav',
  CASHOUT: 'cashout.wav',
  CRASH: 'crash.wav',
  COUNTDOWN_TICK: 'tick.wav',
  MINIGAME_START: 'minigame_start.wav',
  SELECT: 'select.wav',
  ROULETTE_SPIN: 'roulette_spin.wav',
  ROULETTE_STOP: 'roulette_stop.wav',
};

// LocalStorage Keys
export const MUTE_STORAGE_KEY = 'dueloDeCasaisMutePreference';

// Roulette game mechanics
export const ROULETTE_PAYOUTS = {
  [BetColor.RED]: 2,   
  [BetColor.BLACK]: 2, 
  [BetColor.GREEN]: 5, 
};
export const ROULETTE_WHEEL_SEGMENTS: RouletteSegment[] = [
  { number: 0, color: BetColor.GREEN }, { number: 1, color: BetColor.RED },
  { number: 2, color: BetColor.BLACK }, { number: 3, color: BetColor.RED },
  { number: 4, color: BetColor.BLACK }, { number: 5, color: BetColor.GREEN },
  { number: 6, color: BetColor.RED }, { number: 7, color: BetColor.BLACK },
  { number: 8, color: BetColor.RED }, { number: 9, color: BetColor.BLACK },
];
export const ROULETTE_SPIN_DURATION_MS = 5000;
export const ROULETTE_DECELERATION_DURATION_MS = 2500; 
export const ROULETTE_RESULT_DISPLAY_MS = ROULETTE_DECELERATION_DURATION_MS + 300; 
export const ROULETTE_NUMBER_OF_REVOLUTIONS = 3; 

// GeoGuessr Game Constants
export const GEO_GUESSER_TOTAL_ROUNDS = 5;
export const GEO_GUESSER_POINTS_COUNTRY = 3000;
export const GEO_GUESSER_POINTS_CONTINENT = 1000;
export const GEO_GUESSER_POINTS_CITY = 5000; // If city guessing is implemented
