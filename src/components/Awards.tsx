import { Bar } from './Bar';
import { useEngine, useGameState } from '../engine/useEngine';
import { C, shadow } from '../theme';

/**
 * Bảng huy hiệu.
 *
 * Huy hiệu chưa đạt vẫn hiện đầy đủ tên và con số đang chạy — giấu đi thì người học
 * không biết còn gì để với tới, mà cái để với tới mới là thứ giữ người ta quay lại.
 */
export function Awards() {
  const engine = useEngine();
  useGameState();
  const list = engine.awards();
  const done = list.filter((a) => a.done).length;

  return (
    <section style={{ textAlign: 'left', marginTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800 }}>🏅 Huy hiệu</h2>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.muted }}>
          {done}/{list.length} đã đạt
        </span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))',
          gap: 10,
        }}
      >
        {list.map(({ award, at, done: ok, pct }) => (
          <div
            key={award.id}
            style={{
              background: ok ? C.okBg : C.card,
              border: `2px solid ${ok ? C.green : C.line}`,
              borderRadius: 16,
              boxShadow: ok ? shadow(3, C.green) : 'none',
              padding: '10px 12px',
              display: 'flex',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 26, filter: ok ? 'none' : 'grayscale(1)', opacity: ok ? 1 : 0.4 }}>
              {award.icon}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: ok ? C.okInk : C.body }}>
                {award.name} {ok && '✓'}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4 }}>{award.desc}</div>
              <Bar
                pct={pct}
                height={8}
                fill={ok ? C.green : 'linear-gradient(90deg,#e8a93c,#c94f38)'}
                label={award.name}
              />
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginTop: 3 }}>
                {at.toLocaleString('vi-VN')}/{award.goal.toLocaleString('vi-VN')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
