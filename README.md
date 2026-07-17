# HSK Quest 学

**Chơi thử: https://leoxi2005.github.io/leoxihskprovip2005/**

Ứng dụng luyện từ vựng tiếng Trung HSK 3–4 cho người Việt, theo kiểu game: lặp lại ngắt quãng
(SRS), XP, lên cấp, chuỗi ngày, đấu trùm, và 12 chế độ chơi. Toàn bộ tiến độ lưu ngay trong
trình duyệt — không cần tài khoản, không cần server.

Tác giả: **leoxi**

## Nội dung

- **331 từ vựng** · 43 điểm ngữ pháp · 35 bài đọc · 8 câu sắp xếp · 8 cặp từ dễ nhầm
- 59 ảnh minh hoạ AI + mẹo nhớ tiếng Việt cho từng từ
- Hoạt hình viết từng nét (bộ thủ tô đỏ) cho mọi chữ Hán
- 3 bài chant tự soạn + 1 bài hát thật có video

## Chạy trên máy

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # 48 test cho engine + nội dung
npm run build
```

## Các chế độ chơi

| | Chế độ | Phím | Mô tả |
| --- | --- | --- | --- |
| 🚀 | Trộn tất cả | `Enter` | Từ vựng + ngữ pháp + đọc hiểu, kết thúc bằng màn trùm hoặc tia chớp |
| ♾️ | **Sinh Tồn** | `S` | Chơi mãi tới khi sai **một câu**. Đồng hồ siết dần 9s → 3.5s. Có kỷ lục cá nhân |
| 🐉 | Đấu Trùm | `1` | 8 câu, trùm 100HP, 3 tim. Combo càng cao đánh càng đau |
| ⚡ | Tia Chớp | `2` | 12 câu, 6 giây mỗi câu |
| ✍️ | Luyện Viết | `3` | Ghép chữ · gõ IME · nghe viết |
| 🎧 | Luyện Nghe | `4` | Nghe chọn + nghe viết |
| 🔗 | Ghép Cặp | `5` | 6 bàn × 4 cặp |
| 🧠 | Nhớ Nhanh | `6` | Chữ hiện 1.8s rồi biến mất |
| 📚 | Ngữ pháp & Đọc | `7` | Cloze · câu · đoạn văn |
| 🎵 | Học qua nhạc | `8` | Điền từ vào lời chant |
| 🎤 | 绝弦的美 | `9` | Bài hát thật + video YouTube |
| ⚔️ | **Cặp Dễ Nhầm** | `0` | 经过 hay 通过? Chọn 1 trong 2, có lời giải thích tại sao |

Trong lúc chơi: `1–9` chọn đáp án · `Enter` kiểm tra & chuyển câu · `Backspace` xoá ·
`Esc` thoát ô tìm kiếm.

## Vì sao có Sinh Tồn và Cặp Dễ Nhầm

Hai chế độ này thêm sau, để giải quyết hai vấn đề khác nhau:

**Sinh Tồn** tạo vòng lặp "chơi thêm ván nữa". Phiên có độ dài cố định thì chơi xong là nghỉ;
còn chuỗi có kỷ lục thì luôn còn một con số để vượt. Chỉ ra câu nhận diện nhanh (nghĩa ↔ chữ),
không ra câu gõ chữ — đang chạy đua với đồng hồ mà bắt gõ IME thì là hành nhau chứ không phải thử thách.

**Cặp Dễ Nhầm** dạy thứ mà trắc nghiệm 4 đáp án không dạy được: ranh giới giữa hai từ *gần
giống nhau*. 经过 và 通过 đều là "qua", chọn sai lúc thi là mất điểm. Mỗi câu chỉ có 2 lựa chọn
và luôn kèm lý do vì sao cái kia sai.

Điểm quan trọng: **chỉ đưa vào những câu mà một trong hai từ thật sự sai.** Những câu kiểu
经过讨论 / 通过讨论 (cả hai đều đúng) bị loại — luyện những câu đó là dạy một quy tắc không có thật.

## Kiến trúc

```
src/
  data/          nội dung (JSON) + extra.ts (bài 通过 & 经过)
  engine/        toàn bộ luật chơi, không dính React
    GameEngine.ts  máy trạng thái + side effect (timer, giọng đọc, ghi SRS)
    session.ts     mỗi chế độ ra câu gì, theo thứ tự SRS
    questions.ts   dựng từng loại câu hỏi
    storage.ts     localStorage, hộp SRS, migrate dữ liệu v1
    audio.ts       TTS tiếng Trung + hiệu ứng âm thanh WebAudio
  screens/       Home · Quiz · Result · Notebook
  components/    Bar · Confetti · StrokeAnimation
  theme.ts       design token
```

`GameEngine` giữ state và side effect; React chỉ render và chuyển sự kiện vào. Nhờ vậy luật
chơi test được bằng Node, không cần dựng cây component.

## Lặp lại ngắt quãng (SRS)

Hộp 0–5 ứng với 5 phút / 30 phút / 12 giờ / 2 ngày / 5 ngày / 12 ngày. Đúng → lên hộp,
sai → về hộp 0 và câu đó quay lại ngay trong phiên (ít XP hơn, không tính điểm SRS lần hai).

Thứ tự ra câu: đến hạn trước (hạn gần nhất trước), rồi từ mới, cuối cùng là từ chưa tới hạn —
nhóm cuối được xoay vòng bằng con trỏ lưu sẵn để hai phiên liên tiếp không ra trùng câu.

Dữ liệu trong localStorage: `hskq_srs`, `hskq_stats`, `hskq_topics_v2`, `hskq_settings`,
`hskq_best_endless`, `hskq_muted`, `hskq_finale`, `hskq_rot_*`.

## Cấu hình

Không có màn hình cài đặt — chỉnh qua `engine.setSettings({...})` hoặc key `hskq_settings`.

| Cài đặt | Mặc định | Khoảng |
| --- | --- | --- |
| `autoPlayAudio` | `true` | — |
| `voiceRate` | `0.9` | 0.6–1.2 |
| `sessionSize` | `18` | 8–40 |
| `dailyGoal` | `150` | 50–500 |
| `flashMs` | `1800` | 800–4000 |

## Ghi chú kỹ thuật

- **Ảnh**: 59 ảnh đã tải về và nén còn 2.3MB (JPEG 384px), phục vụ từ `public/img/`. Đường dẫn
  neo theo `BASE_URL` để chạy được dưới subpath của GitHub Pages. Có test chặn việc hotlink ra ngoài.
- **Nét chữ**: Hanzi Writer tải dữ liệu nét từ CDN khi cần. Muốn chạy offline thì bundle
  `hanzi-writer-data` và truyền `charDataLoader`.
- **Giọng đọc**: Web Speech API, chất lượng tuỳ trình duyệt — Chrome/Edge có giọng zh-CN tốt nhất.
  Muốn đều hơn thì dùng TTS server (ví dụ Azure `zh-CN-XiaoxiaoNeural`).
- **Bài hát thật không bao giờ bị TTS đọc đè** — video tự hát rồi. Có test giữ điều này.

## Còn tồn đọng

- **10 trong 43 điểm ngữ pháp không vào được phiên nào.** Chúng gắn chủ đề `Bài 3`, mà chip chủ
  đề chỉ sinh ra từ chủ đề của *từ vựng*, không từ nào thuộc `Bài 3`. Lỗi này có từ bản prototype
  gốc; đã ghim bằng test trong `engine.test.ts`. Sửa bằng cách gắn lại chủ đề cho 10 mục đó,
  hoặc sinh chip từ toàn bộ nội dung.
- **Lời bài hát 绝弦的美** do người dùng cung cấp, chưa xin phép bản quyền.
