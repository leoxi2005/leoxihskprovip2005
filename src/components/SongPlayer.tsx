import { useEffect, useRef } from 'react';
import { C, shadow } from '../theme';

/** The slice of the YouTube IFrame API this app uses. */
interface YTPlayer {
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  getCurrentTime: () => number;
  /** -1 unstarted · 0 ended · 1 playing · 2 paused · 3 buffering · 5 cued */
  getPlayerState: () => number;
  loadVideoById: (opts: { videoId: string; startSeconds?: number }) => void;
  setPlaybackRate: (rate: number) => void;
  destroy: () => void;
}

const UNSTARTED = -1;
const PLAYING = 1;
const CUED = 5;

declare global {
  interface Window {
    YT?: {
      Player: new (el: HTMLElement, opts: unknown) => YTPlayer;
      loaded?: number;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const API_SRC = 'https://www.youtube.com/iframe_api';

/** Loads the IFrame API once, no matter how many players mount. */
function loadApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  return new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    if (!document.querySelector(`script[src="${API_SRC}"]`)) {
      const s = document.createElement('script');
      s.src = API_SRC;
      document.head.appendChild(s);
    }
  });
}

export interface SongPlayerHandle {
  /** Play exactly one lyric line, then stop. `rate` < 1 for a slow replay. */
  playLine: (from: number, to: number, rate?: number) => void;
  stop: () => void;
}

/**
 * The song's video, driven by the app rather than left to run on its own.
 *
 * A free-running video sings whatever it likes while the quiz asks about some other
 * line — you can never actually hear the line you're being asked about. So playback
 * is seeked to the line in question and stopped at its end, the way LyricsTraining
 * pauses at each gap.
 */
export function SongPlayer({
  videoId,
  ref,
  onLineEnd,
}: {
  videoId: string;
  ref?: { current: SongPlayerHandle | null };
  /** Fired when a line finishes playing — the cue to ask the question. */
  onLineEnd?: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const player = useRef<YTPlayer | null>(null);
  const ready = useRef(false);
  /** A line asked for before the player finished booting — played on ready. */
  const queued = useRef<[number, number, number] | null>(null);
  const stopAt = useRef<number | null>(null);
  /** The line we asked for, until playback actually lands inside it. */
  const want = useRef<{ from: number; to: number; since: number } | null>(null);
  const lastSeek = useRef(0);
  const poll = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const endCb = useRef(onLineEnd);
  endCb.current = onLineEnd;

  const play = (from: number, to: number, rate: number) => {
    const p = player.current;
    // The first question always arrives before the iframe API is up; hold the
    // request rather than drop it, or the song opens on silence.
    if (!ready.current || !p?.seekTo) {
      queued.current = [from, to, rate];
      return;
    }
    try {
      stopAt.current = to;
      want.current = { from, to, since: Date.now() };
      p.setPlaybackRate(rate);

      const state = p.getPlayerState();
      if (state === UNSTARTED || state === CUED) {
        // Nothing is loaded yet, and a seek issued now is silently ignored — playback
        // would start from zero, which for this song is 18 seconds of intro that
        // sounds like the app is broken. loadVideoById is the API's own way to start
        // at a given second.
        p.loadVideoById({ videoId, startSeconds: from });
      } else {
        p.seekTo(from, true);
        p.playVideo();
      }
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    let dead = false;
    ready.current = false;
    loadApi().then(() => {
      if (dead || !host.current || !window.YT) return;
      player.current = new window.YT.Player(host.current, {
        videoId,
        playerVars: { controls: 1, rel: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onReady: () => {
            if (dead) return;
            ready.current = true;
            const q = queued.current;
            queued.current = null;
            if (q) play(...q);
          },
        },
      });
    });

    // getCurrentTime is the only way to know where playback is; 100ms is tight enough
    // that a line stops on its last syllable rather than bleeding into the next.
    poll.current = setInterval(() => {
      const p = player.current;
      if (!p?.getCurrentTime) return;
      const t = p.getCurrentTime();

      // A seek issued while the video is still loading is silently dropped, and the
      // song then plays from the top — 18 seconds of intro that sound like the app is
      // broken. Seeking only once playback is actually running is what makes it stick.
      const w = want.current;
      if (w) {
        if (t >= w.from - 0.5 && t <= w.to + 0.5) {
          want.current = null;
        } else if (Date.now() - w.since > 10000) {
          want.current = null; // give up rather than fight the player forever
        } else if (p.getPlayerState() === PLAYING && Date.now() - lastSeek.current > 500) {
          lastSeek.current = Date.now();
          p.seekTo(w.from, true);
        }
      }

      if (stopAt.current !== null && t >= stopAt.current) {
        stopAt.current = null;
        want.current = null;
        p.pauseVideo();
        endCb.current?.();
      }
    }, 100);

    return () => {
      dead = true;
      clearInterval(poll.current);
      try {
        player.current?.destroy();
      } catch {
        /* the API throws if the iframe is already gone */
      }
      player.current = null;
    };
  }, [videoId]);

  useEffect(() => {
    if (!ref) return;
    ref.current = {
      playLine: (from, to, rate = 1) => play(from, to, rate),
      stop: () => {
        stopAt.current = null;
        queued.current = null;
        want.current = null;
        try {
          player.current?.pauseVideo();
        } catch {
          /* ignore */
        }
      },
    };
    return () => {
      if (ref) ref.current = null;
    };
  }, [ref]);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 640,
        marginTop: 14,
        border: `3px solid ${C.ink}`,
        borderRadius: 18,
        overflow: 'hidden',
        boxShadow: shadow(5),
        background: '#000',
        aspectRatio: '16/9',
      }}
    >
      <div ref={host} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
