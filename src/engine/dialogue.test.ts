import { describe, expect, it, vi } from 'vitest';
import { Audio, splitRole } from './audio';

describe('speaker labels', () => {
  /**
   * The recording never says 男 or 女 out loud — you hear two different people. Reading
   * the label aloud both wastes listening time and hands over the speaker cue that the
   * paper is partly testing.
   */
  it('strips the label and keeps the line', () => {
    expect(splitRole('男：你怎么还站在门口？')).toEqual({ role: 'male', text: '你怎么还站在门口？' });
    expect(splitRole('女：我在等小李。')).toEqual({ role: 'female', text: '我在等小李。' });
    expect(splitRole('问：女的在做什么？')).toEqual({ role: 'narrator', text: '女的在做什么？' });
  });

  it('accepts both the full-width and the plain colon', () => {
    expect(splitRole('男: 好的。').text).toBe('好的。');
  });

  it('leaves an unlabelled monologue alone', () => {
    const line = '很多人以为只有年轻人才需要运动。';
    expect(splitRole(line)).toEqual({ role: 'narrator', text: line });
  });

  it('never mistakes 男 or 女 inside the sentence for a label', () => {
    expect(splitRole('男的说他明天来。').text).toBe('男的说他明天来。');
  });
});

describe('reading a listening item', () => {
  /** Minimal synth double: records what was queued, in order. */
  function synthSpy(voices: { name: string; lang: string }[]) {
    const spoken: { text: string; voice?: string; pitch: number; rate: number }[] = [];
    class U {
      voice: { name: string } | undefined;
      lang = '';
      rate = 1;
      pitch = 1;
      onstart: (() => void) | null = null;
      onerror: ((e: { error: string }) => void) | null = null;
      text: string;
      constructor(text: string) {
        this.text = text;
      }
    }
    vi.stubGlobal('SpeechSynthesisUtterance', U);
    vi.stubGlobal('speechSynthesis', {
      speaking: false,
      pending: false,
      getVoices: () => voices,
      resume: () => {},
      cancel: () => {},
      speak: (u: U) => spoken.push({ text: u.text, voice: u.voice?.name, pitch: u.pitch, rate: u.rate }),
      addEventListener: () => {},
      removeEventListener: () => {},
    });
    return spoken;
  }

  const LINES = ['男：你怎么还站在门口？', '女：我在等小李。', '问：女的在做什么？'];

  it('queues one utterance per turn, without the labels', () => {
    const spoken = synthSpy([{ name: 'Ting-Ting', lang: 'zh-CN' }]);
    new Audio().speakDialogue(LINES);
    expect(spoken.map((s) => s.text)).toEqual(['你怎么还站在门口？', '我在等小李。', '女的在做什么？']);
  });

  it('uses a real second voice for the other speaker when the system has one', () => {
    const spoken = synthSpy([
      { name: 'Microsoft Yunxi', lang: 'zh-CN' },
      { name: 'Microsoft Xiaoxiao', lang: 'zh-CN' },
    ]);
    new Audio().speakDialogue(LINES);
    expect(spoken[0].voice).toBe('Microsoft Yunxi');
    expect(spoken[1].voice).toBe('Microsoft Xiaoxiao');
    // Real voices carry the difference, so no pitch trickery is applied.
    expect(spoken.every((s) => s.pitch === 1)).toBe(true);
  });

  it('falls back to a pitch split when only one Mandarin voice exists', () => {
    const spoken = synthSpy([{ name: 'Ting-Ting', lang: 'zh-CN' }]);
    new Audio().speakDialogue(LINES);
    expect(spoken[0].pitch).toBeLessThan(1);
    expect(spoken[1].pitch).toBeGreaterThan(1);
    expect(spoken[2].pitch).toBe(1);
  });

  it('never plays the exam slower than natural, whatever practice is set to', () => {
    const spoken = synthSpy([{ name: 'Ting-Ting', lang: 'zh-CN' }]);
    const a = new Audio();
    a.rate = 0.7;
    a.speakDialogue(LINES, 1);
    expect(spoken.every((s) => s.rate === 1)).toBe(true);

    a.speakDialogue(LINES);
    expect(spoken.at(-1)!.rate).toBe(0.7);
  });

  it('says nothing at all when muted', () => {
    const spoken = synthSpy([{ name: 'Ting-Ting', lang: 'zh-CN' }]);
    const a = new Audio();
    a.muted = true;
    a.speakDialogue(LINES);
    expect(spoken).toEqual([]);
  });
});
