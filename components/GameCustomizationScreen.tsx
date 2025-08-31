
import React, { useState } from 'react';
import { Gender, MiniGameType, GameModeType } from '../types';
import { PT_BR } from '../utils/translations';
import Button from './Button';
import ToggleSwitch from './ToggleSwitch';
import { useGame } from '../contexts/GameStateContext';

// --- SVG Icons for Minigames ---
const TruthIcon = () => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3.686-3.091c-.94.180-1.933.29-2.986.29h-.288c-1.049 0-2.038-.11-2.986-.29l-3.686 3.091v-3.091c-.34-.02-.68-.045-1.02-.072c-1.133-.093-1.98-.993-1.98-2.193V10.608c0-.97.616-1.813 1.5-2.097c.564-.181 1.148-.28 1.75-.367c.603-.087 1.226-.163 1.875-.224C9.873 7.855 10.93 7.75 12 7.75h.092c1.07 0 2.13.105 3.125.308c.649.061 1.272.137 1.875.224c.602.086 1.186.185 1.75.367Z" />
  </svg>
);
const NeverHaveIEverIcon = () => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 6.068L14.303 5.29C13.704 4.795 13.009 4.561 12.279 4.561C11.55 4.561 10.855 4.795 10.255 5.29L9.377 6.068M15.182 6.068C15.841 6.484 16.388 7.089 16.753 7.819M15.182 6.068V11.25M9.377 6.068C8.719 6.484 8.171 7.089 7.807 7.819M9.377 6.068V11.25m0 0C9.377 11.25 8.088 11.25 7.343 11.25C6.6 11.25 6.157 10.705 6.157 10.011L6.157 7.58C6.157 6.886 6.6 6.341 7.343 6.341C8.088 6.341 9.377 6.341 9.377 6.341M15.182 11.25C15.182 11.25 16.472 11.25 17.216 11.25C17.96 11.25 18.404 10.705 18.404 10.011L18.404 7.58C18.404 6.886 17.96 6.341 17.216 6.341C16.472 6.341 15.182 6.341 15.182 6.341M12 7.875V13.5M7.807 7.819C7.424 8.418 7.233 9.095 7.233 9.789V10.011C7.233 10.705 7.424 11.382 7.807 11.981M16.753 7.819C17.136 8.418 17.328 9.095 17.328 9.789V10.011C17.328 10.705 17.136 11.382 16.753 11.981M12 4.875C9.002 4.875 6.339 6.313 4.834 8.432M12 4.875C14.998 4.875 17.661 6.313 19.166 8.432M4.834 15.568C6.339 17.687 9.002 19.125 12 19.125M19.166 15.568C17.661 17.687 14.998 19.125 12 19.125" />
  </svg>
);
const WouldIDoItIcon = () => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h18m-7.5-14L21 7.5m0 0L16.5 12M21 7.5H3" />
  </svg>
);
const CouplesQuizIcon = () => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
  </svg>
);
const CheckIcon = () => ( 
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-pink-400">
    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
  </svg>
);

// --- Game Mode Icons ---
const CrashGameIcon = () => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);
const RouletteGameIcon = () => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
  </svg>
);
const ContextoGameIcon = () => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
  </svg>
);
const GeoGuessrGameIcon = () => ( // MapPinIcon
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
);

interface GameCustomizationScreenProps {}

const GameCustomizationScreen: React.FC<GameCustomizationScreenProps> = () => {
  const { handleCustomizationComplete, handleBackToPlayerSetup } = useGame();
  
  const [selectedGameMode, setSelectedGameMode] = useState<GameModeType>(GameModeType.CRASH);
  const allAvailableMiniGameTypes = Object.values(MiniGameType);

  const [selectedMiniGames, setSelectedMiniGames] = useState<MiniGameType[]>(allAvailableMiniGameTypes);
  const [adultMode, setAdultMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const miniGameConfig: Partial<Record<MiniGameType, { name: string; icon: React.FC }>> = {
    [MiniGameType.VERDADE]: { name: PT_BR.truthGameName, icon: TruthIcon },
    [MiniGameType.EU_NUNCA]: { name: PT_BR.neverHaveIEverGameName, icon: NeverHaveIEverIcon },
    [MiniGameType.FARIA_NAO_FARIA]: { name: PT_BR.wouldIDoItGameName, icon: WouldIDoItIcon },
    [MiniGameType.QUIZ_CASAL]: { name: PT_BR.couplesQuizGameName, icon: CouplesQuizIcon },
  };

  const gameModeConfig: Record<GameModeType, { title: string; description: string; icon: React.FC; available: boolean }> = {
    [GameModeType.CRASH]: { title: PT_BR.crashGameMode, description: PT_BR.crashGameDescription, icon: CrashGameIcon, available: true },
    [GameModeType.ROULETTE]: { title: PT_BR.rouletteGameMode, description: PT_BR.rouletteGameDescription, icon: RouletteGameIcon, available: true },
    [GameModeType.CONTEXTO]: { title: PT_BR.contextoGameMode, description: PT_BR.contextoGameDescription, icon: ContextoGameIcon, available: true },
    [GameModeType.GEO_GUESSER]: { title: PT_BR.geoGuessrGameMode, description: PT_BR.geoGuessrGameDescription, icon: GeoGuessrGameIcon, available: true },
  };

  const handleMiniGameToggle = (gameType: MiniGameType) => {
    setSelectedMiniGames(prevSelected =>
      prevSelected.includes(gameType)
        ? prevSelected.filter(g => g !== gameType)
        : [...prevSelected, gameType]
    );
    if (error && selectedMiniGames.length > 0 && selectedGameMode !== GameModeType.CONTEXTO && selectedGameMode !== GameModeType.GEO_GUESSER) { 
      setError(null);
    }
  };

  const handleSelectAllMiniGames = () => {
    setSelectedMiniGames(allAvailableMiniGameTypes);
    if (selectedGameMode !== GameModeType.CONTEXTO && selectedGameMode !== GameModeType.GEO_GUESSER) {
        setError(null);
    }
  };

  const handleDeselectAllMiniGames = () => {
    setSelectedMiniGames([]);
  };
  
  const handleGameModeSelect = (mode: GameModeType) => {
    if (gameModeConfig[mode].available) {
        setSelectedGameMode(mode);
        if (mode === GameModeType.CONTEXTO || mode === GameModeType.GEO_GUESSER) {
            setError(null); // Clear minigame error if Contexto or GeoGuessr is selected
        }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (selectedGameMode !== GameModeType.CONTEXTO && selectedGameMode !== GameModeType.GEO_GUESSER && selectedMiniGames.length === 0) {
      setError(PT_BR.errorNoMinigamesSelected);
      return;
    }
    setError(null);
    setIsSubmitting(true);
    
    const miniGamesForMode = (selectedGameMode === GameModeType.CONTEXTO || selectedGameMode === GameModeType.GEO_GUESSER) ? [] : selectedMiniGames;
    const adultModeForGame = (selectedGameMode === GameModeType.CONTEXTO || selectedGameMode === GameModeType.GEO_GUESSER) ? false : adultMode;

    handleCustomizationComplete(
        selectedGameMode, 
        miniGamesForMode, 
        adultModeForGame
    );
  };
  
  const showMinigameAndAdultOptions = selectedGameMode !== GameModeType.CONTEXTO && selectedGameMode !== GameModeType.GEO_GUESSER;

  return (
    <div className="bg-purple-950 bg-opacity-80 p-6 md:p-8 rounded-3xl shadow-2xl text-slate-100 animate-fadeIn border border-purple-600 border-opacity-30">
      <h1 
        className="text-3xl lg:text-4xl font-bold text-center mb-6 text-pink-400 tracking-wider"
        style={{textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 0 10px rgba(233, 30, 99, 0.5)'}}
      >
        {PT_BR.gameCustomizationTitle}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Game Mode Selection */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-center text-purple-300 mb-4">{PT_BR.selectGameModeTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Adjusted to 2 cols for 4 items */}
            {Object.values(GameModeType).map(mode => {
              const config = gameModeConfig[mode];
              const isSelected = selectedGameMode === mode;
              const Icon = config.icon;
              return (
                <div
                  key={mode}
                  onClick={() => handleGameModeSelect(mode)}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={config.available ? 0 : -1}
                  onKeyDown={(e) => { if (config.available && (e.key === ' ' || e.key === 'Enter')) handleGameModeSelect(mode); }}
                  className={`group relative p-4 rounded-xl transition-all duration-200 ease-in-out border-2
                              flex flex-col items-center text-center
                              ${!config.available ? 'opacity-50 cursor-not-allowed bg-gray-700 border-gray-600' : 
                                isSelected 
                                ? 'bg-purple-700 bg-opacity-70 border-pink-500 shadow-xl ring-2 ring-pink-400 scale-105 cursor-pointer' 
                                : 'bg-purple-800 bg-opacity-50 border-purple-600 hover:border-pink-500 hover:shadow-pink-500/30 hover:bg-purple-700 hover:bg-opacity-60 transform hover:scale-102 cursor-pointer'
                              }`}
                >
                  <div className={`mb-2 p-2 rounded-full ${isSelected ? 'bg-pink-500 bg-opacity-30' : 'bg-purple-600 bg-opacity-50'} group-hover:scale-105 transition-transform duration-150 ease-in-out`}>
                    <Icon />
                  </div>
                  <h3 className={`text-lg font-semibold mb-1 ${isSelected ? 'text-pink-200' : 'text-indigo-100'}`}>{config.title}</h3>
                  <p className={`text-xs ${isSelected ? 'text-purple-200' : 'text-purple-300'}`}>{config.description}</p>
                  {isSelected && config.available && (
                    <div className="absolute top-2 right-2 p-0.5 bg-purple-800 rounded-full animate-iconPopIn">
                      <CheckIcon />
                    </div>
                  )}
                   {!config.available && (
                     <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-semibold bg-black bg-opacity-70 text-yellow-300 px-2 py-1 rounded">EM BREVE</span>
                   )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Minigame Selection and Adult Mode - Conditional Rendering */}
        {showMinigameAndAdultOptions && (
          <div className="animate-fadeIn">
            <div className="pt-2">
              <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-semibold text-purple-300">{PT_BR.minigameSelectionHeader}</h3>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={handleSelectAllMiniGames}
                      disabled={isSubmitting || selectedMiniGames.length === allAvailableMiniGameTypes.length}
                      className="!py-1 !px-2.5 !text-xs !bg-opacity-70 hover:!bg-opacity-100"
                    >
                      {PT_BR.selectAllButtonLabel}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={handleDeselectAllMiniGames}
                      disabled={isSubmitting || selectedMiniGames.length === 0}
                      className="!py-1 !px-2.5 !text-xs !bg-opacity-70 hover:!bg-opacity-100"
                    >
                      {PT_BR.deselectAllButtonLabel}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-indigo-900 bg-opacity-30 rounded-md">
                  {allAvailableMiniGameTypes.map(gameType => {
                    const config = miniGameConfig[gameType];
                    if (!config) return null; 
                    const IconComponent = config.icon;
                    const isSelected = selectedMiniGames.includes(gameType);
                    return (
                      <div
                        key={gameType}
                        onClick={() => !isSubmitting && handleMiniGameToggle(gameType)}
                        role="checkbox"
                        aria-checked={isSelected}
                        tabIndex={isSubmitting ? -1 : 0}
                        onKeyDown={(e) => { if (!isSubmitting && (e.key === ' ' || e.key === 'Enter')) handleMiniGameToggle(gameType); }}
                        className={`group relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 ease-in-out border-2
                                    ${isSubmitting ? 'cursor-default opacity-70' : 'cursor-pointer'}
                                    ${isSelected 
                                      ? 'bg-purple-700 bg-opacity-70 border-pink-500 shadow-lg ring-1 ring-pink-400 scale-105' 
                                      : `bg-purple-800 bg-opacity-50 border-purple-600 ${!isSubmitting ? 'hover:border-pink-500 hover:shadow-pink-500/30 hover:bg-purple-700 hover:bg-opacity-60 transform hover:scale-102' : ''}`
                                    }`}
                      >
                        <div className={`mb-2 p-2 rounded-full ${isSelected ? 'bg-pink-500 bg-opacity-30' : 'bg-purple-600 bg-opacity-40'} ${!isSubmitting ? 'group-hover:scale-110' : ''} transition-transform duration-150 ease-in-out`}>
                          <IconComponent />
                        </div>
                        <span className={`text-xs sm:text-sm font-medium text-center ${isSelected ? 'text-pink-200' : 'text-indigo-100'}`}>
                          {config.name}
                        </span>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 p-0.5 bg-purple-800 rounded-full animate-iconPopIn">
                            <CheckIcon />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {error && <p className="mt-2 text-xs text-red-300 px-1">{error}</p>}
            </div>
            
            <ToggleSwitch
              id="adultModeCustomization"
              label={PT_BR.adultModeLabel}
              checked={adultMode}
              onChange={isSubmitting ? () => {} : setAdultMode}
            />
            {adultMode && (
              <div className="flex items-start text-xs text-yellow-200 bg-yellow-800 bg-opacity-50 p-3 rounded-md animate-fadeIn border border-yellow-700 border-opacity-80 space-x-2" role="alert">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0 text-yellow-400">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <span>{PT_BR.adultModeWarning}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
                type="button" 
                onClick={handleBackToPlayerSetup}
                variant="secondary"
                size="lg" 
                className="w-full sm:w-auto flex-1 hover:scale-105 !bg-purple-600 hover:!bg-purple-700 focus:ring-purple-500"
                disabled={isSubmitting}
            >
            {PT_BR.backButtonLabel}
            </Button>
            <Button 
                type="submit" 
                size="lg" 
                className="w-full sm:w-auto flex-1 hover:scale-105 !bg-pink-600 hover:!bg-pink-700 focus:ring-pink-500"
                disabled={isSubmitting}
            >
            {isSubmitting ? PT_BR.loading : PT_BR.confirmAndStartGame}
            </Button>
        </div>
      </form>
    </div>
  );
};

export default GameCustomizationScreen;
