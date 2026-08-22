# HSK Quest 学

**Chơi thử: https://leoxi2005.github.io/leoxihskprovip2005/**

Ứng dụng luyện thi **HSK 4** cho người Việt, theo kiểu game: lặp lại ngắt quãng (SRS) hai làn,
XP, lên cấp, chuỗi ngày, đấu trùm, **18 chế độ ôn + 5 trò chơi thật**, nhiệm vụ hằng ngày đổi
mỗi ngày, vàng · rương · linh thú · huy hiệu, một đề thi thử đúng cấu trúc thật, và một lộ trình đếm ngược tới
ngày thi. Toàn bộ tiến độ lưu ngay trong trình duyệt — không cần tài khoản, không cần server.

Tác giả: **leoxi**

## Nội dung

- **1232 từ vựng — phủ trọn đại cương 1200 từ của HSK 4** · 67 điểm ngữ pháp · 35 bài đọc ·
  8 câu sắp xếp · 8 cặp từ dễ nhầm
- **1 đề thi thử HSK 4 đầy đủ 100 câu** đúng cấu trúc đề thật (45 nghe · 40 đọc · 15 viết)
- 44 cụm **kết hợp từ** (搭配) · 36 câu **bắt lỗi sai** (改错) · 48 đề **bẫy số & giờ**
- 818 câu **dựng lại được từ nghĩa tiếng Việt**, cắt bằng chính từ điển của deck
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
| 🧱 | **Dựng Câu** | `B` | Nhìn nghĩa tiếng Việt, xếp lại câu tiếng Trung từ các quân bài là TỪ |
| 📝 | **Chép Chính Tả** | `D` | Nghe cả câu rồi gõ lại — chấm từng chữ, đúng ≥90% là qua |
| 🔢 | **Bẫy Số & Giờ** | `N` | 三点三刻 là mấy giờ? 一百五 là 105 hay 150? |
| 🩹 | **Bắt Lỗi Sai** | `F` | Câu chia làm bốn mảnh, một mảnh mang lỗi — chỉ ra mảnh nào |
| 🧲 | **Kết Hợp Từ** | `C` | 提高 hay 增加 水平? Bốn từ dịch gần giống nhau, một từ ghép được |
| 🔥 | Từ Khắc Tinh | `K` | Chỉ hiện khi có từ sai ≥ 6 lần — dạy lại thay vì cày tiếp |
| 🎵 | Học qua nhạc | `J` | Điền từ vào lời chant |
| 🎤 | 若把你 | `L` | Bài hát thật — video hát đúng câu đang hỏi rồi tự dừng |
| 📝 | **Thi thử HSK 4** | — | 100 câu · 95 phút · đồng hồ từng phần · nghe một lần duy nhất |

Trong lúc chơi: `1–9` chọn đáp án · `Enter` kiểm tra & chuyển câu · `Backspace` xoá ·
`Esc` thoát ô tìm kiếm. Phím tắt của mỗi chế độ được in ngay trên thẻ game
(`src/engine/games.ts` là nguồn duy nhất cho cả lưới thẻ lẫn bàn phím).

## Năm trò chơi

Mười tám chế độ ở bảng trên đều chung một nhịp: ra câu → chọn → bấm Kiểm tra → đọc lời giải.
Nhịp đó tốt cho việc học nhưng nó **không phải nhịp của một trò chơi**: không có gì chạy khi bạn
ngồi im, và không bao giờ thua. Năm trò dưới đây bỏ hẳn nút Kiểm tra — có mạng, có đồng hồ, có kỷ
lục riêng, và thua thật.

| | Trò | Phím | Cách chơi |
| --- | --- | --- | --- |
| 🌧️ | **Mưa Chữ** | `R` | Nghĩa tiếng Việt hiện trên băng, mấy chữ Hán rơi xuống — bắt đúng chữ trước khi nó chạm đất. Bắt nhầm mất một mạng. Cứ 4 chữ lên một cấp: rơi nhanh hơn và đông hơn |
| 🐍 | **Rắn Săn Chữ** | `X` | Lái rắn tới ăn chữ khớp nghĩa. Ăn nhầm hoặc đâm tường thì mất một mạng, rắn về giữa bàn |
| ⚡ | **Nối Chữ Cấp Tốc** | `V` | 12 ô, 6 cặp. Nối đúng được **cộng giờ** (combo càng cao cộng càng nhiều), nối sai mất 2,5 giây. Dọn được cặp nào thì có cặp mới điền vào chỗ đó — bàn không bao giờ hết, chỉ có đồng hồ hết |
| ⚔️ | **Đấu Chữ** | `G` | Đua 10 câu với một đối thủ máy. Thắng được một ⭐, đủ ba ⭐ thì **lên hạng**; thua thì mất ⭐ và có thể **tụt hạng**. Sáu hạng: Đồng → Bạc → Vàng → Bạch Kim → Kim Cương → Cao Thủ |
| 🗼 | **Tháp Vàng** | `T` | Mỗi tầng leo được **nhân vàng lên 1,6 lần**, đồng hồ mỗi tầng lại siết chặt hơn. Nút "Rút" luôn ở đó — sai một câu là mất sạch số đang treo |

**Đấu Chữ** là trò duy nhất trong app mà bạn thua *một người khác* chứ không thua đồng hồ. Điểm số
thì chỉ có thể tăng, còn hạng thì **tụt được** — và cái có thể mất mới là cái người ta quay lại
giữ. Đối thủ mạnh dần theo hạng (Đồng trả lời 5,2 giây và sai 28%; Cao Thủ trả lời 2,1 giây và gần
như không sai), nên leo hạng là phải chơi khá lên thật chứ không phải cày đủ số trận. Nó **không**
phản ứng theo tốc độ người chơi: một trận lúc nào cũng sát nút thì thắng cũng chẳng còn nghĩa gì.
Trước mỗi trận có đếm ngược 3 giây — thiếu nó thì đồng hồ đối thủ chạy ngay lúc màn hình hiện ra,
và người chơi thua khi còn đang đọc câu đầu.

**Tháp Vàng** là trò duy nhất bạn **tự chọn lúc dừng**. Ở tầng 8 bạn đang giữ 270 vàng, leo thêm
một tầng thành 430 — và phải tự trả lời "mình có thật sự nhớ chắc từ này không?" trước khi bấm.
Không chế độ ôn nào bắt người học tự đánh giá độ chắc chắn của chính mình, mà đó lại đúng là thứ
quyết định điểm trong phòng thi.

Cả năm trò chỉ hỏi được thứ trả lời được trong hai giây — nhận mặt chữ — nên chúng **bổ sung** cho
các chế độ ôn chứ không thay thế. Vài quyết định đi kèm:

- Vẫn **chấm SRS thật**: bốn lựa chọn và vài giây suy nghĩ là bằng chứng thật, và nhiệm vụ hằng
  ngày cũng đếm luôn những lượt này.
- Nhưng lượt **hết giờ** (chữ rơi mất, bấm nhầm ô trong ván bấm giờ) chỉ ghi nhật ký chứ không tụt
  hộp: nhìn sót một chữ đang rơi là lỗi phản xạ, không phải bằng chứng rằng bạn quên từ.
- XP mỗi ván có **trần 400**. Không có trần thì cách tối ưu để lên cấp là chơi game và không bao
  giờ mở thẻ ra nữa.
- Từ nhiễu luôn khác nghĩa hẳn từ đích. Trong một trò chơi hai giây, hai nghĩa na ná nhau không
  phải câu hỏi khó — đó là một cái bẫy đọc.

Sân chơi rộng theo màn hình (`min(1400px, 95vw)`) và cao theo `vh`, không phải một con số cố định:
bản đầu khoá cứng 820×420 nên trên màn hình rộng nó thành một cái tem. Tốc độ rơi của Mưa Chữ nhân
theo chiều cao sân, nếu không thì màn hình càng to trò càng dễ.

Về mặt kỹ thuật, cả năm giữ toàn bộ trạng thái trong một `ref` và gọi `force()` mỗi khung hình chứ
không dùng `setState` trong vòng lặp. Lý do: `StrictMode` gọi hàm cập nhật state hai lần, mà ở đây
mỗi lần cập nhật kèm hiệu ứng thật (trừ mạng, ghi SRS, cộng vàng) — chạy hai lần là mất hai mạng
cho một chữ và cộng đôi phần thưởng.

## Năm chế độ ôn của đợt này

Bốn chế độ đầu sinh nội dung từ chính deck, chế độ thứ năm và bắt-lỗi-sai thì viết tay vì không
sinh máy được.

**🧱 Dựng Câu** cắt câu ví dụ của từ thành các quân bài rồi bắt xếp lại theo nghĩa tiếng Việt.
Không dùng thư viện phân từ nào: **từ điển cắt câu chính là deck**. Cắt bằng thư viện ngoài sẽ ra
những mảnh không nằm trong deck, tức bắt người học xếp một từ họ chưa học. Câu nào chứa chữ ngoài
deck thì bỏ hẳn — 热烈 mà vỡ thành 热 và 烈 là hai quân vô nghĩa. Còn lại 818 câu, mỗi câu 3–7 quân.
Bước cắt tham lam ra quá vụn (我给他发了一条短信 thành 8 mảnh) nên có một lượt dán theo luật ngữ
pháp: trợ từ dính vào từ trước (买了 · 我的 · 说得), số dính với lượng từ (一本 · 这条), chữ số dính
liền nhau (二十一 là MỘT quân). Dựng câu tính vào **làn tái tạo** của từ đó, không phải một bài riêng.

**📝 Chép Chính Tả** đọc cả câu rồi bắt gõ lại. Chấm bằng chuỗi con chung dài nhất chứ không so
từng vị trí: gõ thiếu một chữ ở đầu câu mà chấm theo vị trí thì cả câu sau đó đều sai, và con số 0
đó chẳng nói được gì. Sai một chữ trong chín chữ vẫn được XP, chỉ không lên hộp SRS. Bảng chấm tô
đỏ chữ nghe hụt và gạch ngang chữ gõ thừa.

**🔢 Bẫy Số & Giờ** dựng thẳng ba cái bẫy mất điểm nhiều nhất ở phần nghe: 两 hay 二 (2 giờ là
两点, 200 là 两百), 一百五 nói miệng là **150** còn 105 bắt buộc phải có 零, và 差五分四点 = **3:55**
chứ không phải 4:05 — con số nghe được không phải con số cần chọn. Danh sách sinh cố định, không có
`Math.random`, vì mỗi câu ứng với đúng một file thu sẵn.

**🩹 Bắt Lỗi Sai** — 36 câu, mỗi câu một lỗi người Việt thật sự hay mắc: 否定 chen vào giữa 把 và
động từ, 了 đi với 每天, 的/得/地, trạng ngữ thời gian đứng sau động từ, 离合词 mang tân ngữ trực
tiếp (见面了他), 快要……了 thiếu 了. **Câu sai không bao giờ được đọc lên** — chỉ câu đã sửa mới có
bản thu; nghe một câu sai bằng giọng chuẩn là cách nhanh nhất để nhớ nhầm.

**🧲 Kết Hợp Từ** — 44 cụm. Nghĩa tiếng Việt in sẵn trong đề nên câu hỏi luôn chỉ có một đáp án:
không phải đoán người ra đề định nói gì, mà là chọn đúng động từ đi với danh từ đó. 提高水平 chứ
không phải 增加水平; 参观博物馆 (nơi chốn) nhưng 拜访老师 (người); 踢足球 nhưng 打篮球.

## Nhiệm vụ, vàng và linh thú

SRS trả công bằng một con số ngày càng xa — hộp 7 là 75 ngày — nghĩa là học càng giỏi thì phần
thưởng càng thưa. Lớp này trả công ngay sau mỗi phiên, và trả bằng thứ để dành được.

- **Ba nhiệm vụ mỗi ngày**, bốc từ kho 12 cái bằng chính chuỗi ngày tháng. Bốc lại mỗi lần load
  thì người chơi chỉ cần F5 tới khi ra nhiệm vụ dễ. Xong cả ba được thêm 60 vàng và một rương.
- **Vàng** đổi từ XP của phiên (XP ÷ 8), tiêu để mua rương (60 vàng).
- **Rương** ra một trong bốn thứ: linh thú, băng giữ chuỗi, bùa XP ×2, hoặc vàng (1% ra 250 vàng).
  Rương **không bao giờ ra một linh thú đã có** — một rương ra thứ mình có rồi là một rương mở hụt,
  và cảm giác đó phá đúng cái vòng lặp mà rương sinh ra để nuôi.
- **12 linh thú**, con 🐲 Rồng chỉ ra khi mười một con kia đã đủ: bộ sưu tập cần một cái đích nhìn
  thấy được, không phải một xác suất chạy mãi.
- **🧊 Băng** tự tan ra khi bạn nghỉ đúng một ngày, giữ nguyên chuỗi. Nghỉ hai ngày liền thì không
  cứu — đó không còn là lỡ nữa.
- **26 huy hiệu** ở màn Thống kê, cái chưa đạt vẫn hiện đủ tên và con số đang chạy.

Nhiệm vụ hằng ngày **không thay** Kế hoạch hằng ngày: kế hoạch là việc bắt buộc để kịp ngày thi và
được tính ngược từ lượng từ còn lại; nhiệm vụ là thứ để chơi, và cố tình đẩy người học sang những
chế độ họ ít mở. Vì vậy kế hoạch luôn nằm trên nhiệm vụ trên màn hình chính.

## Luyện thi HSK 4

Mục tiêu của bản này là kỳ thi HSK 4 ngày **07/11/2026** tại ĐHSP TP.HCM. Ba điều đáng ghi lại
vì rất dễ nhầm:

- Trường **không tự ra đề** — là điểm thi HSK chính thức, đề do Hán Ban soạn dùng chung toàn cầu.
- Kỳ 7/11 **vẫn là HSK 2.0**. HSK 3.0 chỉ áp dụng tại Việt Nam từ **13/12/2026**.
- Cấu trúc đề khoá trong `src/engine/exam.ts`: 100 câu, 30 + 40 + 25 phút, 300 điểm, đạt 180.

Chế độ thi thử **cố ý không có nút nghe lại** — đề thật chỉ phát mỗi câu một lần, và câu hỏi ở
phần nghe nằm trong băng chứ không in trên đề. Cho nghe lại là luyện một kỳ thi không tồn tại.

Giọng đọc trong app là giọng tổng hợp của trình duyệt, **không phải bản thu của đề thật** — ngữ
điệu phẳng hơn và chất giọng khác. Nó đủ tốt để quen dạng bài và quen áp lực nghe-một-lần, nhưng
không thay được bản thu. Nên có thêm chế độ **nghe bằng đề thật**: app phát đúng bản thu của đề,
đưa lưới phiếu trả lời 45 câu, bấm giờ theo băng và chấm theo đáp án chính thức.

Bản thu đề mẫu chính thức (H41001) **đi kèm luôn trong app** — mở lên bấm Làm là chạy, không phải
chuẩn bị gì. Đơn vị ra đề phát hành đề mẫu này miễn phí cho người học; những đề thi thật khác là
bản quyền của họ nên không kèm, muốn thêm thì tự tải file nghe về rồi nạp vào — file đó nằm lại
trong máy (IndexedDB), không tải lên đâu cả.

Ngồi 95 phút ngay từ đầu cũng là nước đi sai: nó chấm bạn trước khi bạn được dạy kỹ thuật của
bất kỳ phần nào. Nên còn có **chế độ luyện từng phần** — mở riêng một trong tám phần của đề, đọc
hướng dẫn cách làm và bẫy hay dính, rồi luyện đúng phần đó với chấm điểm ngay từng câu, có giải
thích, và được nghe lại. Đây là chỗ đi ngược đề thật một cách có chủ đích: bạn đang học kỹ thuật,
chưa phải tập điều kiện phòng thi. Kế hoạch hằng ngày gợi ý một phần khác nhau mỗi ngày, một tuần
là chạm hết tám phần.

Trang chủ mở lên là thấy đếm ngược và **danh sách nhiệm vụ bắt buộc hôm nay**. Bốn chế độ chơi
cho vui (Học qua nhạc · 若把你 · Sinh Tồn · Đấu Trùm) bị khoá cho tới khi xong; mọi chế độ ôn
tập thật thì luôn mở — cái khoá không bao giờ được phép cản việc học.

## Hạn đăng ký: cái ngày lỡ được

Đếm ngược trên trang chủ trả lời "còn bao lâu nữa tới ngày thi". Suốt mấy tuần tới thì đó là câu
hỏi sai. Ngày thi **không lỡ được** — nó tự đến. Cái lỡ được là **hạn nộp hồ sơ 11/10/2026**, đi
trước ngày thi 27 ngày, và một app chỉ đếm ngược ngày thi sẽ im lặng đúng suốt cái cửa sổ duy nhất
có thể đóng sập lại. Học chăm cả tháng mà quên ngày đó thì toàn bộ lộ trình bên dưới không còn kỳ
thi nào để hướng tới.

Nên có một lượt đếm ngược **thứ hai**, chạy trước lượt kia, nằm **trên** thẻ kế hoạch: thứ tự trên
màn hình là thứ tự của cái mất được nhiều nhất. Nó **to dần** thay vì giữ nguyên một cỡ:

| Còn | Kiểu hiện | Vì sao |
| --- | --- | --- |
| > 30 ngày | dòng mảnh, màu nền | Chưa gấp. Đỏ từ bây giờ thì tới lúc gấp thật, màu đỏ hết nghĩa |
| 8–30 ngày | thẻ vàng | Đăng ký sớm còn chọn được ca thi |
| 1–7 ngày | thẻ đỏ, viền đổ bóng | Tuần cuối |
| Đúng hôm nay | thẻ đỏ, "HÔM NAY là hạn chót" | Vẫn còn kịp — ngày hết hạn vẫn là ngày mở |
| Đã qua | thẻ đỏ, bỏ số đếm ngược | Đếm ngược một hạn đã trôi là vô nghĩa; đổi thành lối ra: đặt đợt kế tiếp |

Bấm **✅ Tôi đã đăng ký rồi** là tắt hẳn, còn lại một dòng xanh xác nhận kèm nút hoàn tác. Nhắc tiếp
một việc đã xong là cách nhanh nhất dạy người dùng bỏ qua mọi lời nhắc sau đó.

**Nhưng app chỉ nhắc được vào ngày bạn mở app** — mà đó đúng là giả định hỏng với một cái hẹn mỗi
năm một lần. Nên nút chính không phải là một lời nhắc trong app: **📅 Hẹn vào lịch điện thoại** tải
về một tệp `.ics` gồm hai sự kiện (hạn đăng ký và ngày thi) với **bốn mốc báo trước** — 14 ngày, 7
ngày, 2 ngày và 1 tiếng. Một lời nhắc duy nhất đúng hôm hết hạn là lời nhắc đến sau khi bạn đã kín
lịch cả ngày. Giao cho lịch của điện thoại là phiên bản duy nhất của tính năng này còn chạy khi app
không được mở nữa, hoặc khi bộ nhớ trình duyệt giữ mấy cài đặt kia bị xoá.

Ba chi tiết trong tệp lịch dễ làm sai:

- **Giờ trôi (floating local time)** — `DTSTART:20261011T090000`, không `Z`, không `TZID`. Hạn nộp
  hồ sơ là một sự kiện của lịch địa phương; ghim múi giờ vào thì cái điện thoại mang đi nước khác
  sẽ kêu lúc hai giờ sáng.
- **Gập dòng theo octet, không theo ký tự.** iCalendar bắt gập ở 75 octet. Tiếng Việt có dấu và
  emoji đều nhiều byte, gập theo chỉ số chuỗi là cắt đôi một ký tự và làm hỏng cả tệp.
- **Escape backslash trước tiên**, rồi mới tới `,` và `;` — làm ngược thì chính dấu vừa thêm bị
  escape lần nữa. Dấu phẩy đứng trần kết thúc giá trị sớm và biến phần còn lại thành tham số rác.

Hạn đăng ký là **một cài đặt riêng**, không suy ra từ ngày thi: mỗi điểm thi chốt danh sách một
kiểu. Đổi ngày thi sang đợt sau thì phải đổi luôn ngày này — app tự phát hiện khi hạn đăng ký rơi
vào sau ngày thi và nói thẳng ra, vì đó là dấu hiệu của việc mới đổi một trong hai.

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
                 + extra3.ts (Bài 17–19) + drills.ts (kết hợp từ & bắt lỗi sai)
  engine/        toàn bộ luật chơi, không dính React
    GameEngine.ts  máy trạng thái + side effect (timer, giọng đọc, ghi SRS)
    session.ts     mỗi chế độ ra câu gì, theo thứ tự SRS
    questions.ts   dựng từng loại câu hỏi
    segment.ts     cắt câu tiếng Trung thành quân bài (chế độ Dựng Câu)
    diff.ts        chấm bài chép chính tả bằng chuỗi con chung dài nhất
    numbers.ts     sinh bộ đề bẫy số & giờ, cố định để thu sẵn được
    arcade.ts      danh sách trò chơi, bốc lượt, kỷ lục và bảng hạng đấu
    quests.ts      ba nhiệm vụ mỗi ngày, bốc theo ngày tháng
    meta.ts        vàng · rương · linh thú · băng giữ chuỗi
    awards.ts      26 huy hiệu, tính lại từ nhật ký
    storage.ts     localStorage, hộp SRS, migrate dữ liệu v1
    audio.ts       TTS tiếng Trung + hiệu ứng âm thanh WebAudio
  screens/       Home · Quiz · Result · Notebook · Stats · Arcade
    arcade/        RainGame · SnakeGame · BlitzGame · DuelGame · TowerGame + khung chung
  components/    Bar · Confetti · StrokeAnimation · SongPlayer · Quests · Awards · RewardModal
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
`hskq_best_endless`, `hskq_muted`, `hskq_finale`, `hskq_rot_*`, `hskq_meta` (vàng · rương · linh
thú), `hskq_arcade` (kỷ lục năm trò chơi), `hskq_rank` (hạng đấu).

## Cấu hình

Không có màn hình cài đặt — chỉnh qua `engine.setSettings({...})` hoặc key `hskq_settings`.

| Cài đặt | Mặc định | Khoảng |
| --- | --- | --- |
| `autoPlayAudio` | `true` | — |
| `voiceRate` | `0.9` | 0.6–1.2 |
| `sessionSize` | `18` | 8–40 |
| `dailyGoal` | `150` | 50–500 |
| `flashMs` | `1800` | 800–4000 |
| `regDate` | `2026-10-11` | ngày, luôn trước `examDate` |
| `registered` | `false` | — |

## Ghi chú kỹ thuật

- **Ảnh**: 59 ảnh đã tải về và nén còn 2.3MB (JPEG 384px), phục vụ từ `public/img/`. Đường dẫn
  neo theo `BASE_URL` để chạy được dưới subpath của GitHub Pages. Có test chặn việc hotlink ra ngoài.
- **Nét chữ**: Hanzi Writer tải dữ liệu nét từ CDN khi cần. Muốn chạy offline thì bundle
  `hanzi-writer-data` và truyền `charDataLoader`.
- **Giọng đọc**: Web Speech API, chất lượng tuỳ trình duyệt — Chrome/Edge có giọng zh-CN tốt nhất.
  Muốn đều hơn thì dùng TTS server (ví dụ Azure `zh-CN-XiaoxiaoNeural`).
- **Bài hát thật không bao giờ bị TTS đọc đè** — video tự hát rồi. Có test giữ điều này.

## Còn tồn đọng

- **Chưa có phần luyện NÓI.** HSK 4 không thi nói (HSKK là kỳ riêng), nên đây không phải lỗ hổng
  của việc luyện đề — nhưng người học vẫn hỏi, và app đang không trả lời được.
- **Lời nhắc hạn đăng ký chỉ hiện khi app được mở.** Đã bù bằng tệp lịch `.ics`, nhưng nó cần
  người dùng bấm tải một lần. Không có cách nào trong trình duyệt bắn thông báo vào một ngày
  cách đây hai tháng mà không cần server.
- **Lời bài hát 绝弦的美** do người dùng cung cấp, chưa xin phép bản quyền.
