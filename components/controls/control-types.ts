// File: components/controls/control-types.ts
import { GamePhase, Player, MiniGameType, PlayerBet, RouletteResult, ContextoGuess, GeoGuessrLocation } from '../../types';

/**
 * Defines the complete, typed state that a client controller can have.
 * This is assembled on the client from various messages sent by the host.
 */
export interface ClientState {
  gamePhase: GamePhase | null;
  player: Player | null;
  allPlayers: Player[] | null;

  // minigame state
  losingPlayer: Player | null;
  winningPlayer: Player | null;
  miniGameQuestion: string | null;
  miniGameAnswerOptions: string[] | null;
  currentMiniGameType: MiniGameType | null;
  miniGamePlayerChoice: string | number | null;

  // logic state for different game modes
  // Crash
  currentMultiplier?: number;
  crashMessage?: string[] | null;
  actualCrashPointValue?: number | null;
  isDrawCrashOutcome?: boolean;
  crashIterationCount?: number;
  catchUpInfo?: { laggingPlayerName: string; leadingPlayerName: string; multiplierNeeded: string; } | null;
  
  // Roulette
  playerBets?: Record<string, PlayerBet>;
  rouletteResult?: RouletteResult | null;
  rouletteIteration?: number;

  // Contexto
  secretWord?: string | null;
  guessedWords?: ContextoGuess[];
  currentPlayerId?: string;
  isCheckingSimilarity?: boolean;
  isLoadingSecretWord?: boolean;

  // GeoGuessr
  locationData?: GeoGuessrLocation | null;
  geoGuessrRound?: number;
  isLoadingLocation?: boolean;
}


/**
 * Define a assinatura da função para enviar ações do controle do jogador para o host.
 * @param action O tipo de ação a ser executada (ex: 'CASH_OUT', 'CONFIRM_CRASH_BET').
 * @param value O payload opcional associado à ação.
 */
export type SendActionFunc = (action: string, value?: any) => void;

/**
 * Define as props compartilhadas que cada componente de controle do jogador receberá.
 */
export interface ControlProps {
  /**
   * O objeto de estado do jogo completo, recebido do host e montado no cliente.
   * É fortemente tipado com a interface ClientState.
   */
  gameState: ClientState;

  /**
   * A função para enviar uma ação de volta para o host.
   */
  sendAction: SendActionFunc;
}
