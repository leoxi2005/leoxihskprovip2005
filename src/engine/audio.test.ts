import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GameEngine } from './GameEngine';
import { isTypeQ, type GameId } from './types';

/** Live engines, disposed after each test — a running TF timer would outlive the run. */
const engines: GameEngine[] = [];

/** Records what actually reaches the synth, so "does it talk?" is a real assertion. */
function engineWithSpy() {
  const engine = new GameEngine();
  engines.push(engine);
  engine.init();
  const spoken: string[] = [];
  engine.audio.speak = (t: string) => {
    if (t) spoken.push(t);
  };
  engine.audio.hush = () => {};
  // Silence the oscillator SFX — jsdom has no AudioContext.
  engine.audio.tone = () => {};
  return { engine, spoken };
}

const start = (engine: GameEngine, g: GameId) => {
  engine.topics.forEach((t) => (engine.sel[t] = true));
  engine.startGame(g);
};

beforeEach(() => localStorage.clear());

afterEach(() => {
  engines.splice(0).forEach((e) => e.dispose());
  vi.unstubAllGlobals();
});

describe('the real song never gets talked over', () => {
  it('says nothing when a lyric line appears', () => {
    const { engine, spoken } = engineWithSpy();
    start(engine, 'mysong');
    expect(engine.cur()?.kind).toBe('song');
    expect(spoken).toEqual([]);
  });

  it('says nothing when the answer is checked', () => {
    const { engine, spoken } = engineWithSpy();
    start(engine, 'mysong');
    engine.pick(0);
    engine.check();
    expect(engine.state.checked).toBe(true);
    expect(spoken).toEqual([]);
  });

  it('says nothing when advancing to the next line', () => {
    const { engine, spoken } = engineWithSpy();
    start(engine, 'mysong');
    engine.pick(0);
    engine.check();
    engine.next();
    expect(spoken).toEqual([]);
  });

  it('still reads the line when the 🔊 button is pressed', () => {
    const { engine, spoken } = engineWithSpy();
    start(engine, 'mysong');
    engine.playPrompt();
    expect(spoken).toHaveLength(1);
  });
});

describe('chants (no video) still get read', () => {
  it('reads the line with a pause where the blank is', () => {
    const { engine, spoken } = engineWithSpy();
    start(engine, 'song');
    const q = engine.cur();
    expect(q?.kind).toBe('song');
    expect(spoken).toHaveLength(1);
    expect(spoken[0]).toContain('……');
  });
});

describe('mute', () => {
  it('keeps the engine quiet everywhere', () => {
    const engine = new GameEngine();
    engines.push(engine);
    engine.init();
    const spoken: string[] = [];
    // Spy below the mute check, on the synth itself.
    vi.stubGlobal('speechSynthesis', {
      speak: (u: { text: string }) => spoken.push(u.text),
      cancel: () => {},
      getVoices: () => [],
    });
    engine.audio.tone = () => {};
    engine.toggleMute();
    expect(engine.state.muted).toBe(true);

    start(engine, 'listen');
    engine.audio.speak('测试');
    expect(spoken).toEqual([]);
  });
});

describe('listening exercises always speak', () => {
  it.each(['listen', 'tf'] as GameId[])('%s reads the prompt on show', (g) => {
    const { engine, spoken } = engineWithSpy();
    start(engine, g);
    expect(spoken.length).toBeGreaterThan(0);
  });
});

describe('keyboard', () => {
  const key = (init: KeyboardEventInit & { key: string }, target?: EventTarget) => {
    const e = new KeyboardEvent('keydown', { ...init, cancelable: true, bubbles: true });
    if (target) Object.defineProperty(e, 'target', { value: target });
    return e;
  };

  it('claims Enter on the home screen so a focused button cannot also fire', () => {
    const { engine } = engineWithSpy();
    engine.topics.forEach((t) => (engine.sel[t] = true));
    const e = key({ key: 'Enter' });
    engine.handleKey(e);
    expect(e.defaultPrevented).toBe(true);
    expect(engine.state.mode).toBe('quiz');
  });

  it('leaves Enter alone in a text field outside the quiz', () => {
    const { engine } = engineWithSpy();
    engine.openBook();
    const input = document.createElement('input');
    const e = key({ key: 'Enter' }, input);
    engine.handleKey(e);
    expect(e.defaultPrevented).toBe(false);
    expect(engine.state.mode).toBe('book');
  });

  it('checks the answer on Enter from the IME input, but not mid-composition', () => {
    const { engine } = engineWithSpy();
    start(engine, 'write');
    // "Luyện Viết" deals tile, type and dict questions at random — walk to a typed one.
    const at = engine.state.session.findIndex(isTypeQ);
    expect(at).toBeGreaterThanOrEqual(0);
    while (engine.state.qi < at) engine.next();

    const input = document.createElement('input');

    engine.handleKey(key({ key: 'Enter', isComposing: true }, input));
    expect(engine.state.checked).toBe(false);

    engine.setTyped('测试');
    engine.handleKey(key({ key: 'Enter' }, input));
    expect(engine.state.checked).toBe(true);
  });

  it('does not start a session when no topic is selected', () => {
    const { engine } = engineWithSpy();
    engine.selNone();
    engine.handleKey(key({ key: 'Enter' }));
    expect(engine.state.mode).toBe('home');
  });
});
