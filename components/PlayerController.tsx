


import React, { useState, useCallback, useEffect, useReducer } from 'react';
import Button from './Button';
import TextInput from './TextInput';
import { PT_BR } from '../../utils/translations';
import { GamePhase, PeerDataPayload, GameStateSyncPayload } from '../types';
import { useClientConnection } from '../hooks/useClientConnection';
import GenericWaitingScreen from './controls/GenericWaitingScreen';
import CrashBettingControls from './controls/CrashBettingControls';
import CrashActiveControls from './controls/CrashActiveControls';
import RouletteBettingControls from './controls/RouletteBettingControls';
import MiniGameControls from './controls/MiniGameControls';
import { ClientState } from './controls/control-types';

// Mapeamento de fases do jogo para os componentes de controle correspondentes
const phaseToComponentMap: { [key in GamePhase]?: React.ComponentType<any> } = {
    [GamePhase.CRASH_BETTING]: CrashBettingControls,
    [GamePhase.CRASH_ACTIVE]: CrashActiveControls,
    [GamePhase.ROULETTE_BETTING]: RouletteBettingControls,
    [GamePhase.MINI_GAME_DISPLAY]: MiniGameControls,
};

// --- State Management with Reducer for Type Safety ---

const initialState: ClientState = {
    gamePhase: null,
    player: null,
    allPlayers: null,
    losingPlayer: null,
    winningPlayer: null,
    miniGameQuestion: null,
    miniGameAnswerOptions: null,
    currentMiniGameType: null,
    miniGamePlayerChoice: null,
    currentMultiplier: 1,
    playerBets: {},
    rouletteResult: null,
    crashMessage: null,
    actualCrashPointValue: null,
    isDrawCrashOutcome: false,
    crashIterationCount: 1,
    catchUpInfo: null,
    rouletteIteration: 1,
    secretWord: null,
    guessedWords: [],
    currentPlayerId: null,
    isCheckingSimilarity: false,
    isLoadingSecretWord: false,
    locationData: null,
    geoGuessrRound: 1,
    isLoadingLocation: false,
};

type ReducerAction =
  | { type: 'RESET_STATE' }
  | { type: 'GAME_STATE_SYNC', payload: { syncData: GameStateSyncPayload, ownName: string } };


function clientStateReducer(state: ClientState, action: ReducerAction): ClientState {
  switch (action.type) {
    case 'RESET_STATE':
      return initialState;
    case 'GAME_STATE_SYNC': {
        const { syncData, ownName } = action.payload;
        // Use the new player list from sync data, or fall back to the existing one.
        const playerList = syncData.allPlayers || state.allPlayers;
        // Find the player object that corresponds to this client.
        const ownPlayer = playerList ? playerList.find(p => p.name.toLowerCase() === ownName.toLowerCase()) : null;

        return { ...state, ...syncData, player: ownPlayer || null };
    }
    default:
      return state;
  }
}

// --- PlayerController Component ---

const PlayerController: React.FC = () => {
    const [roomCode, setRoomCode] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const [clientState, dispatch] = useReducer(clientStateReducer, initialState);
    
    const resetUI = useCallback((message?: string | null) => {
        dispatch({ type: 'RESET_STATE' });
        setRoomCode('');
        setPlayerName('');
        setFormError(message || null);
    }, [dispatch]);

    const handleDataReceived = useCallback((_connId: string, data: PeerDataPayload) => {
        // This switch statement acts as a router for incoming data from the host.
        // The only message that should alter game state now is GAME_STATE_SYNC.
        switch (data.type) {
            case 'GAME_STATE_SYNC':
                dispatch({ type: 'GAME_STATE_SYNC', payload: { syncData: data.payload, ownName: playerName.trim() } });
                break;
            case 'ERROR':
                setFormError(data.payload.message);
                break;
            case 'KICK':
                // When kicked by the host, reset the entire UI back to the login screen.
                resetUI(data.payload.message);
                break;
        }
    }, [dispatch, resetUI, playerName]);

    const { resetClientError, ...peerProps } = useClientConnection({
        onDataReceived: handleDataReceived,
    });
    
    const {
        connectToHost,
        sendData,
        error: connectionError,
        connectionStatus,
    } = peerProps;

    // Effect to handle connection state changes, especially errors.
    useEffect(() => {
        if (connectionStatus === 'error' && connectionError) {
            resetUI(connectionError);
            resetClientError();
        }
    }, [connectionStatus, connectionError, resetUI, resetClientError]);

    const sendAction = useCallback((action: string, value?: any) => {
        sendData({ type: 'PLAYER_ACTION', payload: { action, value } });
    }, [sendData]);

    useEffect(() => {
        if (connectionStatus === 'connected') {
            sendData({ type: 'IDENTIFY', payload: { name: playerName.trim() } });
        }
    }, [connectionStatus, playerName, sendData]);

    const handleConnect = () => {
        if (!roomCode.trim() || !playerName.trim()) {
            setFormError('Por favor, preencha seu nome e o código da sala.');
            return;
        }
        setFormError(null);
        connectToHost(roomCode.trim().toUpperCase());
    };

    const renderGameControls = () => {
        if (!clientState.gamePhase || !clientState.player) {
            const connectedIcon = (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-green-400 mx-auto mb-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
            return (
                 <div className="flex flex-col items-center text-center animate-fadeIn">
                    <GenericWaitingScreen message={PT_BR.connectedAndWaiting} icon={connectedIcon} />
                    <p className="text-purple-200 mt-4">Você é <span className="font-bold text-white">{playerName}</span>.</p>
                 </div>
            );
        }
        
        switch (clientState.gamePhase) {
            case GamePhase.GAME_CUSTOMIZATION: return <GenericWaitingScreen message={PT_BR.hostIsCustomizing} />;
            case GamePhase.GAME_PAUSED_DISCONNECTED:
                const disconnectedIcon = ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-yellow-400 mx-auto mb-4"> <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /> </svg> );
                return <GenericWaitingScreen message={PT_BR.opponentDisconnected} icon={disconnectedIcon}/>;
            case GamePhase.CRASH_READY: return <GenericWaitingScreen message="Prepare-se para o início!" />;
            case GamePhase.CRASH_ENDED: return <GenericWaitingScreen message="Rodada finalizada..." />;
            case GamePhase.ROULETTE_SPINNING: return <GenericWaitingScreen message="A roleta está girando!" />;
            case GamePhase.ROULETTE_ENDED: return <GenericWaitingScreen message="Calculando resultados..." />;
            case GamePhase.GAME_OVER: return <p className="text-2xl text-yellow-300 font-bold text-center">Fim de Jogo!</p>;
        }

        const ComponentToRender = phaseToComponentMap[clientState.gamePhase];
        if (ComponentToRender) {
            return <ComponentToRender gameState={clientState} sendAction={sendAction} />;
        }

        return <GenericWaitingScreen />;
    }

    if (connectionStatus === 'reconnecting') {
        const reconnectingIcon = ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-spin"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.991-2.691V5.25a2.25 2.25 0 00-2.25-2.25h-6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25h6.75a2.25 2.25 0 002.25 2.25v-2.691z" /> </svg> );
         return (
            <div className="w-full max-w-sm mx-auto p-4 flex flex-col justify-center min-h-screen">
                 <div className="bg-purple-950 bg-opacity-80 p-6 md:p-8 rounded-3xl shadow-2xl text-slate-100 border border-yellow-500 border-opacity-50 min-h-[350px] flex items-center justify-center">
                    <GenericWaitingScreen message="Conexão perdida. Tentando reconectar..." icon={reconnectingIcon} />
                </div>
            </div>
        );
    }
  
    if (connectionStatus === 'connected') {
        return (
            <div className="w-full max-w-sm mx-auto p-4 flex flex-col justify-center min-h-screen">
              <div className="bg-purple-950 bg-opacity-80 p-6 md:p-8 rounded-3xl shadow-2xl text-slate-100 border border-green-500 border-opacity-50 min-h-[350px] flex items-center justify-center">
                 {renderGameControls()}
              </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-sm mx-auto p-4 flex flex-col justify-center min-h-screen">
          <div className="bg-purple-950 bg-opacity-80 p-6 md:p-8 rounded-3xl shadow-2xl text-slate-100 animate-fadeIn border border-purple-600 border-opacity-30">
            <h1 
              className="text-3xl font-bold text-center mb-6 text-pink-400 tracking-wider"
              style={{textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 0 10px rgba(233, 30, 99, 0.5)'}}
            >
              Controle do Jogador
            </h1>
            <div className="space-y-4">
              <TextInput
                id="playerName"
                label="Seu Nome"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
                autoComplete="off"
                placeholder="Como você quer ser chamado?"
                disabled={connectionStatus === 'connecting'}
              />
              <TextInput
                id="roomCode"
                label="Código da Sala"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={20}
                autoComplete="off"
                placeholder="CÓDIGO EXIBIDO NA TV"
                disabled={connectionStatus === 'connecting'}
                style={{ textTransform: 'uppercase' }}
              />
              {formError && (
                 <div className="mt-2 p-3 bg-red-800 bg-opacity-70 border border-red-600 rounded-md text-center">
                    <p className="text-sm text-red-200">{formError}</p>
                </div>
              )}
               {connectionStatus === 'disconnected' && formError &&
                <Button 
                    onClick={() => setFormError(null)}
                    variant="secondary"
                    className="w-full !mt-2"
                >
                    {PT_BR.tryAgain}
                </Button>}
              <Button 
                onClick={handleConnect}
                size="lg" 
                className="w-full !mt-6 hover:scale-105 !bg-pink-600 hover:!bg-pink-700 focus:ring-pink-500"
                disabled={connectionStatus === 'connecting' || !roomCode.trim() || !playerName.trim()}
              >
                {connectionStatus === 'connecting' ? PT_BR.connecting : 'Conectar'}
              </Button>
            </div>
          </div>
        </div>
    );
};

export default PlayerController;