
import React, { useState, useEffect, useRef } from 'react';
import { Player, GamePhase, GeoGuessrLocation, GameModeType } from '../types';
import { PT_BR } from '../utils/translations';
import PlayerScoreboard from './PlayerScoreboard';
import Button from './Button';
import TextInput from './TextInput';
import { playSound } from '../utils/soundManager';
import { GEO_GUESSER_POINTS_COUNTRY, GEO_GUESSER_POINTS_CONTINENT, GEO_GUESSER_TOTAL_ROUNDS } from '../constants';
import { useGame } from '../contexts/GameStateContext';

// --- Icons ---
const GeoGuessrLoadingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 sm:w-20 sm:h-20 text-teal-400 animate-spin">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A11.978 11.978 0 0112 16.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 003 12c0 .778.099 1.533.284 2.253m0 0A11.978 11.978 0 0012 16.5c2.998 0-5.74 1.1-7.843-2.918M3.75 7.5h16.5M3.75 12h16.5m-16.5 4.5h16.5" />
    </svg>
);

const ImagePlaceholderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24 text-purple-400 opacity-50">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-purple-300 mr-1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-green-400">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
);

const XCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-red-400">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
    </svg>
);

interface GeoGuessrGameViewProps {}

const RevealScreen: React.FC<{
    players: Player[];
    locationData: GeoGuessrLocation;
    onContinue: () => void;
    geoGuessrRound: number;
    totalGeoGuessrRounds: number;
}> = ({ players, locationData, onContinue, geoGuessrRound, totalGeoGuessrRounds }) => {
    const [canContinue, setCanContinue] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setCanContinue(true), 3000); // 3-second delay
        return () => clearTimeout(timer);
    }, []);

    const buttonText = geoGuessrRound < totalGeoGuessrRounds ? PT_BR.nextRound : "Ver Resultado Final";

    return (
        <div className="w-full max-w-2xl mt-2 animate-fadeInUpShort">
            <h2 className="text-2xl font-bold text-center text-yellow-300 mb-3">{PT_BR.geoGuessrRevealTitle}</h2>
            <div className="bg-indigo-950 bg-opacity-70 border-2 border-purple-400 border-dashed p-3 sm:p-4 rounded-lg shadow-inner w-full mb-4">
                <p className="text-center text-lg sm:text-xl md:text-2xl leading-relaxed whitespace-pre-wrap">
                    <span className="font-semibold text-purple-300">{PT_BR.geoGuessrActualLocation(locationData.targetCountry, locationData.targetContinent, locationData.targetCity)}</span>
                </p>
            </div>

            <div className="space-y-3">
                {players.map((player, index) => {
                    const guess = player.geoGuessrGuess?.country || "N/A";
                    const isCountryCorrect = guess.trim().toLowerCase() === locationData.targetCountry.toLowerCase();
                    const playerColor = index % 2 === 0 ? 'border-pink-500' : 'border-teal-500';

                    let resultText;
                    if (isCountryCorrect) {
                        resultText = <span className="text-green-300 font-semibold">{PT_BR.geoGuessrCorrectCountry(GEO_GUESSER_POINTS_COUNTRY)}</span>;
                    } else {
                        resultText = <span className="text-red-300">{PT_BR.geoGuessrIncorrectGuess}</span>;
                    }

                    return (
                        <div key={player.id} className={`p-3 bg-black bg-opacity-30 rounded-lg border-l-4 ${playerColor} flex items-center justify-between`}>
                            <div className="flex-1">
                                <p className="font-bold text-lg">{player.name}</p>
                                <p className="text-sm text-purple-200">{PT_BR.geoGuessrYourGuess} <span className="font-semibold text-white">{guess}</span></p>
                            </div>
                            <div className="flex items-center space-x-2 text-right">
                                <span className="text-sm">{resultText}</span>
                                {isCountryCorrect ? <CheckCircleIcon /> : <XCircleIcon />}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-6 text-center">
                {canContinue ? (
                    <Button onClick={onContinue} size="lg" className="animate-pulseSlow">
                        {buttonText}
                    </Button>
                ) : (
                     <p className="text-purple-200 animate-pulseSlow">Calculando próxima rodada...</p>
                )}
            </div>
        </div>
    );
};


const GeoGuessrGameView: React.FC<GeoGuessrGameViewProps> = () => {
  const {
    players,
    gamePhase,
    currentPlayerId,
    locationData,
    handleGeoGuessrSubmit,
    handleContinue,
    geoGuessrRound,
    selectedGameMode,
  } = useGame();

  const [currentGuess, setCurrentGuess] = useState('');
  const [error, setError] = useState<string | null>(null);
  const guessInputRef = useRef<HTMLInputElement>(null);
  const [isImageFullyLoaded, setIsImageFullyLoaded] = useState(false);

  const isLoadingLocation = gamePhase === GamePhase.GEO_GUESSER_LOADING_LOCATION;
  const gameMode = selectedGameMode;
  
  if (!players || players.length === 0 || !geoGuessrRound || !handleGeoGuessrSubmit || !handleContinue) {
      return null;
  }

  const currentPlayer = players.find(p => p.id === currentPlayerId);

  useEffect(() => {
    if (gamePhase === GamePhase.GEO_GUESSER_PLAYER_GUESSING && !isLoadingLocation && guessInputRef.current) {
      guessInputRef.current.focus();
      setCurrentGuess(''); 
      setError(null);
    }
    if (locationData?.imageUrl) {
        setIsImageFullyLoaded(false); // Reset when new image URL comes
    }
  }, [gamePhase, isLoadingLocation, currentPlayerId, locationData?.imageUrl]);

  const handleGuessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentGuess(e.target.value);
    if (error) setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const guessTrimmed = currentGuess.trim();
    if (guessTrimmed.length < 2) { 
      setError("Por favor, insira um nome de país válido.");
      return;
    }
    setError(null);
    handleGeoGuessrSubmit(guessTrimmed);
    playSound('SELECT');
  };
  
  const isSubmitting = gamePhase !== GamePhase.GEO_GUESSER_PLAYER_GUESSING || isLoadingLocation;

  return (
    <div className="bg-purple-950 bg-opacity-80 p-4 md:p-6 rounded-xl shadow-2xl text-white w-full flex flex-col items-center animate-viewEnter">
      <PlayerScoreboard
        players={players}
        mainRoundsWon={{}}
        currentRound={geoGuessrRound} 
        totalRounds={GEO_GUESSER_TOTAL_ROUNDS}
        hideKeyLabels={true}
        activePlayerId={currentPlayerId}
        gameMode={gameMode} 
      />

      <h2 className="text-3xl font-bold text-pink-400 my-3 text-center tracking-wide">{PT_BR.geoGuessrPhaseTitle}</h2>
      
      {isLoadingLocation && (
        <div className="flex-grow flex flex-col items-center justify-center py-10 min-h-[300px]">
          <GeoGuessrLoadingIcon />
          <p className="mt-4 text-xl text-pink-300">{PT_BR.geoGuessrGeneratingLocation}</p>
        </div>
      )}
      
      {gamePhase === GamePhase.GEO_GUESSER_REVEAL_ANSWER && locationData && (
        <RevealScreen 
          players={players} 
          locationData={locationData} 
          onContinue={handleContinue} 
          geoGuessrRound={geoGuessrRound} 
          totalGeoGuessrRounds={GEO_GUESSER_TOTAL_ROUNDS} 
        />
      )}

      {!isLoadingLocation && locationData && gamePhase === GamePhase.GEO_GUESSER_PLAYER_GUESSING && currentPlayer && (
        <div className="w-full max-w-2xl mt-2 animate-fadeInUpShort">
          <div className="bg-black bg-opacity-40 p-3 rounded-lg text-center w-full max-w-lg mx-auto mb-4">
            <p className="text-lg font-semibold text-yellow-300 animate-pulseSlow">
              {PT_BR.geoGuessrCurrentPlayerTurn(currentPlayer.name)}
            </p>
            <p className="text-sm text-purple-200">{PT_BR.geoGuessrRoundLabel(geoGuessrRound, GEO_GUESSER_TOTAL_ROUNDS)}</p>
          </div>

          <div className="bg-indigo-900 bg-opacity-60 p-4 sm:p-5 rounded-xl shadow-xl border-2 border-purple-600 border-opacity-50 mb-5">
            <h3 className="flex items-center text-lg font-semibold text-purple-200 mb-3">
              {PT_BR.geoGuessrLocationCluesTitle}
            </h3>
            
            {locationData.imageUrl ? (
              <div className="mb-4 aspect-video bg-black rounded-lg overflow-hidden shadow-lg flex items-center justify-center">
                {!isImageFullyLoaded && (
                    <div className="flex flex-col items-center justify-center text-purple-300">
                        <ImagePlaceholderIcon />
                        <p className="mt-2 text-sm animate-pulse">{PT_BR.geoGuessrLoadingImage}</p>
                    </div>
                )}
                <img 
                    src={locationData.imageUrl} 
                    alt="Localização Misteriosa do GeoGuessr" 
                    className={`object-contain w-full h-full ${!isImageFullyLoaded ? 'hidden' : 'animate-fadeIn'}`}
                    onLoad={() => setIsImageFullyLoaded(true)}
                    onError={() => {
                        setIsImageFullyLoaded(true);
                    }}
                />
              </div>
            ) : (
                <div className="mb-4 aspect-video bg-black rounded-lg overflow-hidden shadow-lg flex items-center justify-center text-purple-300">
                    <ImagePlaceholderIcon />
                    <p className="mt-2 text-sm">Imagem não disponível</p>
                </div>
            )}

            {locationData.description && (
                <>
                    <h4 className="flex items-center text-md font-semibold text-purple-300 mb-1.5 mt-3">
                        <InfoIcon />
                        {PT_BR.geoGuessrAdditionalHintsTitle}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap max-h-28 overflow-y-auto pr-2 bg-black bg-opacity-20 p-2 rounded-md">
                    {locationData.description}
                    </p>
                </>
            )}
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-3">
            <TextInput
              id="geoGuessrCountry"
              label={PT_BR.geoGuessrEnterCountry}
              value={currentGuess}
              onChange={handleGuessChange}
              error={error || undefined}
              maxLength={50}
              placeholder={PT_BR.geoGuessrGuessPlaceholder}
              className="transition-all duration-300 focus-within:scale-105"
              disabled={isSubmitting}
              ref={guessInputRef}
              aria-label={PT_BR.geoGuessrEnterCountry}
            />
            <Button
              type="submit"
              size="lg"
              className="w-full !bg-pink-600 hover:!bg-pink-700 focus:ring-pink-500"
              disabled={isSubmitting || currentGuess.trim().length < 2}
            >
              {PT_BR.geoGuessrSubmitGuess}
            </Button>
          </form>
        </div>
      )}
      
      {!isLoadingLocation && !locationData && gamePhase === GamePhase.GEO_GUESSER_PLAYER_GUESSING && (
         <div className="flex-grow flex flex-col items-center justify-center py-10 min-h-[300px] text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-red-400 animate-pulse">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <p className="mt-4 text-xl text-red-300">{PT_BR.geoGuessrErrorGeneratingLocation}</p>
            <p className="text-sm text-red-200 mt-1">Não foi possível carregar os detalhes do local. Tente reiniciar o jogo se o problema persistir.</p>
        </div>
      )}
    </div>
  );
};

export default GeoGuessrGameView;
