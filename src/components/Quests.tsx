import { Bar } from './Bar';
import { CHEST_COST, PETS } from '../engine/meta';
import { useEngine, useGameState } from '../engine/useEngine';
import { C, F, shadow } from '../theme';

const pill = {
  border: `2px solid ${C.ink}`,
  borderRadius: 99,
  padding: '4px 12px',
  fontSize: 13,
  fontWeight: 800,
  whiteSpace: 'nowrap' as const,
};

/**
 * Nhiệm vụ hằng ngày, túi vàng, rương và giá linh thú.
 *
 * Đặt ngay dưới Kế hoạch hằng ngày chứ không đặt trên: việc bắt buộc luôn phải là
 * thứ đọc được trước, phần thưởng là thứ đọc được ngay sau đó.
 */
export function Quests() {
  const engine = useEngine();
  // metaVer đổi khi vàng/rương/nhiệm vụ đổi — đọc state ở đây là đủ để vẽ lại.
  useGameState();
  const quests = engine.quests();
  const m = engine.meta;
  const owned = engine.petsOwned();
  const allDone = quests.every((q) => q.done);
  const [got, total] = engine.awardCount();

  return (
    <section
      style={{
        textAlign: 'left',
        background: C.panel,
        border: `3px solid ${C.ink}`,
        borderRadius: 20,
        boxShadow: shadow(5),
        padding: '14px 16px',
        marginBottom: 18,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 800 }}>🎯 Nhiệm vụ hôm nay</span>
        <span style={{ flex: 1 }} />
        <span style={{ ...pill, background: '#f7e6b8', color: C.gold }}>🪙 {m.coins}</span>
        {m.freezes > 0 && (
          <span style={{ ...pill, background: '#dceaf5', color: C.blue }} title="Băng giữ chuỗi ngày">
            🧊 {m.freezes}
          </span>
        )}
        {m.boost > 0 && (
          <span style={{ ...pill, background: '#f3e6fb', color: C.purple }} title="Bùa nhân đôi XP">
            ⚡ ×2 · {m.boost}
          </span>
        )}
        <span style={{ ...pill, background: C.card, color: C.muted }} title="Huy hiệu đã đạt">
          🏅 {got}/{total}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {quests.map(({ quest, at, done, claimed }) => (
          <div key={quest.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20, width: 26, textAlign: 'center' }}>{quest.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: claimed ? C.muted : C.body }}>
                {quest.name}
                <span style={{ color: C.muted, fontWeight: 600 }}>
                  {' '}
                  — {at}/{quest.goal}
                </span>
              </div>
              <Bar
                pct={Math.round((at / quest.goal) * 100)}
                height={9}
                fill={done ? 'linear-gradient(90deg,#4f9d5f,#7bbd6a)' : 'linear-gradient(90deg,#e8a93c,#c94f38)'}
                style={{ marginTop: 4 }}
                label={quest.name}
              />
            </div>
            <button
              onClick={() => engine.claimQuest(quest.id)}
              disabled={!done || claimed}
              title={claimed ? 'Đã nhận' : done ? 'Nhận vàng' : 'Chưa xong'}
              style={{
                ...pill,
                fontFamily: F.ui,
                background: claimed ? C.track : done ? C.ochre : C.card,
                color: claimed ? C.muted : done ? C.ink : C.muted2,
                borderColor: done && !claimed ? C.ink : C.edge,
                cursor: done && !claimed ? 'pointer' : 'default',
                boxShadow: done && !claimed ? shadow(2) : 'none',
              }}
            >
              {claimed ? '✓ đã nhận' : `+${quest.coins} 🪙`}
            </button>
          </div>
        ))}
      </div>

      {allDone && !m.bonusTaken && (
        <p style={{ margin: '10px 0 0', fontSize: 12, fontWeight: 700, color: C.okInk }}>
          Xong cả ba! Nhận nốt phần thưởng cuối để lấy thêm 60 🪙 và một rương 🎁
        </p>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginTop: 12,
          paddingTop: 12,
          borderTop: `2px dashed ${C.line}`,
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={engine.openChest}
          disabled={m.chests <= 0}
          style={{
            border: `3px solid ${C.ink}`,
            borderRadius: 14,
            padding: '8px 16px',
            fontSize: 14,
            fontWeight: 800,
            fontFamily: F.ui,
            background: m.chests > 0 ? C.ochre : C.card,
            color: m.chests > 0 ? C.ink : C.muted2,
            cursor: m.chests > 0 ? 'pointer' : 'default',
            boxShadow: m.chests > 0 ? shadow(3) : 'none',
            animation: m.chests > 0 ? 'pulse 1.6s ease infinite' : undefined,
          }}
        >
          🎁 Mở rương {m.chests > 0 ? `(${m.chests})` : ''}
        </button>
        <button
          onClick={engine.buyChest}
          disabled={m.coins < CHEST_COST}
          title={`Đổi ${CHEST_COST} vàng lấy một rương`}
          style={{
            border: `2px solid ${m.coins >= CHEST_COST ? C.ink : C.edge}`,
            borderRadius: 14,
            padding: '8px 14px',
            fontSize: 13,
            fontWeight: 800,
            fontFamily: F.ui,
            background: C.card,
            color: m.coins >= CHEST_COST ? C.ink : C.muted2,
            cursor: m.coins >= CHEST_COST ? 'pointer' : 'default',
          }}
        >
          Mua rương · {CHEST_COST} 🪙
        </button>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>
          Linh thú {owned.length}/{PETS.length}
        </span>
        <span style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {PETS.map((p) => {
            const has = m.pets.includes(p.id);
            return (
              <span
                key={p.id}
                title={has ? `${p.name} — ${p.line}` : 'Chưa bắt được'}
                style={{ fontSize: 19, filter: has ? 'none' : 'grayscale(1)', opacity: has ? 1 : 0.32 }}
              >
                {has ? p.icon : '⬚'}
              </span>
            );
          })}
        </span>
      </div>
    </section>
  );
}
