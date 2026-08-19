# Giọng đọc của app

App có **hai đường đọc tiếng Trung**, theo thứ tự ưu tiên:

1. **Bản thu sẵn** trong `public/tts/` — giọng neural, đọc theo đúng nhịp bản thu
   chính thức của đề HSK. Đây là thứ chạy trong hầu hết mọi trường hợp.
2. **Giọng máy của trình duyệt** (Web Speech) — chỉ khi câu đó chưa có bản thu, hoặc
   trình duyệt không phát được mp3.

## Vì sao phải thu sẵn

Giọng Web Speech là giọng của *cái máy đang mở app*: máy khác cho giọng khác, điện
thoại có khi không có giọng tiếng Trung nào, và không giọng nào trong số đó đọc theo
nhịp phòng thi. Luyện nghe bằng một giọng rồi đi thi nghe giọng khác là luyện nửa vời.

(App chưa có service worker, nên file thu chỉ nằm trong cache thường của trình duyệt:
câu đã nghe qua thì lần sau không tải lại, còn câu chưa nghe bao giờ vẫn cần mạng.)

## Nhịp đọc lấy ở đâu ra

Đo bằng `ffmpeg` trên chính bản thu chính thức đi kèm app
(`public/audio/hsk4-h41001.mp3`), 5 câu trải đều ba phần nghe:

| | |
|---|---|
| Tốc độ đọc | **3.1–3.9 chữ/giây**, trung bình **3.49** |
| Nghỉ giữa cụm | 0.47 – 0.70 s |
| Nghỉ hết câu | 0.86 – 0.95 s |
| Đổi người nói | 0.81 s |

Giọng máy mặc định chạy 4.6–5.5 chữ/giây, tức nhanh hơn hẳn — nghe là biết ngay không
phải phòng thi.

Mỗi giọng còn tự chèn khoảng nghỉ riêng ở dấu câu, dài ngắn khác nhau (Yunxi nghỉ tới
4.3 s trong một câu 11.5 s). Nên `render.py` **cắt câu tại dấu câu, đọc từng cụm, xén
sạch khoảng lặng hai đầu, rồi ghép lại bằng đúng các khoảng nghỉ đo được ở trên**.
Nhịp là của đề thi chứ không phải nhịp mặc định của giọng máy.

## Giọng đang dùng

| Vai | Giọng | Tốc độ |
|---|---|---|
| Dẫn / đọc đoạn văn / lượt 女 | `zh-CN-XiaoxiaoNeural` | −37% |
| Lượt 男 trong hội thoại | `zh-CN-YunxiNeural` | −50% |
| Câu hỏi 问 | `zh-CN-XiaoyiNeural` | −40% |

Phần trăm tốc độ do `render.py` tự dò để mỗi giọng đọc đúng 3.5 chữ/giây, lưu ở
`rates.json`. Xoá file đó là nó dò lại.

## Chạy lại khi thêm nội dung mới

```sh
python3 -m venv tools/tts/.venv
tools/tts/.venv/bin/pip install edge-tts     # cần mạng, không cần khoá API
brew install ffmpeg                          # nếu chưa có

node tools/tts/collect.mjs                   # gom mọi câu app đọc -> corpus.json
tools/tts/.venv/bin/python tools/tts/render.py   # thu những câu chưa có
npm test                                     # chặn câu bị bỏ sót
```

`render.py` chỉ thu những câu chưa có file, nên chạy lại nhiều lần là an toàn và
nhanh. Thêm `--force` để thu lại tất cả, `--limit=N` để thử đường ống.

Tên file là hàm băm của chính câu đó (`src/engine/tts.ts`), tính giống nhau ở cả lúc
thu lẫn lúc phát. Đổi hàm băm mà không thu lại là toàn bộ thư viện thành file chết —
`src/engine/tts.test.ts` chốt cứng vài khoá để chặn đúng chuyện đó, và
`src/data/tts.test.ts` chặn chuyện thêm từ mới mà quên thu.
