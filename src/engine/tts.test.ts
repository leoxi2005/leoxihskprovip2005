import { afterEach, describe, expect, it, vi } from 'vitest';
import { Audio } from './audio';
import { ttsKey, ttsKeyOf } from './tts';
import clipKeys from '../data/tts.json';
import { migrateVoiceRate } from './storage';
import { DEFAULT_SETTINGS } from './types';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

/**
 * Tên file bản thu là hàm băm của chính câu đó, tính ở hai nơi: `tools/tts/collect.mjs`
 * lúc thu, và app lúc phát. Đổi hàm băm mà quên thu lại là toàn bộ 2.600 file thành rác
 * mà không có lỗi nào báo lên — nên khoá của vài câu quen được chốt cứng ở đây.
 */
describe('khoá bản thu', () => {
  it('không đổi theo thời gian', () => {
    expect(ttsKey('你好')).toBe(ttsKey('你好'));
    expect(ttsKey('短信')).toBe('a218505b');
    expect(ttsKey('我给他发了一条短信。')).toBe('ac991d31');
  });

  it('phân biệt câu khác nhau', () => {
    expect(ttsKey('他去了')).not.toBe(ttsKey('他不去'));
  });

  it('nối các lượt nói bằng xuống dòng, đúng như lúc thu', () => {
    expect(ttsKeyOf(['男：你好', '女：你好'])).toBe(ttsKey('男：你好\n女：你好'));
  });
});

/** Thẻ <audio> giả, ghi lại app đã yêu cầu phát gì. */
function fakeAudioTag(canPlay = 'probably') {
  const el = {
    canPlayType: () => canPlay,
    play: () => Promise.resolve(),
    pause: () => {},
    src: '',
    playbackRate: 1,
    currentTime: 0,
    preservesPitch: false,
    onerror: null as (() => void) | null,
  };
  const real = document.createElement.bind(document);
  vi.spyOn(document, 'createElement').mockImplementation((tag: string) =>
    tag === 'audio' ? (el as unknown as HTMLElement) : real(tag),
  );
  return el;
}

/** Bộ đếm giọng máy — để biết khi nào app rơi về đường dự phòng. */
function synthSpy() {
  const spoken: string[] = [];
  class U {
    voice: unknown;
    lang = '';
    rate = 1;
    pitch = 1;
    onstart: (() => void) | null = null;
    onerror: (() => void) | null = null;
    text: string;
    constructor(text: string) {
      this.text = text;
    }
  }
  vi.stubGlobal('SpeechSynthesisUtterance', U);
  vi.stubGlobal('speechSynthesis', {
    speaking: false,
    pending: false,
    getVoices: () => [{ name: 'Tingting', lang: 'zh-CN' }],
    resume: () => {},
    cancel: () => {},
    speak: (u: U) => spoken.push(u.text),
    addEventListener: () => {},
    removeEventListener: () => {},
  });
  return spoken;
}

describe('chọn đường đọc', () => {
  it('phát bản thu sẵn thay vì giọng máy khi câu đã được thu', () => {
    const el = fakeAudioTag();
    const spoken = synthSpy();
    new Audio().speak('短信');
    expect(el.src).toContain(`tts/${ttsKey('短信')}.mp3`);
    expect(spoken).toEqual([]);
  });

  it('giữ nguyên cao độ khi học chậm lại', () => {
    const el = fakeAudioTag();
    synthSpy();
    const a = new Audio();
    a.rate = 0.7;
    a.speak('短信');
    expect(el.playbackRate).toBe(0.7);
    expect(el.preservesPitch).toBe(true);
  });

  it('chế độ thi phát đúng tốc độ băng thi dù người học đang để chậm', () => {
    const el = fakeAudioTag();
    synthSpy();
    const a = new Audio();
    a.rate = 0.7;
    a.speakDialogue(['男：你好'], 1);
    expect(el.playbackRate).toBe(1);
  });

  it('rơi về giọng máy khi câu chưa có bản thu', () => {
    fakeAudioTag();
    const spoken = synthSpy();
    new Audio().speak('这句话没有人录过。');
    expect(spoken).toEqual(['这句话没有人录过。']);
  });

  it('không đụng tới bản thu khi trình duyệt không phát nổi mp3', () => {
    const el = fakeAudioTag('');
    const spoken = synthSpy();
    new Audio().speak('短信');
    expect(el.src).toBe('');
    expect(spoken).toEqual(['短信']);
  });

  it('tắt tiếng thì không phát gì cả', () => {
    const el = fakeAudioTag();
    const spoken = synthSpy();
    const a = new Audio();
    a.muted = true;
    a.speak('短信');
    expect(el.src).toBe('');
    expect(spoken).toEqual([]);
  });
});

describe('bản kê khoá', () => {
  it('không có khoá trùng', () => {
    expect(new Set(clipKeys).size).toBe(clipKeys.length);
  });
});

describe('tốc độ đọc mặc định', () => {
  it('mặc định nhanh hơn băng thi một nhịp', () => {
    expect(DEFAULT_SETTINGS.voiceRate).toBe(1.15);
    // Thanh trượt phải bước 0.05 mới chọn lại được đúng con số này.
    expect(Math.round(DEFAULT_SETTINGS.voiceRate * 100) % 5).toBe(0);
  });

  it('nâng cả 0.9 lẫn 1 lên mặc định mới, mỗi mốc đúng một lần', () => {
    localStorage.clear();
    // 0.9 là mặc định thời giọng máy, 1 là mặc định của bản kế tiếp — cả hai đều là
    // con số người học chưa từng chọn, nên đi thẳng lên 1.15.
    expect(migrateVoiceRate({ ...DEFAULT_SETTINGS, voiceRate: 0.9 }).voiceRate).toBe(1.15);
    // Lần thứ hai không đụng vào nữa: kéo xuống 0.8 xong tải lại trang mà bị kéo về
    // thì thanh trượt coi như hỏng.
    expect(migrateVoiceRate({ ...DEFAULT_SETTINGS, voiceRate: 0.8 }).voiceRate).toBe(0.8);
  });

  it('không đụng tới tốc độ người học tự chọn', () => {
    localStorage.clear();
    expect(migrateVoiceRate({ ...DEFAULT_SETTINGS, voiceRate: 0.6 }).voiceRate).toBe(0.6);
  });
});

describe('đề mô phỏng không chạy theo tốc độ luyện', () => {
  it('vẫn đúng tốc độ băng thi khi người học để nhanh', () => {
    const el = fakeAudioTag();
    synthSpy();
    const a = new Audio();
    a.rate = 1.15;
    a.speakExam(['男：你好']);
    expect(el.playbackRate).toBe(1);
  });

  it('và cũng đúng tốc độ đó khi người học để chậm', () => {
    const el = fakeAudioTag();
    synthSpy();
    const a = new Audio();
    a.rate = 0.7;
    a.speakExam(['男：你好']);
    expect(el.playbackRate).toBe(1);
  });
});
