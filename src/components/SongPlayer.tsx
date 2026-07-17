import { useEffect, useRef } from 'react';
import { C, shadow } from '../theme';

/** The slice of the YouTube IFrame API this app uses. */
interface YTPlayer {
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  getCurrentTime: () => number;
  setPlaybackRate: (rate: number) => void;
  destroy: () => void;
}

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
      p.setPlaybackRate(rate);
      stopAt.current = to;
      p.seekTo(from, true);
      p.playVideo();
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
      if (!p || stopAt.current === null || !p.getCurrentTime) return;
      if (p.getCurrentTime() >= stopAt.current) {
        stopAt.current = null;
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
