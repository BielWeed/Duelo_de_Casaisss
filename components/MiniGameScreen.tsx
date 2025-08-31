
import React, { useState, useEffect } from 'react';
import { MiniGameType, Player, GameModeType, GamePhase } from '../types';
import { PT_BR } from '../utils/translations';
import Button from './Button';
import PlayerScoreboard from './PlayerScoreboard';
import { playSound } from '../utils/soundManager';
import { useGame } from '../contexts/GameStateContext';
import { TOTAL_ROUNDS } from '../constants';

// --- Loading Icons ---
const LoadingMagnifyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-16 h-16 sm:w-20 sm:h-20 text-pink-400 animate-loading-magnify-pulse">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);
const LoadingHandRaiseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 sm:w-20 sm:h-20 text-pink-400 animate-loading-hand-raise">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 6.068L14.303 5.29C13.704 4.795 13.009 4.561 12.279 4.561C11.55 4.561 10.855 4.795 10.255 5.29L9.377 6.068M15.182 6.068V11.25m-5.805 0V6.068m0 0C9.377 6.068 8.088 6.341 7.343 6.341S5.91 6.886 5.91 7.631v2.38C5.91 10.705 6.6 11.25 7.343 11.25s2.034 0 2.034 0m5.805 0c0 0 1.29.273 2.034.273S18.09 10.705 18.09 10.011v-2.38c0-.745-.745-1.29-1.49-1.29s-2.034 0-2.034 0M12 4.875c-2.998 0-5.661 1.438-7.166 3.557M12 4.875c2.998 0 5.661 1.438 7.166 3.557m-7.166 14.25c-2.998 0-5.661-1.438-7.166-3.557M12 19.125c2.998 0 5.661 1.438 7.166 3.557" />
  </svg>
);
const LoadingArrowsChoiceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-16 h-16 sm:w-20 sm:h-20 text-pink-400 animate-loading-arrows-choice">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h18M16.5 3 21 7.5m0 0L16.5 12M21 7.5H3" />
  </svg>
);
const LoadingThinkingBubbleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 sm:w-20 sm:h-20 text-pink-400 animate-loading-thinking-bubble">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-3.4 8.25-7.75 8.25L12 21.75l-1.25-.5c-4.35 0-7.75-3.694-7.75-8.25S6.65 3.75 11 3.75h2c4.35 0 7.75 3.694 7.75 8.25z" />
    <circle cx="8.25" cy="12" r="0.5" className="fill-pink-300 thinking-dot" />
    <circle cx="12" cy="12" r="0.5" className="fill-pink-300 thinking-dot" />
    <circle cx="15.75" cy="12" r="0.5" className="fill-pink-300 thinking-dot" />
  </svg>
);

const ErrorIcon = () => ( // Glitching Robot/Face
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 sm:w-20 sm:h-20 text-red-400 animate-icon-error-glitch">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h-.093A1.5 1.5 0 006 9v3.75A1.5 1.5 0 007.5 14.25h.093m9-6.75h.093A1.5 1.5 0 0118 9v3.75a1.5 1.5 0 01-1.5 1.5h-.093M12 7.5V5.25m0 9V12.75" opacity="0.6" transform="skewX(-3)"/>
  </svg>
);
// --- End Loading Icons ---

interface MiniGameScreenProps {}

const MiniGameScreen: React.FC<MiniGameScreenProps> = () => {
  const {
    players,
    currentRound,
    losingPlayer,
    winningPlayer,
    miniGameQuestion: question,
    miniGameAnswerOptions: answerOptions,
    currentMiniGameType: miniGameType,
    gamePhase,
    adultMode,
    selectedGameMode: gameMode,
    miniGamePlayerChoice: playerChoice,
    mainRoundsWon,
  } = useGame();

  if (!players || players.length === 0 || !losingPlayer) {
      return null; // Or a loading/error state
  }

  const player1 = players[0];
  const player2 = players[1] || null;
  const isLoading = gamePhase === GamePhase.MINI_GAME_LOADING;
  
  const getGameName = () => {
    if (!miniGameType) return '';
    switch (miniGameType) {
      case MiniGameType.VERDADE: return PT_BR.truthGameName;
      case MiniGameType.EU_NUNCA: return PT_BR.neverHaveIEverGameName;
      case MiniGameType.FARIA_NAO_FARIA: return PT_BR.wouldIDoItGameName;
      case MiniGameType.QUIZ_CASAL: return PT_BR.couplesQuizGameName;
      default: return '';
    }
  };

  const getThematicLoadingTextAndIcon = () => {
    if (!miniGameType) return { text: PT_BR.generatingQuestion, icon: <LoadingThinkingBubbleIcon /> };
    switch (miniGameType) {
      case MiniGameType.VERDADE: return { text: PT_BR.generatingTruthQuestion, icon: <LoadingMagnifyIcon /> };
      case MiniGameType.EU_NUNCA: return { text: PT_BR.generatingNeverHaveIEverQuestion, icon: <LoadingHandRaiseIcon /> };
      case MiniGameType.FARIA_NAO_FARIA: return { text: PT_BR.generatingWouldIDoItQuestion, icon: <LoadingArrowsChoiceIcon /> };
      case MiniGameType.QUIZ_CASAL: return { text: PT_BR.generatingCouplesQuizQuestion, icon: <LoadingThinkingBubbleIcon /> };
      default: return { text: PT_BR.generatingQuestion, icon: <LoadingThinkingBubbleIcon /> };
    }
  };

  const showQuizLayout = (miniGameType === MiniGameType.QUIZ_CASAL) && answerOptions && answerOptions.length === 4;
  const showBinaryChoices = miniGameType === MiniGameType.EU_NUNCA || miniGameType === MiniGameType.FARIA_NAO_FARIA || miniGameType === MiniGameType.VERDADE;

  const renderBinaryChoiceButtons = () => {
    if (!showBinaryChoices) return null;
    let choices: { text: string, value: string }[] = [];
    switch (miniGameType) {
      case MiniGameType.EU_NUNCA:
        choices = [{ text: PT_BR.iHaveDoneIt, value: PT_BR.iHaveDoneIt }, { text: PT_BR.iHaveNeverDoneIt, value: PT_BR.iHaveNeverDoneIt }]; break;
      case MiniGameType.FARIA_NAO_FARIA:
        choices = [{ text: PT_BR.iWouldDoIt, value: PT_BR.iWouldDoIt }, { text: PT_BR.iWouldNotDoIt, value: PT_BR.iWouldNotDoIt }]; break;
      case MiniGameType.VERDADE: 
        choices = [{ text: PT_BR.itsTrue, value: PT_BR.itsTrue }, { text: PT_BR.itsALie, value: PT_BR.itsALie }]; break;
      default: return null;
    }

    return (
      <div className="mt-auto pt-4 grid grid-cols-2 gap-3 md:gap-4 w-full">
        {choices.map((choice) => {
          const isSelected = playerChoice === choice.value;
          return (
            <div
              key={choice.value}
              className={`w-full !text-sm md:!text-base !py-2.5 md:!py-3 transform transition-all duration-200 ease-in-out rounded-lg flex items-center justify-center
                          ${isSelected 
                              ? 'bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 text-white shadow-xl ring-2 ring-pink-300 ring-offset-2 ring-offset-purple-950 scale-105 font-bold brightness-110' 
                              : 'bg-purple-700 text-purple-100 border border-purple-500 shadow-md'
                          }`}
              aria-selected={isSelected}
            >
              {choice.text}
            </div>
          );
        })}
      </div>
    );
  };
  
  const truthStatementParts = miniGameType === MiniGameType.VERDADE && question?.startsWith(PT_BR.truthGameName + " ou Mentira:") 
      ? { prefix: PT_BR.truthGameName + " ou Mentira:", statement: question.substring((PT_BR.truthGameName + " ou Mentira:").length).trim() }
      : miniGameType === MiniGameType.VERDADE && question?.toLowerCase().startsWith("verdade ou mentira:")
      ? { prefix: question.substring(0, question.toLowerCase().indexOf("verdade ou mentira:") + "Verdade ou Mentira:".length), statement: question.substring(question.toLowerCase().indexOf("verdade ou mentira:") + "Verdade ou Mentira:".length).trim() }
      : null;

  const { text: loadingText, icon: loadingIcon } = getThematicLoadingTextAndIcon();
  const playersForScoreboard = [player1, player2].filter(p => p !== null) as Player[];

  return (
    <>
      <PlayerScoreboard
        players={playersForScoreboard}
        mainRoundsWon={mainRoundsWon}
        currentRound={currentRound}
        totalRounds={TOTAL_ROUNDS}
        hideKeyLabels={true}
        activePlayerId={losingPlayer.id}
        gameMode={gameMode}
      />

      <div className={`bg-black bg-opacity-50 p-4 md:p-5 rounded-xl text-white w-full mt-3 sm:mt-4 flex-grow flex flex-col shadow-xl border-2 border-purple-600 border-opacity-40 min-h-[380px] sm:min-h-[450px]`}>
        {isLoading && (
          <div className="flex-grow flex flex-col items-center justify-center">
            {loadingIcon}
            <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-pink-300">{loadingText}</p>
          </div>
        )}

        {!isLoading && question && (
          <div className="flex flex-col flex-grow animate-fadeInUpShort">
            <h2
              className="text-2xl sm:text-3xl font-extrabold text-center text-pink-400 mb-1 tracking-wide"
              style={{ textShadow: '0 1px 1px rgba(0,0,0,0.6), 0 0 12px rgba(236,72,153,0.7), 0 0 20px rgba(236,72,153,0.5)' }}
            >
              {getGameName()}
              {adultMode && <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full ml-1 sm:ml-2 align-middle"> +18</span>}
            </h2>
            <p className="text-center text-lg sm:text-xl text-yellow-300 mb-2 font-bold animate-pulseSlow" style={{animationIterationCount: 2, animationDuration: '1.5s'}}>
              {PT_BR.loserIs(losingPlayer.name)}
            </p>
             {(miniGameType === MiniGameType.QUIZ_CASAL) && winningPlayer && (
                <p className="text-center text-sm sm:text-base text-purple-200 mb-3 sm:mb-4 font-semibold">
                  Responda sobre {winningPlayer.name}:
                </p>
            )}

            {showQuizLayout ? (
              <div className="flex-grow grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-stretch">
                <div className="md:col-span-5 bg-purple-900 bg-opacity-60 p-3 sm:p-4 rounded-xl flex items-center justify-center min-h-[120px] md:min-h-full shadow-lg border border-purple-500">
                  <p className="text-sm sm:text-md md:text-base text-center text-white leading-relaxed whitespace-pre-wrap overflow-y-auto max-h-[200px] md:max-h-[250px]" style={{textShadow: '0 1px 2px rgba(0,0,0,0.3)'}}>{question}</p>
                </div>
                <div className="md:col-span-7 space-y-2 sm:space-y-3 flex flex-col justify-center">
                  {answerOptions!.map((option, index) => {
                    const isSelected = playerChoice === index;
                    return (
                        <div
                        key={index}
                        className={`p-2.5 sm:p-3 rounded-lg text-left w-full transform transition-all duration-200 ease-in-out border-2 text-xs sm:text-sm
                                    ${isSelected
                                        ? 'bg-gradient-to-r from-pink-500 to-fuchsia-600 border-fuchsia-400 text-white ring-1 sm:ring-2 ring-pink-300 shadow-xl scale-105 font-semibold ring-offset-1 ring-offset-purple-950'
                                        : 'bg-purple-700 border-purple-500 text-gray-200 shadow-md'
                                    }`}
                        aria-selected={isSelected}
                        >
                        <span className={`font-semibold mr-1.5 sm:mr-2 ${isSelected ? 'text-yellow-300' : 'text-pink-300'}`}>{String.fromCharCode(65 + index)}.</span> {option}
                        </div>
                    );
                  })}
                </div>
              </div>
            ) : ( 
              <div className={`flex-grow flex flex-col bg-gradient-to-br from-purple-800 via-purple-900 to-indigo-950 bg-opacity-70 p-4 sm:p-6 rounded-xl shadow-xl border border-purple-500 min-h-[200px] sm:min-h-[280px] justify-between mt-2 sm:mt-3`}>
                 {miniGameType === MiniGameType.VERDADE && truthStatementParts ? (
                    <div className="flex-grow flex flex-col items-center justify-center py-2 sm:py-4">
                        <div className="bg-indigo-950 bg-opacity-70 border-2 border-purple-400 border-dashed p-3 sm:p-4 rounded-lg shadow-inner w-full">
                            <p className="text-center text-lg sm:text-xl md:text-2xl leading-relaxed whitespace-pre-wrap">
                                <span className="font-bold text-pink-300">{truthStatementParts.prefix}</span> {truthStatementParts.statement}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center py-2 sm:py-4">
                        <p className="text-white text-xl sm:text-2xl md:text-3xl text-center leading-normal md:leading-relaxed whitespace-pre-wrap" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>{question}</p>
                    </div>
                )}
                {renderBinaryChoiceButtons()}
              </div>
            )}

            {playerChoice !== null && (
                <div className="w-full mt-auto pt-4 sm:pt-6 text-center">
                    <p className="text-lg text-yellow-300 font-semibold animate-pulseSlow">
                        Escolha recebida! Aguardando resultado...
                    </p>
                </div>
            )}
          </div>
        )}
        
        {!isLoading && !question && ( 
          <div className="flex-grow flex flex-col items-center justify-center text-center animate-fadeInUpShort">
            <ErrorIcon />
            <p className="mt-2 sm:mt-3 text-md sm:text-lg text-red-300 leading-relaxed">{PT_BR.errorFetchingQuestion}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default MiniGameScreen;