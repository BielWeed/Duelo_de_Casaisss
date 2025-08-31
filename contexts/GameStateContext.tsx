
import React, { createContext, useContext, ReactNode } from 'react';
import { useGameState } from '../hooks/useGameState';

// This will be the type for our context state.
// ReturnType<T> is a TypeScript utility type that gives us the return type of a function.
// We use 'typeof useGameState' to get the type of our hook function.
type GameStateContextType = ReturnType<typeof useGameState> | null;

// Create the context with a default value of null.
// Components will get this value if they are not rendered inside the provider.
const GameStateContext = createContext<GameStateContextType>(null);

// The provider component will wrap parts of our app that need access to the game state.
interface GameStateProviderProps {
  children: ReactNode;
}

export const GameStateProvider: React.FC<GameStateProviderProps> = ({ children }) => {
  // The provider calls the hook to get the latest state and dispatcher.
  const gameState = useGameState();
  
  // It then provides this value to all of its children.
  return (
    <GameStateContext.Provider value={gameState}>
      {children}
    </GameStateContext.Provider>
  );
};

// The custom hook simplifies how components access the context data.
export const useGame = (): NonNullable<GameStateContextType> => {
  const context = useContext(GameStateContext);
  
  // If a component tries to use this hook outside of the provider,
  // we throw an error to prevent bugs.
  if (context === null) {
    throw new Error('useGame must be used within a GameStateProvider');
  }
  
  return context;
};
