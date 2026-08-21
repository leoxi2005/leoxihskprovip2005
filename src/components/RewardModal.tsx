import { useEngine, useGameState } from '../engine/useEngine';
import { C, F, shadow } from '../theme';

/** Hộp thoại khoe thứ vừa mở được từ rương. */
export function RewardModal() {
  const engine = useEngine();
  const st = useGameState();
  const r = st.reward;
  if (!r) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Phần thưởng từ rương"
      onClick={engine.closeReward}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(45,36,25,.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.card,
          border: `3px solid ${C.ink}`,
          borderRadius: 26,
          boxShadow: shadow(8),
          padding: '28px 32px',
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
          animation: 'pop .3s ease',
        }}
      >
        <div style={{ fontSize: 72, lineHeight: 1.1, animation: 'floaty 2.4s ease-in-out infinite' }}>{r.icon}</div>
        <h2 style={{ margin: '10px 0 4px', fontSize: 24, fontWeight: 800 }}>{r.title}</h2>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.muted, lineHeight: 1.5 }}>{r.note}</p>
        <button
          onClick={engine.closeReward}
          autoFocus
          style={{
            marginTop: 18,
            background: C.ink,
            color: C.soft,
            border: `3px solid ${C.ink}`,
            borderRadius: 14,
            padding: '12px 30px',
            fontSize: 16,
            fontWeight: 800,
            fontFamily: F.ui,
            cursor: 'pointer',
          }}
        >
          Tuyệt!
        </button>
      </div>
    </div>
  );
}
