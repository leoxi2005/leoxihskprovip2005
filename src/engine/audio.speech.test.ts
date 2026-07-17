import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Audio } from './audio';

/**
 * A stand-in for Chrome's speech synthesis, including the ways it misbehaves.
 * The real thing can leave the queue `paused` (usually after the tab was hidden),
 * and can swallow an utterance without firing any event.
 */
class FakeSynth {
  spoken: string[] = [];
  paused = false;
  speaking = false;
  pending = false;
  resumeCalls = 0;
  cancelCalls = 0;
  /** When set, speak() accepts the utterance but never starts it. */
  swallow = false;
  private last: SpeechSynthesisUtterance | undefined;

  getVoices = () => [];
  cancel = () => {
    this.cancelCalls++;
    this.speaking = false;
    this.pending = false;
  };
  resume = () => {
    this.resumeCalls++;
    this.paused = false;
  };
  pause = () => (this.paused = true);
  speak = (u: SpeechSynthesisUtterance) => {
    this.last = u;
    // A paused queue accepts the utterance and sits on it — this is the silent failure.
    if (this.paused || this.swallow) {
      this.pending = this.paused;
      return;
    }
    this.spoken.push(u.text);
    this.speaking = true;
    u.onstart?.(new Event('start') as SpeechSynthesisEvent);
  };
  /** Simulate the synth reporting a failure for the last utterance. */
  failLast(error = 'synthesis-failed') {
    this.speaking = false;
    this.last?.onerror?.({ error } as SpeechSynthesisErrorEvent);
  }
}

let synth: FakeSynth;
let audio: Audio;

beforeEach(() => {
  vi.useFakeTimers();
  synth = new FakeSynth();
  vi.stubGlobal('speechSynthesis', synth);
  vi.stubGlobal('SpeechSynthesisUtterance', class {
    text: string;
    lang = '';
    rate = 1;
    pitch = 1;
    voice: unknown = null;
    onstart: ((e: unknown) => void) | null = null;
    onerror: ((e: unknown) => void) | null = null;
    constructor(text: string) {
      this.text = text;
    }
  });
  audio = new Audio();
});

afterEach(() => {
  audio.destroy();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('speaking through Chrome misbehaving', () => {
  it('speaks normally', () => {
    audio.speak('你好');
    vi.advanceTimersByTime(250);
    expect(synth.spoken).toEqual(['你好']);
  });

  it('recovers when the queue was left paused', () => {
    // What a tab switch mid-speech leaves behind: speak() would queue silently forever.
    synth.pause();
    audio.speak('你好');
    vi.advanceTimersByTime(250);
    expect(synth.resumeCalls).toBeGreaterThan(0);
    expect(synth.spoken).toEqual(['你好']);
  });

  it('retries once when an utterance is swallowed without any event', () => {
    synth.swallow = true;
    audio.speak('谢谢');
    vi.advanceTimersByTime(250);
    expect(synth.spoken).toEqual([]);

    // The watchdog notices nothing is speaking or pending, and tries again.
    synth.swallow = false;
    vi.advanceTimersByTime(500);
    expect(synth.spoken).toEqual(['谢谢']);
  });

  it('retries once after a synthesis error', () => {
    audio.speak('再见');
    vi.advanceTimersByTime(250);
    synth.spoken = [];
    synth.failLast();
    expect(synth.spoken).toEqual(['再见']);
  });

  it('does not retry when we cancelled it ourselves', () => {
    audio.speak('一');
    vi.advanceTimersByTime(250);
    synth.spoken = [];
    // This is what our own cancel() produces — re-speaking would talk over the new word.
    synth.failLast('interrupted');
    vi.advanceTimersByTime(500);
    expect(synth.spoken).toEqual([]);
  });

  it('never retries more than once, however broken the synth is', () => {
    synth.swallow = true;
    audio.speak('二');
    vi.advanceTimersByTime(2000);
    expect(synth.spoken).toEqual([]);
    synth.swallow = false;
    vi.advanceTimersByTime(5000);
    // The one retry already happened while swallowing; no runaway loop of attempts.
    expect(synth.spoken).toEqual([]);
  });

  it('only ever speaks the newest word when answers come fast', () => {
    audio.speak('一');
    vi.advanceTimersByTime(50);
    audio.speak('二');
    vi.advanceTimersByTime(50);
    audio.speak('三');
    vi.advanceTimersByTime(500);
    expect(synth.spoken).toEqual(['三']);
  });

  it('leaves the queue usable after a hush', () => {
    synth.pause();
    audio.hush();
    // A cancel() on a paused queue leaves it paused and silences everything after.
    expect(synth.paused).toBe(false);

    audio.speak('四');
    vi.advanceTimersByTime(250);
    expect(synth.spoken).toEqual(['四']);
  });

  it('nudges the synth when the tab becomes visible again', () => {
    synth.pause();
    const before = synth.resumeCalls;
    document.dispatchEvent(new Event('visibilitychange'));
    expect(synth.resumeCalls).toBeGreaterThan(before);
    expect(synth.paused).toBe(false);
  });

  it('stays silent when muted', () => {
    audio.muted = true;
    audio.speak('五');
    vi.advanceTimersByTime(500);
    expect(synth.spoken).toEqual([]);
  });
});
