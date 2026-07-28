import { useEffect, useState } from 'react';
import { Confetti } from './components/Confetti';
import { GameEngine } from './engine/GameEngine';
import { EngineContext, useGameState } from './engine/useEngine';
import { Home } from './screens/Home';
import { Notebook } from './screens/Notebook';
import { Quiz } from './screens/Quiz';
import { Result } from './screens/Result';
import { C, F } from './theme';

function Loading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
      }}
    >
      <div style={{ fontFamily: F.han, fontSize: 56, color: C.red, animation: 'floaty 2s ease-in-out infinite' }}>
        学
      </div>
      <div style={{ fontWeight: 700, color: C.muted }}>Đang tải bộ dữ liệu…</div>
    </div>
  );
}

function Screens() {
  const st = useGameState();
  if (!st.ready) return <Loading />;
  switch (st.mode) {
    case 'quiz':
      return <Quiz />;
    case 'result':
      return <Result />;
    case 'book':
      return <Notebook />;
    default:
      return <Home />;
  }
}

export default function App() {
  const [engine] = useState(() => new GameEngine());

  useEffect(() => {
    engine.init();
    window.addEventListener('keydown', engine.handleKey);
    return () => {
      window.removeEventListener('keydown', engine.handleKey);
      engine.dispose();
    };
  }, [engine]);

  return (
    <EngineContext.Provider value={engine}>
      <div
        style={{
          minHeight: '100vh',
          fontFamily: `'Baloo 2','Noto Sans SC',sans-serif`,
          color: C.ink,
          backgroundImage: `radial-gradient(${C.dot} 1.5px,transparent 1.5px)`,
          backgroundSize: '26px 26px',
        }}
      >
        <Screens />
        <Confetti />
      </div>
    </EngineContext.Provider>
  );
}
