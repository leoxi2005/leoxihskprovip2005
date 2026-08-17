import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BUILTIN_PAPERS,
  LISTEN_COUNT,
  PAPER_PRESETS,
  PAPER_SOURCES,
  TF_COUNT,
  deletePaper,
  getPaper,
  listPapers,
  optionsFor,
  parseKey,
  savePaper,
  scoreKey,
  type BuiltinPaper,
  type KeyAnswer,
  type PaperInfo,
} from '../../engine/realpaper';
import { H41001_PARTS, H41001_PAPER_ID } from '../../data/h41001';
import { KEYS, load, save } from '../../engine/storage';
import { C, F, shadow } from '../../theme';
import { RealDrill } from './RealDrill';

type Phase = 'menu' | 'setup' | 'run' | 'result';

const btn = (bg: string, color = '#fff') => ({
  background: bg,
  color,
  border: `3px solid ${C.ink}`,
  borderRadius: 14,
  padding: '11px 24px',
  fontSize: 15,
  fontWeight: 800,
  cursor: 'pointer',
  fontFamily: F.ui,
  boxShadow: shadow(3),
});

const card = {
  background: C.card,
  border: `3px solid ${C.ink}`,
  borderRadius: 22,
  boxShadow: shadow(5),
  padding: '22px 26px',
  width: '100%',
  maxWidth: 860,
} as const;

const label = {
  fontSize: 12.5,
  fontWeight: 800,
  textTransform: 'uppercase' as const,
  letterSpacing: '.06em',
  color: C.muted,
  margin: '16px 0 6px',
};

const clock = (s: number): string =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

interface ExamLogRow {
  at: number;
  paper: string;
  total: number;
  sections: number[];
}

/** A paper loaded and ready to sit, whichever side its recording came from. */
interface Live {
  id: string;
  name: string;
  key: KeyAnswer[];
  url: string;
  /** True when `url` is an object URL over a local blob, and so has to be released. */
  temporary: boolean;
}

/**
 * The listening section of a real past paper, driven by its own recording.
 *
 * Everything the synthesised voice cannot give you — real speakers, natural prosody,
 * studio pacing, the exact gaps between questions — comes free once the actual audio
 * is playing. What the app adds is the part a PDF cannot: an answer grid, a clock, and
 * marking against the key.
 */
export function RealPaper({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>('menu');
  const [papers, setPapers] = useState<PaperInfo[]>([]);
  const [current, setCurrent] = useState<Live | null>(null);
  const [given, setGiven] = useState<(KeyAnswer | null)[]>(() => Array(LISTEN_COUNT).fill(null));
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [broken, setBroken] = useState(false);
  /** Which listening part is being drilled with the bundled recording, if any. */
  const [drill, setDrill] = useState<1 | 2 | 3 | null>(null);
  const audioEl = useRef<HTMLAudioElement | null>(null);

  const refresh = () => void listPapers().then(setPapers);
  useEffect(refresh, []);

  // The object URL is the only thing holding the decoded blob; release it on the way
  // out. A bundled file's plain path must survive — revoking it would do nothing, but
  // it is not ours to release either.
  useEffect(
    () => () => { if (current?.temporary) URL.revokeObjectURL(current.url); },
    [current],
  );

  // The clock reads off the recording rather than off a timer of its own: a bundled
  // file arrives over the network, and a wall clock started at Play would keep counting
  // through a stall, telling the learner they took longer than the tape actually ran.


  const result = useMemo(
    () => (current ? scoreKey(current.key, given) : null),
    [current, given],
  );

  const begin = (live: Live) => {
    setCurrent(live);
    setGiven(Array(LISTEN_COUNT).fill(null));
    setElapsed(0);
    setPlaying(false);
    setLoading(true);
    setBroken(false);
    setPhase('run');
  };

  const startStored = async (id: string) => {
    const p = await getPaper(id);
    if (!p) return;
    begin({ id: p.id, name: p.name, key: p.key, url: URL.createObjectURL(p.audio), temporary: true });
  };

  const startBuiltin = (b: BuiltinPaper) =>
    begin({ id: b.id, name: b.name, key: b.key, url: b.url, temporary: false });

  // Sitting it again needs no reload: the same URL still points at the same recording,
  // and the audio element is rebuilt from scratch when the run screen comes back.
  const again = () => { if (current) begin(current); };

  const submit = () => {
    audioEl.current?.pause();
    setPlaying(false);
    if (current && result) {
      const rows = load<ExamLogRow[]>(KEYS.exam, []);
      // Logged as a listening-only sitting, so the stats screen shows it beside the
      // full mocks without pretending a reading or writing score exists.
      save(KEYS.exam, [
        ...rows,
        { at: Date.now(), paper: 'real:' + current.name, total: result.points, sections: [result.points, 0, 0] },
      ]);
    }
    setPhase('result');
  };

  // -- drilling one part with the bundled recording --------------------------

  const drilled = BUILTIN_PAPERS.find((b) => b.id === H41001_PAPER_ID);
  if (drill && drilled) {
    return <RealDrill part={drill} paper={drilled} onExit={() => setDrill(null)} />;
  }

  // -- menu -----------------------------------------------------------------

  if (phase === 'menu') {
    return (
      <Shell>
        <div style={card}>
          <button onClick={onExit} style={{ ...btn(C.card, C.ink), padding: '6px 14px', fontSize: 13 }}>
            ← Quay lại
          </button>

          <h2 style={{ margin: '14px 0 4px', fontSize: 25, fontWeight: 800 }}>🎧 Nghe bằng đề thật</h2>
          <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 600, color: C.body, lineHeight: 1.6 }}>
            Bản thu thật của người bản xứ, chạy một mạch 30 phút như phòng thi. App cho bạn lưới 45
            câu để tick, bấm giờ và chấm điểm ngay khi băng hết.
          </p>
          <p style={{ margin: '0 0 4px', fontSize: 12.5, fontWeight: 600, color: C.muted2, lineHeight: 1.55 }}>
            Đề mẫu chính thức đã kèm sẵn file nghe — bấm Làm là chạy. Muốn thêm đề thật khác thì tải
            PDF + file nghe về rồi nạp vào; file đó nằm lại trong máy bạn, không tải lên đâu cả.
          </p>

          <div style={label}>Có sẵn trong app</div>
          {BUILTIN_PAPERS.map((b) => (
            <div
              key={b.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                background: C.soft,
                border: `2px solid ${C.ink}`,
                borderRadius: 14,
                marginBottom: 8,
                flexWrap: 'wrap',
              }}
            >
              <span style={{ flex: 1, minWidth: 160 }}>
                <span style={{ display: 'block', fontSize: 15, fontWeight: 800 }}>{b.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.muted2 }}>
                  Kèm file nghe · 45 câu · ~30 phút
                </span>
              </span>
              <button onClick={() => startBuiltin(b)} style={{ ...btn(C.red), padding: '7px 18px', fontSize: 14 }}>
                Làm cả đề ▶
              </button>
            </div>
          ))}

          {BUILTIN_PAPERS.some((b) => b.id === H41001_PAPER_ID) && (
            <>
              <div style={{ ...label, margin: '10px 0 6px' }}>
                Hoặc luyện từng phần bằng chính giọng thu đó
              </div>
              <p style={{ margin: '0 0 8px', fontSize: 12.5, fontWeight: 600, color: C.muted2, lineHeight: 1.55 }}>
                Từng câu một, nghe lại bao nhiêu lần cũng được, chấm ngay tại chỗ — thứ mà làm cả đề
                không cho phép.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {H41001_PARTS.map((p) => (
                  <button
                    key={p.part}
                    onClick={() => setDrill(p.part)}
                    style={{ ...btn(C.blue), padding: '9px 16px', fontSize: 13.5, textAlign: 'left' }}
                  >
                    {p.title}
                    <span style={{ display: 'block', fontSize: 11.5, fontWeight: 700, opacity: 0.9 }}>
                      {p.sub}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {papers.length === 0 && (
            <div
              style={{
                background: C.soft,
                border: `2px dashed ${C.ochre}`,
                borderRadius: 14,
                padding: '12px 16px',
                margin: '12px 0 4px',
                fontSize: 13.5,
                fontWeight: 700,
                color: C.body,
                lineHeight: 1.65,
              }}
            >
              <b>Muốn thêm đề nữa?</b> Bấm “Nạp đề mới” → chọn đề có sẵn đáp án → chọn file nghe
              trong máy → Lưu. Từ lần sau mở lên là bấm “Làm ▶” luôn, không phải chọn file lại: đề
              được giữ trong trình duyệt này.
            </div>
          )}

          {papers.length > 0 && (
            <>
              <div style={label}>Đề đã nạp</div>
              {papers.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    background: C.panel,
                    border: `2px solid ${C.line}`,
                    borderRadius: 14,
                    marginBottom: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ flex: 1, minWidth: 160, fontSize: 15, fontWeight: 800 }}>{p.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>
                    nạp {new Date(p.at).toLocaleDateString('vi-VN')}
                  </span>
                  <button onClick={() => void startStored(p.id)} style={{ ...btn(C.red), padding: '7px 18px', fontSize: 14 }}>
                    Làm ▶
                  </button>
                  <button
                    onClick={() => void deletePaper(p.id).then(refresh)}
                    aria-label={`Xoá ${p.name}`}
                    style={{ ...btn(C.card, C.muted), padding: '7px 12px', fontSize: 13, boxShadow: 'none' }}
                  >
                    Xoá
                  </button>
                </div>
              ))}
            </>
          )}

          <div style={{ marginTop: 14 }}>
            <button onClick={() => setPhase('setup')} style={btn(C.ink, C.soft)}>
              + Nạp đề mới
            </button>
          </div>

          <div style={label}>Tải đề ở đâu</div>
          {PAPER_SOURCES.map((s) => (
            <div key={s.url} style={{ marginBottom: 8 }}>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 14, fontWeight: 800, color: C.blue }}
              >
                {s.name} ↗
              </a>
              <div style={{ fontSize: 12.5, color: C.muted2, fontWeight: 600 }}>{s.note}</div>
            </div>
          ))}
        </div>
      </Shell>
    );
  }

  if (phase === 'setup') {
    return <Setup onDone={() => { refresh(); setPhase('menu'); }} onCancel={() => setPhase('menu')} />;
  }

  if (!current) return null;

  // -- result ---------------------------------------------------------------

  if (phase === 'result' && result) {
    return (
      <Shell>
        <div style={{ ...card, textAlign: 'center' }}>
          <h2
            style={{
              margin: '0 0 4px',
              fontSize: 30,
              fontWeight: 800,
              color: result.points >= 60 ? C.okInk : C.badInk,
            }}
          >
            {result.right}/{result.count} đúng · {result.points}/100 điểm nghe
          </h2>
          <p style={{ margin: '0 0 16px', fontWeight: 700, color: C.muted, fontSize: 14 }}>
            {current.name} · làm trong {clock(elapsed)} · bỏ trống {result.blank}
          </p>

          {result.wrong.length > 0 && (
            <>
              <div style={{ ...label, textAlign: 'left' }}>Câu sai — nghe lại đúng mấy câu này</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                {result.wrong.map((i) => (
                  <span
                    key={i}
                    style={{
                      background: C.badBg,
                      border: `2px solid ${C.red}`,
                      borderRadius: 10,
                      padding: '4px 10px',
                      fontSize: 13,
                      fontWeight: 800,
                      color: C.badInk,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {i + 1}. {given[i] ?? '—'} → {current.key[i]}
                  </span>
                ))}
              </div>
            </>
          )}

          <p style={{ fontSize: 13, color: C.body, fontWeight: 600, maxWidth: 560, margin: '16px auto 0' }}>
            Mở lại file nghe và tua đúng những câu sai ở trên, nghe tới khi hiểu tại sao — đó là chỗ
            điểm phần nghe thật sự tăng, không phải ở việc làm thêm đề.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 18, flexWrap: 'wrap' }}>
            <button onClick={again} style={btn(C.ink, C.soft)}>
              Làm lại đề này
            </button>
            <button onClick={() => setPhase('menu')} style={btn(C.card, C.ink)}>
              ← Danh sách đề
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  // -- run ------------------------------------------------------------------

  const answered = given.filter(Boolean).length;

  return (
    <Shell>
      <div style={{ width: '100%', maxWidth: 860 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 12,
            background: C.card,
            border: `3px solid ${C.ink}`,
            borderRadius: 18,
            padding: '10px 16px',
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 900 }}>{current.name}</span>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 13, fontWeight: 800, color: C.muted }}>đã tick {answered}/{LISTEN_COUNT}</span>
          <span
            style={{
              background: C.ink,
              color: C.soft,
              borderRadius: 99,
              padding: '4px 14px',
              fontSize: 16,
              fontWeight: 800,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            ⏱ {clock(elapsed)}
          </span>
        </div>

        <div style={{ ...card, marginBottom: 12 }}>
          {/* No seek bar on purpose: the real recording plays straight through. */}
          <audio
            ref={audioEl}
            src={current.url}
            // The bundled recording is 20 MB coming off the network the first time;
            // fetching it while the learner reads the instructions means Play starts
            // instantly instead of stalling on question 1.
            preload="auto"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onTimeUpdate={(e) => setElapsed(e.currentTarget.currentTime)}
            onWaiting={() => setLoading(true)}
            onPlaying={() => setLoading(false)}
            onCanPlay={() => setLoading(false)}
            onError={() => setBroken(true)}
            onEnded={submit}
          />
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                const el = audioEl.current;
                if (!el) return;
                if (el.paused) void el.play();
                else el.pause();
              }}
              style={btn(playing ? C.ochre : C.green)}
            >
              {playing ? '⏸ Tạm dừng' : elapsed ? '▶ Tiếp tục' : '▶ Bắt đầu phát'}
            </button>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: C.muted2, flex: 1, minWidth: 220 }}>
              {broken
                ? 'Không mở được file nghe. Kiểm tra mạng rồi vào lại đề này.'
                : loading
                  ? 'Đang tải bản thu… lần đầu hơi lâu, các lần sau máy nhớ sẵn.'
                  : 'Không có thanh tua — bản thu thật chạy một mạch từ đầu đến cuối. Nghe xong app tự nộp bài.'}
            </span>
            <button onClick={submit} style={btn(C.card, C.ink)}>
              Nộp sớm
            </button>
          </div>
        </div>

        <div style={card}>
          <div style={{ ...label, margin: '0 0 8px' }}>
            Phiếu trả lời · câu 1–{TF_COUNT} là đúng/sai, câu {TF_COUNT + 1}–{LISTEN_COUNT} chọn A B C D
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(148px,1fr))', gap: 8 }}>
            {given.map((g, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  background: g ? C.soft : C.panel,
                  border: `2px solid ${g ? C.ink : C.line}`,
                  borderRadius: 12,
                  padding: '5px 8px',
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: C.muted,
                    width: 22,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {i + 1}
                </span>
                {optionsFor(i).map((o) => (
                  <button
                    key={o}
                    onClick={() =>
                      setGiven((a) => {
                        const out = a.slice();
                        out[i] = out[i] === o ? null : o;
                        return out;
                      })
                    }
                    aria-label={`Câu ${i + 1} chọn ${o}`}
                    style={{
                      flex: 1,
                      border: `2px solid ${g === o ? C.ink : C.edge}`,
                      background: g === o ? C.ink : C.card,
                      color: g === o ? C.soft : C.muted,
                      borderRadius: 8,
                      padding: '3px 0',
                      fontSize: 12.5,
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontFamily: F.ui,
                    }}
                  >
                    {o === 'T' ? '✓' : o === 'F' ? '✗' : o}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}

// -- adding a paper ---------------------------------------------------------

function Setup({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [keyText, setKeyText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const parsed = parseKey(keyText);
  const ready = !!file && !!name.trim() && !parsed.error;

  const commit = async () => {
    if (!ready || !file) return;
    setBusy(true);
    const ok = await savePaper({
      id: String(Date.now()),
      name: name.trim(),
      key: parsed.key,
      audio: file,
      at: Date.now(),
    });
    setBusy(false);
    if (!ok) return setFailed(true);
    onDone();
  };

  const field = {
    width: '100%',
    boxSizing: 'border-box' as const,
    fontFamily: F.ui,
    fontSize: 15,
    fontWeight: 700,
    color: C.ink,
    background: C.card,
    border: `2px solid ${C.ink}`,
    borderRadius: 12,
    padding: '10px 14px',
    outline: 'none',
  };

  return (
    <Shell>
      <div style={card}>
        <button onClick={onCancel} style={{ ...btn(C.card, C.ink), padding: '6px 14px', fontSize: 13 }}>
          ← Huỷ
        </button>

        <h2 style={{ margin: '14px 0 4px', fontSize: 23, fontWeight: 800 }}>Nạp một đề thật</h2>

        <div style={label}>1 · Tên đề</div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ví dụ: H41332"
          style={field}
        />

        <div style={label}>2 · File nghe (mp3 · wav · m4a)</div>
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            setFile(f);
            if (f && !name.trim()) setName(f.name.replace(/\.[^.]+$/, ''));
          }}
          style={{ ...field, fontWeight: 600, padding: 10 }}
        />
        {file && (
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.okInk, marginTop: 5 }}>
            ✓ {file.name} · {(file.size / 1048576).toFixed(1)} MB
          </div>
        )}

        <div style={label}>3 · Đáp án phần nghe ({LISTEN_COUNT} câu)</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          {PAPER_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                setKeyText(preset.key);
                if (!name.trim()) setName(preset.id);
              }}
              title={preset.note}
              style={{
                border: `2px solid ${C.ink}`,
                background: C.soft,
                color: C.ink,
                borderRadius: 99,
                padding: '5px 14px',
                fontSize: 12.5,
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: F.ui,
              }}
            >
              Điền sẵn: {preset.id}
            </button>
          ))}
        </div>
        <p style={{ margin: '0 0 6px', fontSize: 12.5, fontWeight: 600, color: C.muted2, lineHeight: 1.55 }}>
          Chép từ bảng đáp án trong PDF. Câu 1–{TF_COUNT} là đúng/sai — gõ được cả ✓ ✗ · T F · 对 错 ·
          + −. Câu {TF_COUNT + 1}–{LISTEN_COUNT} gõ A B C D. Dấu cách, dấu phẩy và số thứ tự đều được
          bỏ qua.
        </p>
        <textarea
          value={keyText}
          onChange={(e) => setKeyText(e.target.value)}
          rows={4}
          placeholder="✓✗✓✓✗✗✓✗✓✓  BACDB CADBC ..."
          style={{ ...field, resize: 'vertical', fontFamily: F.ui }}
        />
        <div
          style={{
            fontSize: 12.5,
            fontWeight: 700,
            marginTop: 5,
            color: parsed.error ? C.badInk : C.okInk,
          }}
        >
          {keyText.trim()
            ? (parsed.error ?? `✓ Đọc được đủ ${LISTEN_COUNT} đáp án`)
            : `Đang trống — cần ${LISTEN_COUNT} đáp án`}
        </div>

        {failed && (
          <div
            style={{
              background: C.badBg,
              border: `2px solid ${C.red}`,
              borderRadius: 12,
              padding: '10px 14px',
              marginTop: 14,
              fontSize: 13,
              fontWeight: 700,
              color: C.badInk,
            }}
          >
            Không lưu được file. Trình duyệt đang chặn bộ nhớ cục bộ — thường là do chế độ ẩn danh
            hoặc cài đặt chặn cookie/dữ liệu trang. Mở lại ở cửa sổ thường rồi thử lại nhé.
          </div>
        )}

        <div style={{ marginTop: 18 }}>
          <button
            onClick={() => void commit()}
            disabled={!ready || busy}
            style={{ ...btn(ready ? C.red : C.edge), cursor: ready ? 'pointer' : 'default' }}
          >
            {busy ? 'Đang lưu…' : 'Lưu đề'}
          </button>
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '24px 16px 60px',
      }}
    >
      {children}
    </div>
  );
}
