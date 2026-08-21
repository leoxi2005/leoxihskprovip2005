import type { ReactNode } from 'react';
import { arcadeById, loadBest, type ArcadeId } from '../../engine/arcade';
import { useEngine } from '../../engine/useEngine';
import { C, F, shadow } from '../../theme';

export interface GameOver {
  score: number;
  xp: number;
  coins: number;
  record: boolean;
}

/**
 * Bề ngang tối đa của một ván.
 *
 * Không phải 820px như phần ôn tập: khung ôn tập hẹp vì đọc một câu dài quá thì mỏi mắt,
 * còn ở đây thứ cần rộng là **bàn chơi** — sân càng to thì chữ càng to và càng dễ nhắm.
 */
const WIDE = 'min(1400px, 95vw)';

/**
 * Khung chung của ba trò chơi: thanh điểm, mạng, kỷ lục, và bảng hết ván.
 *
 * Cố ý KHÔNG có nút Kiểm tra và không có bảng lời giải — đó là nhịp của phần ôn tập,
 * không phải của một ván chơi. Muốn xem lại từ vừa sai thì có Sổ tay.
 */
export function ArcadeFrame({
  id,
  score,
  lives,
  hud,
  over,
  onRetry,
  children,
}: {
  id: ArcadeId;
  score: number;
  /** `null` khi trò đó tính giờ chứ không tính mạng. */
  lives: number | null;
  /** Dòng chữ nhỏ bên phải thanh điểm — mỗi trò nói một thứ khác nhau. */
  hud?: ReactNode;
  over: GameOver | null;
  onRetry: () => void;
  children: ReactNode;
}) {
  const engine = useEngine();
  const card = arcadeById(id);
  const best = loadBest()[id] ?? 0;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '18px 14px 40px',
        gap: 12,
      }}
    >
      <div style={{ width: WIDE, display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={engine.goHome}
          title="Thoát"
          aria-label="Thoát"
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            border: `2px solid ${C.ink}`,
            background: C.card,
            fontSize: 16,
            fontWeight: 800,
            cursor: 'pointer',
            color: C.muted,
          }}
        >
          ✕
        </button>
        <span
          style={{
            background: card.bg,
            color: '#fff',
            border: `2px solid ${C.ink}`,
            borderRadius: 99,
            padding: '6px 18px',
            fontSize: 15,
            fontWeight: 800,
            whiteSpace: 'nowrap',
            boxShadow: shadow(3),
          }}
        >
          {card.icon} {card.name}
        </span>
        <span style={{ flex: 1 }} />
        {hud}
        {lives !== null && (
          <span style={{ fontSize: 21, whiteSpace: 'nowrap' }}>
            {'❤️'.repeat(Math.max(0, lives)) + '🖤'.repeat(Math.max(0, 3 - lives))}
          </span>
        )}
        <span
          style={{
            background: C.ink,
            color: C.soft,
            borderRadius: 99,
            padding: '6px 20px',
            fontSize: 19,
            fontWeight: 800,
            whiteSpace: 'nowrap',
          }}
        >
          {score}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.muted, whiteSpace: 'nowrap' }}>
          🏆 {Math.max(best, score)}
        </span>
      </div>

      <div style={{ position: 'relative', width: WIDE }}>
        {children}

        {over && (
          <div
            role="dialog"
            aria-label="Hết ván"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(45,36,25,.72)',
              borderRadius: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
              zIndex: 20,
            }}
          >
            <div
              style={{
                background: C.card,
                border: `3px solid ${C.ink}`,
                borderRadius: 24,
                boxShadow: shadow(6),
                padding: '24px 28px',
                textAlign: 'center',
                maxWidth: 380,
                animation: 'pop .3s ease',
              }}
            >
              <div style={{ fontSize: 46 }}>{over.record ? '🏆' : card.icon}</div>
              <h2 style={{ margin: '6px 0 2px', fontSize: 24, fontWeight: 800 }}>
                {over.record ? 'KỶ LỤC MỚI!' : 'Hết ván'}
              </h2>
              <p style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: C.muted }}>
                {over.score} điểm · +{over.xp} XP · +{over.coins} 🪙
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={onRetry}
                  autoFocus
                  style={{
                    background: C.ink,
                    color: C.soft,
                    border: `3px solid ${C.ink}`,
                    borderRadius: 14,
                    padding: '12px 26px',
                    fontSize: 16,
                    fontWeight: 800,
                    fontFamily: F.ui,
                    cursor: 'pointer',
                  }}
                >
                  Chơi lại
                </button>
                <button
                  onClick={engine.goHome}
                  style={{
                    background: C.card,
                    color: C.ink,
                    border: `3px solid ${C.ink}`,
                    borderRadius: 14,
                    padding: '12px 26px',
                    fontSize: 16,
                    fontWeight: 800,
                    fontFamily: F.ui,
                    cursor: 'pointer',
                  }}
                >
                  Về nhà
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: C.muted, textAlign: 'center' }}>
        {card.skill}
      </p>
    </div>
  );
}
