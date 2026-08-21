/**
 * Đăng ký service worker và điều khiển việc tải trước.
 *
 * Chỉ chạy ở bản build: bật service worker trong lúc `npm run dev` thì Vite phục vụ
 * module nóng qua chính đường mạng mà worker đang chặn, và mọi thay đổi code sẽ hiện
 * ra chậm một nhịp — thứ tốn hàng giờ để lần ra.
 */
import ttsKeys from '../data/tts.json';

const BASE = import.meta.env.BASE_URL;

export const swSupported = (): boolean => typeof navigator !== 'undefined' && 'serviceWorker' in navigator;

export function registerSW(): void {
  if (!swSupported() || !import.meta.env.PROD) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(BASE + 'sw.js', { scope: BASE }).catch(() => {
      /* Không có worker thì app vẫn chạy bình thường, chỉ là cần mạng. */
    });
  });
}

/** Mọi tệp cần có sẵn để học offline hoàn toàn. */
export function offlineUrls(): string[] {
  return [
    ...(ttsKeys as string[]).map((k) => `${BASE}tts/${k}.mp3`),
    `${BASE}audio/hsk4-h41001.mp3`,
  ];
}

/** Ước lượng dung lượng, để nút bấm nói trước con số thay vì bắt người dùng đoán. */
export const OFFLINE_MB = 65;

export interface PreloadProgress {
  done: number;
  total: number;
  finished?: boolean;
  failed?: number;
}

/**
 * Bảo worker tải sẵn toàn bộ giọng đọc.
 *
 * Trả về `false` khi chưa có worker nào điều khiển trang — lần đầu mở app sau khi cài
 * worker là như vậy, tải lại trang một lần là xong.
 */
export function preloadAll(onProgress: (p: PreloadProgress) => void): boolean {
  if (!swSupported() || !navigator.serviceWorker.controller) return false;
  const channel = new MessageChannel();
  channel.port1.onmessage = (e) => onProgress(e.data as PreloadProgress);
  navigator.serviceWorker.controller.postMessage(
    { type: 'preload', urls: offlineUrls() },
    [channel.port2],
  );
  return true;
}

/** Bao nhiêu tệp đã nằm sẵn trong máy. */
export async function cachedCount(): Promise<{ have: number; total: number }> {
  const urls = offlineUrls();
  if (typeof caches === 'undefined') return { have: 0, total: urls.length };
  const cache = await caches.open('hskq-media');
  const keys = await cache.keys();
  return { have: keys.length, total: urls.length };
}
