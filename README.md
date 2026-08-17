# HSK Quest 学

**Chơi thử: https://leoxi2005.github.io/leoxihskprovip2005/**

Ứng dụng luyện thi **HSK 4** cho người Việt, theo kiểu game: lặp lại ngắt quãng (SRS) hai làn,
XP, lên cấp, chuỗi ngày, đấu trùm, 13 chế độ chơi, một đề thi thử đúng cấu trúc thật, và một lộ
trình đếm ngược tới ngày thi. Toàn bộ tiến độ lưu ngay trong trình duyệt — không cần tài khoản,
không cần server.

Tác giả: **leoxi**

## Nội dung

- **1232 từ vựng — phủ trọn đại cương 1200 từ của HSK 4** · 67 điểm ngữ pháp · 35 bài đọc ·
  8 câu sắp xếp · 8 cặp từ dễ nhầm
- **1 đề thi thử HSK 4 đầy đủ 100 câu** đúng cấu trúc đề thật (45 nghe · 40 đọc · 15 viết)
- 1223/1232 từ có câu ví dụ song ngữ, dùng cho chế độ điền từ
- 59 ảnh minh hoạ AI + 111 mẹo nhớ Hán Việt
- Hoạt hình viết từng nét (bộ thủ tô đỏ) cho mọi chữ Hán
- 3 bài chant tự soạn + 1 bài hát thật, lời đã gióng với bản thu theo từng giây

## Chạy trên máy

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # 145 test cho engine, nội dung và đề thi
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
| 🎚️ | **Thanh Điệu** | `8` | mǎi hay mài? Bốn pinyin chỉ khác dấu — kèm bẫy zh/z · sh/s · -n/-ng |
| 🧩 | Điền Từ | `9` | Khoét từ khỏi chính câu ví dụ của nó |
| ⚔️ | **Cặp Dễ Nhầm** | `0` | 经过 hay 通过? Chọn 1 trong 2, có lời giải thích tại sao |
| 🔥 | Từ Khắc Tinh | `K` | Chỉ hiện khi có từ sai ≥ 6 lần — dạy lại thay vì cày tiếp |
| 🎵 | Học qua nhạc | `J` | Điền từ vào lời chant |
| 🎤 | 若把你 | `L` | Bài hát thật — video hát đúng câu đang hỏi rồi tự dừng |
| 📝 | **Thi thử HSK 4** | — | 100 câu · 95 phút · đồng hồ từng phần · nghe một lần duy nhất |

Trong lúc chơi: `1–9` chọn đáp án · `Enter` kiểm tra & chuyển câu · `Backspace` xoá ·
`Esc` thoát ô tìm kiếm. Phím tắt của mỗi chế độ được in ngay trên thẻ game
(`src/engine/games.ts` là nguồn duy nhất cho cả lưới thẻ lẫn bàn phím).

## Luyện thi HSK 4

Mục tiêu của bản này là kỳ thi HSK 4 ngày **07/11/2026** tại ĐHSP TP.HCM. Ba điều đáng ghi lại
vì rất dễ nhầm:

- Trường **không tự ra đề** — là điểm thi HSK chính thức, đề do Hán Ban soạn dùng chung toàn cầu.
- Kỳ 7/11 **vẫn là HSK 2.0**. HSK 3.0 chỉ áp dụng tại Việt Nam từ **13/12/2026**.
- Cấu trúc đề khoá trong `src/engine/exam.ts`: 100 câu, 30 + 40 + 25 phút, 300 điểm, đạt 180.

Chế độ thi thử **cố ý không có nút nghe lại** — đề thật chỉ phát mỗi câu một lần, và câu hỏi ở
phần nghe nằm trong băng chứ không in trên đề. Cho nghe lại là luyện một kỳ thi không tồn tại.

Nhưng ngồi 95 phút ngay từ đầu là nước đi sai: nó chấm bạn trước khi bạn được dạy kỹ thuật của
bất kỳ phần nào. Nên còn có **chế độ luyện từng phần** — mở riêng một trong tám phần của đề, đọc
hướng dẫn cách làm và bẫy hay dính, rồi luyện đúng phần đó với chấm điểm ngay từng câu, có giải
thích, và được nghe lại. Đây là chỗ đi ngược đề thật một cách có chủ đích: bạn đang học kỹ thuật,
chưa phải tập điều kiện phòng thi. Kế hoạch hằng ngày gợi ý một phần khác nhau mỗi ngày, một tuần
là chạm hết tám phần.

Trang chủ mở lên là thấy đếm ngược và **danh sách nhiệm vụ bắt buộc hôm nay**. Bốn chế độ chơi
cho vui (Học qua nhạc · 若把你 · Sinh Tồn · Đấu Trùm) bị khoá cho tới khi xong; mọi chế độ ôn
tập thật thì luôn mở — cái khoá không bao giờ được phép cản việc học.

## Lõi SRS: hai làn cho mỗi từ

Nhận diện và tái tạo là hai kỹ năng quên với tốc độ khác nhau, nên mỗi từ mang **hai ô nhớ độc
lập**: làn nhận diện giữ nguyên id cũ `w:<chữ Hán>`, làn tái tạo là `w:<chữ Hán>#r`. Nhờ giữ
nguyên id cũ, tiến trình của bản trước rơi đúng vào làn nhận diện mà không phải viết lại dữ liệu.
Một từ chỉ tính là "đã thuộc" khi **cả hai làn** đạt hộp 3.

Kèm theo đó:

- Thang hộp **8 mức** tới 75 ngày, mỗi khoảng cách jitter ±10% để một mẻ từ học cùng ngày không
  quay lại thành một cục.
- Đúng **nhưng chậm** thì lên hộp mà chỉ được 0.6× khoảng cách — do dự là hình dạng của kiến
  thức sắp mất.
- **Hạn mức từ mới mỗi ngày, tự tính từ ngày thi.** Không có hạn mức thì mọi phiên đều nạp từ
  chưa gặp và hai tuần sau hàng đợi không thể dọn nổi — cách một bộ thẻ SRS chết kinh điển. Còn
  bắt người học tự đặt con số đó cũng sai: nó phụ thuộc số từ còn lại và số ngày còn lại, mà cả
  hai đều đổi mỗi ngày. App tính ngược từ ngày thi và **có tính cả phần giảm dần về cuối** — ở
  82 ngày, nhịp 12/ngày chỉ phủ được 655 từ chứ không phải 984. Trang chủ nói thẳng hôm nay tốn
  bao nhiêu câu và bao nhiêu phút (đo từ chính tốc độ trả lời của bạn), và cảnh báo khi nhịp cần
  thiết vượt quá sức ngồi.
- Sai ≥ 6 lần thì gắn cờ **từ khắc tinh** và gom vào chế độ riêng.
- Mọi lượt trả lời ghi vào nhật ký vòng (5000 dòng). Nhật ký này nuôi cả màn Thống kê lẫn việc
  tick nhiệm vụ hằng ngày.

`HSK1 · Đợt *` và `HSK2 · Đợt *` **mặc định tắt**: chúng có mặt để phủ đủ 1200 từ của đại cương,
không phải để dạy lại 我 và 好. Bật lên nếu muốn rà lại phần nền.

## Sao lưu tiến trình

Tiến trình chỉ nằm trong `localStorage` của đúng trình duyệt đó. Cài đặt có nút **Xuất / Nhập**
tệp JSON — xoá cache hay đổi máy là mất trắng nếu không có bản sao. Bản nhập được kiểm tra trước
khi ghi, nên một tệp lạ sẽ bị từ chối chứ không ghi đè nửa vời.

## Chế độ bài hát thật hoạt động thế nào

Lời bài hát được gióng với bản thu bằng sheet LRC lấy từ [lrclib](https://lrclib.net/),
nên mỗi câu biết chính xác nó được hát ở giây nào. Nhờ đó:

- Video **tua tới đúng câu đang hỏi**, hát hết câu thì **tự dừng** — cách
  [LyricsTraining](https://lyricstraining.com/) dừng video ở mỗi chỗ trống.
- 🔊 phát lại **giọng ca sĩ** đúng đoạn đó, không phải giọng máy đọc đè lên nhạc.
- 🐢 phát lại ở 0.75× — "slow repetition", thứ mọi kênh dạy tiếng Trung qua nhạc đều dùng.

Trước đây video chạy tự do trong khi câu hỏi đứng yên, nên người học bị hỏi câu 3 trong khi
tai đang nghe câu 8 — "nghe rồi điền" là một lời hứa không thể thực hiện được.

Lưu ý thẳng thắn: **0/23 từ trong bài này thuộc HSK 3–4** (落款, 高山流水, 矢志不渝… là từ cổ
phong). Đây là chế độ để thưởng thức và luyện tai, không phải để luyện thi. Phần nhạc giúp thi
là 🎵 *Học qua nhạc* — các bài chant dùng đúng từ trong deck.

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

## Bài 13–16 (đợt từ mới)

42 từ HSK4 thêm sau, chia thành 4 chủ đề để mỗi chủ đề tự chơi được một mình (đấu trùm và
tia chớp đều cần tối thiểu 8 từ trong pool):

| Chủ đề | Từ | Nội dung |
| --- | --- | --- |
| `Bài 13 · Nghệ thuật & Giao lưu` | 12 | 该 值得 艺术 不仅 喜爱 与 国籍 无关 交流 感情 增进 水平 |
| `Bài 14 · Ngôn ngữ & Công nghệ` | 10 | 句子 进行 即使 翻译 理解 随着 科技 笔记 借 表格 |
| `Bài 15 · Học tập & Cố gắng` | 8 | 收拾 羡慕 填空 好棒 奖学金 任何 基础 知识 |
| `Bài 16 · Ứng tuyển & Ấn tượng` | 12 | 印象 自信 满足 需求 技能 经验 首先 其次 本来 却 影响 留下 |

Mỗi từ có ví dụ Trung–Việt và một mẹo nhớ Hán Việt. Thêm **12 câu cloze** cho nhóm hư từ
(不仅, 与, 即使, 随着, 却, 首先…其次, 任何, 本来, 该, 进行, 值得, 无关) — những từ này gần như
không có "nghĩa" để ghép thẻ, chỉ học được qua vị trí trong câu.

Tám từ trong danh sách gốc đã có sẵn trong deck nên không thêm lại: 区别 · 紧张 · 勇敢 · 坚持 ·
应聘 · 判断 · 顾客 (deck.json) và 取得 (extra.ts). Id SRS là `w:<chữ Hán>`, thêm bản thứ hai thì
hai thẻ sẽ tranh nhau cùng một hộp.

## Bài 17–19 (đợt từ mới thứ hai)

35 từ HSK4 nữa, chia thành 3 chủ đề — vẫn theo luật "mỗi chủ đề ≥ 8 từ để tự chơi được một mình".

| Chủ đề | Từ | Nội dung |
| --- | --- | --- |
| `Bài 17 · Thái độ & Kết quả` | 10 | 支持 是否 祝贺 尽管 单纯 成绩 坏 联系 继续 按照 |
| `Bài 18 · Sinh hoạt & Công việc` | 12 | 棉 吹 舒服 老板 海鲜 耐心 发展 各种 批评 仍然 终于 被 |
| `Bài 19 · Sức khoẻ & Ngôn ngữ` | 13 | 减轻 压力 另外 皮肤 效果 流利 其实 查 词典 空儿 世界 怀疑 清楚 |

Thêm **12 câu cloze** nữa cho nhóm hư từ và kết cấu (是否, 尽管, 按照, 继续, 被, 仍然, 终于,
各种, 另外, 其实, 说清楚, 有空儿) — 清楚 vào đây không phải vì nghĩa mà vì **vị trí**: nó là bổ
ngữ kết quả (看清楚 · 听清楚 · 说清楚), thứ thẻ nghĩa ↔ chữ không dạy được.

Hai mục trong danh sách là cụm chứ không phải từ, nên tách ra: 查词典 → **查** + **词典** (cả
hai đều là từ HSK4 độc lập), 风吹 → **吹** (风 thì đã quá quen).

Mười chín từ đã có sẵn trong deck nên không thêm lại: 至少 · 判断 · 经历 · 仔细 · 粗心 · 过程 ·
结果 · 窗户 · 凉快 · 专门 · 讨论 · 伤心 · 失望 · 放弃 · 减肥 · 诚实 · 售货员 (deck.json) và
科技 · 翻译 · 羡慕 (extra2.ts). Vẫn cùng lý do: id SRS là `w:<chữ Hán>`.

Nút **⭐ Từ mới** giờ lọc cả 77 từ của Bài 13–19. Cạm bẫy đã dính khi làm đợt này: `extra.ts` đã
dùng id `g:x1…g:x5`, nên 12 câu cloze mới phải đánh `g:v1…g:v12` — id trùng thì một trong hai
mục lặng lẽ biến mất. Test `engine.test.ts` giờ chặn luôn việc đó.

## Kiến trúc

```
src/
  data/          nội dung (JSON) + extra.ts (bài 通过 & 经过) + extra2.ts (Bài 13–16)
                 + extra3.ts (Bài 17–19)
  engine/        toàn bộ luật chơi, không dính React
    GameEngine.ts  máy trạng thái + side effect (timer, giọng đọc, ghi SRS)
    session.ts     mỗi chế độ ra câu gì, theo thứ tự SRS
    questions.ts   dựng từng loại câu hỏi
    storage.ts     localStorage, hộp SRS, migrate dữ liệu v1
    audio.ts       TTS tiếng Trung + hiệu ứng âm thanh WebAudio
  screens/       Home · Quiz · Result · Notebook
  components/    Bar · Confetti · StrokeAnimation · SongPlayer
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

- **10 trong 55 điểm ngữ pháp không vào được phiên nào.** Chúng gắn chủ đề `Bài 3`, mà chip chủ
  đề chỉ sinh ra từ chủ đề của *từ vựng*, không từ nào thuộc `Bài 3`. Lỗi này có từ bản prototype
  gốc; đã ghim bằng test trong `engine.test.ts`. Sửa bằng cách gắn lại chủ đề cho 10 mục đó,
  hoặc sinh chip từ toàn bộ nội dung.
- **Lời bài hát 绝弦的美** do người dùng cung cấp, chưa xin phép bản quyền.
