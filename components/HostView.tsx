
import React from 'react';
import { GameStateProvider, useGame } from '../contexts/GameStateContext';
import { GamePhase, GameModeType } from '../types';
import { PT_BR } from '../utils/translations';
import { TOTAL_ROUNDS, GEO_GUESSER_TOTAL_ROUNDS } from '../constants';

// Component Imports
import LobbyView from './LobbyView';
import GameCustomizationScreen from './GameCustomizationScreen';
import CrashGameView from './CrashGameView';
import RouletteGameView from './RouletteGameView';
import ContextoGameView from './ContextoGameView';
import GeoGuessrGameView from './GeoGuessrGameView';
import MiniGameScreen from './MiniGameScreen';
import EndGameScreen from './EndGameScreen';
import RoundBriefing from './RoundBriefing';
import ErrorToast from './ErrorToast';
import InstructionModal from './InstructionModal';

// --- Icons ---
const SpeakerWaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="speaker-icon">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
  </svg>
);
const SpeakerXMarkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="speaker-icon">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
  </svg>
);

const HostViewContent: React.FC = () => {
    const state = useGame();

    const renderContent = () => {
    switch (state.gamePhase) {
      case GamePhase.PLAYER_SETUP:
        return <LobbyView />;
      
      case GamePhase.GAME_CUSTOMIZATION:
        return <GameCustomizationScreen />;

      case GamePhase.CRASH_BETTING:
      case GamePhase.CRASH_READY:
      case GamePhase.CRASH_ACTIVE:
      case GamePhase.CRASH_ENDED:
        return state.players[0] ? <CrashGameView /> : null;
      
      case GamePhase.ROULETTE_BETTING:
      case GamePhase.ROULETTE_SPINNING:
      case GamePhase.ROULETTE_ENDED:
          return state.players.length > 0 ? <RouletteGameView /> : null;

      case GamePhase.CONTEXTO_LOADING_SECRET_WORD:
      case GamePhase.CONTEXTO_PLAYING:
      case GamePhase.CONTEXTO_ROUND_OVER:
        return state.players.length > 0 && state.currentPlayerId ? <ContextoGameView /> : null;

      case GamePhase.GEO_GUESSER_LOADING_LOCATION:
      case GamePhase.GEO_GUESSER_PLAYER_GUESSING:
      case GamePhase.GEO_GUESSER_REVEAL_ANSWER:
          return state.players.length > 0 && state.currentPlayerId ? <GeoGuessrGameView /> : null;

      case GamePhase.MINI_GAME_LOADING:
      case GamePhase.MINI_GAME_DISPLAY:
        return state.losingPlayer && state.players[0] ? <MiniGameScreen /> : null;
        
      case GamePhase.GAME_OVER:
        return state.players.length >= 2 ? <EndGameScreen /> : null;

      case GamePhase.GAME_PAUSED_DISCONNECTED:
        return (
           <div className="bg-black bg-opacity-70 p-6 md:p-10 rounded-xl shadow-2xl text-white text-center max-w-lg mx-auto animate-viewEnter">
              <h2 className="text-3xl font-bold text-yellow-400 mb-4">{PT_BR.gamePausedTitle}</h2>
              {state.disconnectedPlayer && <p className="text-lg mb-4">{PT_BR.playerDisconnected(state.disconnectedPlayer.name)}</p>}
              <p className="text-purple-200 mb-6">{PT_BR.waitingForReconnection}</p>
              <div className="animate-pulseSlow my-4">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-16 h-16 text-yellow-500 mx-auto">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                 </svg>
              </div>
              <button
                 onClick={state.handleBackToPlayerSetup}
                 className="mt-6 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors"
              >
                  {PT_BR.endGameDueToDisconnect}
              </button>
           </div>
        );

      default:
        return <p>Carregando...</p>;
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2">
      <button 
        onClick={state.handleToggleMute}
        className="fixed top-4 right-4 z-50 p-2 bg-purple-900 bg-opacity-70 rounded-full text-white hover:bg-opacity-100 transition-all duration-200"
        aria-label={state.isMuted ? "Ativar som" : "Desativar som"}
      >
        {state.isMuted ? <SpeakerXMarkIcon /> : <SpeakerWaveIcon />}
      </button>

       {state.errorToast && (
        <ErrorToast
          key={state.errorToast.id}
          message={state.errorToast.message}
          onClose={() => state.setErrorToast(null)}
        />
      )}

      <main className="w-full max-w-3xl">
        {renderContent()}
      </main>

      {state.showInstructionModal && (
        <InstructionModal />
      )}

      {state.roundBriefing && (
        <RoundBriefing
          title={state.roundBriefing.title}
          message={state.roundBriefing.message}
          onContinue={state.handleContinueFromBriefing}
          autoContinueDelay={state.roundBriefing.autoContinueDelay}
          iconType={state.roundBriefing.icon}
          buttonText={state.roundBriefing.buttonText}
          p1Name={state.players[0]?.name}
          p1Score={state.players[0]?.score}
          p2Name={state.players[1]?.name}
          p2Score={state.players[1]?.score}
        />
      )}
    </div>
  );
};


const HostView: React.FC = () => {
    return (
        <GameStateProvider>
            <HostViewContent />
        </GameStateProvider>
    );
};

export default HostView;
