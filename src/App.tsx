import { useEffect, useState } from 'react';
import { Confetti } from './components/Confetti';
import { GameEngine } from './engine/GameEngine';
import { EngineContext, useGameState } from './engine/useEngine';
import { Home } from './screens/Home';
import { Notebook } from './screens/Notebook';
import { Quiz } from './screens/Quiz';
import { Result } from './screens/Result';
import { C, F, withAlpha } from './theme';

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
          // Mosaic ảnh do người dùng cung cấp, lát thành ô nhỏ. Một lớp kem mờ phủ
          // lên trên để thẻ và chữ vẫn nổi rõ trên nền ảnh rậm.
          backgroundColor: C.bg,
          backgroundImage: `linear-gradient(${withAlpha(C.bg, 0.55)}, ${withAlpha(C.bg, 0.55)}), url("${import.meta.env.BASE_URL}img/bg-mosaic.jpg")`,
          backgroundSize: 'auto, 190px 190px',
          backgroundRepeat: 'repeat, repeat',
          backgroundAttachment: 'fixed, fixed',
        }}
      >
        <Screens />
        <Confetti />
      </div>
    </EngineContext.Provider>
  );
}
