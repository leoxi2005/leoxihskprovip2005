/**
 * Service worker — để app học được khi mất mạng.
 *
 * App nặng 65MB nhưng gần như toàn bộ là **nội dung bất biến**: mỗi câu thu sẵn nằm ở
 * một tên tệp băm từ chính câu đó (`/tts/8f3a…mp3`), sửa câu là ra tên khác. Thứ gì
 * không bao giờ đổi ruột thì lấy từ cache trước, khỏi hỏi mạng — đó là lý do phần lớn
 * quy tắc dưới đây là "cache-first".
 *
 * Không nạp sẵn 65MB lúc cài: người mới mở app lần đầu mà phải tải hết mới dùng được
 * thì họ đóng app. Mặc định là **học tới đâu giữ tới đó**, còn ai muốn học trên đường
 * thì bấm nút tải trước trong Cài đặt.
 *
 * Tệp này nằm trong `public/` nên không qua bundler — viết bằng JS thuần, không import.
 */
const VERSION = 'v1';
const SHELL = `hskq-shell-${VERSION}`;
/**
 * Nội dung bất biến không gắn phiên bản: tên tệp đã băm theo nội dung rồi, đổi nội
 * dung là đổi tên. Gắn thêm phiên bản chỉ tổ bắt tải lại 65MB sau mỗi lần cập nhật app.
 */
const MEDIA = 'hskq-media';

/** Đường dẫn gốc, ví dụ `/leoxihskprovip2005/`. */
const BASE = new URL('./', self.registration.scope).pathname;

const isMedia = (p) => /\/(tts|audio|img)\//.test(p) || /\.(mp3|jpe?g|png|webp|woff2?)$/i.test(p);
/** Tệp build đã băm tên (`/assets/index-CStIMTuM.js`) — cũng bất biến. */
const isHashedAsset = (p) => p.includes('/assets/') && /-[A-Za-z0-9_]{8,}\./.test(p);

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys();
      // Dọn shell cũ, GIỮ media: nội dung bất biến không có lý do gì phải tải lại.
      await Promise.all(keys.filter((k) => k.startsWith('hskq-shell-') && k !== SHELL).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

/** Lấy cache trước; không có thì ra mạng rồi cất lại. */
async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  // Chỉ cất bản trả về lành lặn — cất một lỗi 404 là giữ lỗi đó lại vĩnh viễn.
  if (res.ok && res.status === 200) cache.put(req, res.clone());
  return res;
}

/** Ra mạng trước, hỏng thì lấy cache — dùng cho trang và cho những gì có thể đổi. */
async function networkFirst(req, cacheName, fallback) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = (await cache.match(req)) || (fallback && (await cache.match(fallback)));
    if (hit) return hit;
    throw err;
  }
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Mở app: ưu tiên bản mới, mất mạng thì mở bản đã lưu.
  if (req.mode === 'navigate') {
    e.respondWith(networkFirst(req, SHELL, BASE + 'index.html'));
    return;
  }
  if (isMedia(url.pathname)) {
    e.respondWith(cacheFirst(req, MEDIA));
    return;
  }
  if (isHashedAsset(url.pathname)) {
    e.respondWith(cacheFirst(req, SHELL));
    return;
  }
  e.respondWith(networkFirst(req, SHELL));
});

/**
 * Tải trước, theo lệnh từ màn Cài đặt.
 *
 * Báo tiến độ ngược về trang để người dùng thấy nó đang chạy — tải 45MB trong im lặng
 * thì không ai biết nên chờ hay nên bỏ.
 */
self.addEventListener('message', (e) => {
  const data = e.data || {};
  if (data.type !== 'preload' || !Array.isArray(data.urls)) return;
  const port = e.ports && e.ports[0];
  e.waitUntil(
    (async () => {
      const cache = await caches.open(MEDIA);
      let done = 0;
      let failed = 0;
      // Bốn tệp một lúc: nhiều hơn thì mạng yếu bị nghẽn, ít hơn thì chờ lâu vô ích.
      const queue = data.urls.slice();
      const worker = async () => {
        for (let u = queue.pop(); u; u = queue.pop()) {
          try {
            if (!(await cache.match(u))) {
              const res = await fetch(u);
              if (res.ok) await cache.put(u, res.clone());
              else failed++;
            }
          } catch {
            failed++;
          }
          done++;
          if (port && done % 20 === 0) port.postMessage({ done, total: data.urls.length });
        }
      };
      await Promise.all([worker(), worker(), worker(), worker()]);
      if (port) port.postMessage({ done, total: data.urls.length, failed, finished: true });
    })(),
  );
});
