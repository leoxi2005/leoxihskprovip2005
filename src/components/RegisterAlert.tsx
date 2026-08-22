import { useState } from 'react';
import { regIcs, regStatus, type RegLevel } from '../engine/register';
import { useEngine, useGameState } from '../engine/useEngine';
import { C, F, shadow } from '../theme';

/** Trang đăng ký HSK chính thức của đơn vị ra đề. */
const PORTAL = 'https://www.chinesetest.cn';

/**
 * Mỗi mức một bộ màu. Chỉ hai mức cuối được dùng màu báo động: nếu tháng nào cũng đỏ
 * thì đến tháng thật sự gấp, màu đỏ chẳng còn nói được gì.
 */
const SKIN: Record<Exclude<RegLevel, 'off'>, { bg: string; edge: string; ink: string; loud: boolean }> = {
  done: { bg: C.okBg, edge: C.green, ink: C.okInk, loud: false },
  calm: { bg: C.panel, edge: C.edge, ink: C.body, loud: false },
  soon: { bg: C.soft, edge: C.ochre, ink: C.gold, loud: false },
  urgent: { bg: C.badBg, edge: C.red, ink: C.badInk, loud: true },
  last: { bg: C.badBg, edge: C.red, ink: C.badInk, loud: true },
  missed: { bg: C.badBg, edge: C.red, ink: C.badInk, loud: true },
};

const btn = (bg: string, color: string, edge: string) => ({
  background: bg,
  color,
  border: `2px solid ${edge}`,
  borderRadius: 12,
  padding: '7px 15px',
  fontSize: 13,
  fontWeight: 800,
  cursor: 'pointer',
  fontFamily: F.ui,
  whiteSpace: 'nowrap' as const,
  textDecoration: 'none',
  display: 'inline-block',
});

/**
 * Lời nhắc hạn đăng ký.
 *
 * Nằm **trên** thẻ đếm ngược ngày thi, và đó là chủ ý: học thiếu một ngày thì bù được,
 * còn lỡ ngày chốt hồ sơ thì mọi việc học bên dưới mất chỗ để dùng. Thứ tự trên màn
 * hình chính là thứ tự của cái mất được nhiều nhất.
 */
export function RegisterAlert() {
  const engine = useEngine();
  useGameState();
  const [msg, setMsg] = useState('');
  const st = regStatus(engine.settings);

  if (st.level === 'off') return null;
  const skin = SKIN[st.level];

  const save = () => {
    const blob = new Blob([regIcs(engine.settings, Date.now())], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hsk4-han-dang-ky-${engine.settings.regDate}.ics`;
    a.click();
    // Thu hồi ngay lập tức có thể huỷ luôn lượt tải ở vài trình duyệt.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMsg('Đã tải tệp lịch ✓ Mở tệp đó lên để thêm vào lịch điện thoại — từ đó app không mở cũng vẫn được nhắc.');
  };

  // Đã đăng ký: một dòng mảnh xác nhận, kèm đường lùi nếu bấm nhầm.
  if (st.level === 'done') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
          background: skin.bg,
          border: `2px solid ${skin.edge}`,
          borderRadius: 14,
          padding: '8px 14px',
          marginBottom: 12,
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 800, color: skin.ink }}>{st.title}</span>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: C.muted2, flex: 1, minWidth: 180 }}>
          {st.detail}
        </span>
        <button
          onClick={() => engine.setSettings({ registered: false })}
          style={{
            background: 'transparent',
            border: 'none',
            color: C.muted,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: F.ui,
            textDecoration: 'underline',
          }}
        >
          Chưa, hoàn tác
        </button>
      </div>
    );
  }

  return (
    <section
      style={{
        textAlign: 'left',
        background: skin.bg,
        border: `3px solid ${skin.edge}`,
        borderRadius: 18,
        boxShadow: skin.loud ? shadow(5, skin.edge) : undefined,
        padding: skin.loud ? '14px 18px' : '11px 16px',
        marginBottom: 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        {/* Con số to chỉ xuất hiện khi nó còn có nghĩa: quá hạn thì đếm ngược là vô ích. */}
        {st.level !== 'missed' && (
          <span style={{ fontSize: skin.loud ? 30 : 20, fontWeight: 800, color: skin.edge, lineHeight: 1 }}>
            D-{st.daysLeft}
          </span>
        )}
        <span style={{ fontSize: skin.loud ? 15 : 13.5, fontWeight: 800, color: skin.ink }}>{st.title}</span>
      </div>

      <div
        style={{
          fontSize: 12.5,
          fontWeight: 600,
          color: C.body,
          lineHeight: 1.5,
          marginTop: 5,
        }}
      >
        {st.detail}
      </div>

      {st.inconsistent && (
        <div style={{ fontSize: 12.5, fontWeight: 700, color: C.badInk, marginTop: 6, lineHeight: 1.5 }}>
          ⚠️ Hạn đăng ký đang nằm sau ngày thi — hai ngày này không thể cùng đúng. Sửa lại trong Cài đặt.
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
        <button onClick={save} style={btn(C.ink, C.soft, C.ink)}>
          📅 Hẹn vào lịch điện thoại
        </button>
        <button
          onClick={() => engine.setSettings({ registered: true })}
          style={btn(C.card, skin.ink, skin.edge)}
        >
          ✅ Tôi đã đăng ký rồi
        </button>
        <a href={PORTAL} target="_blank" rel="noreferrer" style={btn(C.card, C.body, C.edge)}>
          Trang đăng ký ↗
        </a>
      </div>

      {msg && (
        <div style={{ fontSize: 12.5, fontWeight: 700, color: C.okInk, marginTop: 8, lineHeight: 1.5 }}>
          {msg}
        </div>
      )}
    </section>
  );
}
