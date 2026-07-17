import { createContext, useContext, useSyncExternalStore } from 'react';
import type { GameEngine } from './GameEngine';
import type { GameState } from './types';

export const EngineContext = createContext<GameEngine | null>(null);

export function useEngine(): GameEngine {
  const engine = useContext(EngineContext);
  if (!engine) throw new Error('useEngine must be used inside <EngineContext.Provider>');
  return engine;
}

/** Re-renders on every engine state change. */
export function useGameState(): GameState {
  const engine = useEngine();
  return useSyncExternalStore(engine.subscribe, engine.getState);
}
