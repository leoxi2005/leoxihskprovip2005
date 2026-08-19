#!/usr/bin/env python3
"""Thu sẵn toàn bộ giọng đọc tiếng Trung của app, khớp nhịp bản thu HSK thật.

    python3 -m venv tools/tts/.venv
    tools/tts/.venv/bin/pip install edge-tts
    node tools/tts/collect.mjs
    tools/tts/.venv/bin/python tools/tts/render.py

Vì sao không để trình duyệt tự đọc: giọng Web Speech là giọng của *máy đang mở app*
— máy khác cho giọng khác, điện thoại có khi câm, và không giọng nào trong số đó đọc
theo nhịp phòng thi. Bản thu sẵn thì máy nào mở cũng nghe đúng một giọng, đúng một nhịp.

Các con số nhịp đọc dưới đây đo bằng ffmpeg trên chính bản thu chính thức đi kèm app
(public/audio/hsk4-h41001.mp3), 5 câu trải đều ba phần:

    tốc độ đọc  3.1–3.9 chữ/giây (trung bình 3.49)
    nghỉ giữa cụm 0.47–0.70 s · hết câu 0.86–0.95 s · đổi người nói 0.81 s

Giọng máy tự chèn khoảng nghỉ riêng ở dấu câu, dài ngắn tuỳ giọng — Yunxi nghỉ tới
4.3 s trong một câu 11.5 s. Nên câu được cắt tại dấu câu, đọc từng cụm, xén sạch
khoảng lặng hai đầu, rồi ghép lại bằng đúng khoảng nghỉ đo được ở trên. Nhịp là của
đề thi chứ không phải nhịp mặc định của giọng máy.
"""
from __future__ import annotations

import asyncio
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parents[2]
CORPUS = ROOT / 'tools/tts/corpus.json'
RATES = ROOT / 'tools/tts/rates.json'
OUT = ROOT / 'public/tts'
MANIFEST = ROOT / 'src/data/tts.json'
REAL = ROOT / 'public/audio/hsk4-h41001.mp3'

TARGET_ART = 3.5   # chữ/giây khi đang phát âm — trung bình của bản thu thật
SR = '24000'
BITRATE = '48k'
CONCURRENCY = 8

# Giọng nữ dẫn/đọc đoạn văn, giọng nam cho lượt 男 trong hội thoại, và một giọng nữ
# thứ hai cho câu hỏi 问 — bản thu thật cũng tách người hỏi khỏi hai người đối thoại.
VOICES = {
    'narrator': 'zh-CN-XiaoxiaoNeural',
    'female': 'zh-CN-XiaoxiaoNeural',
    'male': 'zh-CN-YunxiNeural',
    'ask': 'zh-CN-XiaoyiNeural',
}
PAUSE = {'，': 0.55, '、': 0.45, '；': 0.65, '：': 0.5, '。': 0.88, '？': 0.88, '！': 0.88}
TURN = 0.82      # đổi người nói
ELLIPSIS = 0.9   # chỗ trống '……' trong vòng điền từ của bài hát
HAN = re.compile(r'[一-鿿]')
LABEL = re.compile(r'^\s*(男|女|问)\s*[：:]\s*')

# Câu hiệu chỉnh: không có dấu câu, để đo đúng tốc độ phát âm chứ không đo khoảng nghỉ.
CAL_CHUNKS = ['您的材料我已经翻译完了', '有一些专业知识我不太了解', '这本小说讲了一个爱情故事']


def run(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(args, capture_output=True, text=True)


def dur(f: Path | str) -> float:
    p = run('ffprobe', '-v', 'quiet', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(f))
    return float(p.stdout.strip() or 0)


def trim(src: Path, dst: Path) -> Path:
    """Xén khoảng lặng hai đầu — điều kiện để khoảng nghỉ ghép vào là chính xác."""
    run('ffmpeg', '-y', '-v', 'quiet', '-i', str(src), '-af',
        'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02:'
        'stop_periods=-1:stop_threshold=-45dB:stop_silence=0.06,'
        f'aresample={SR}', '-ar', SR, '-ac', '1', str(dst))
    return dst


async def synth(text: str, voice: str, path: Path, pct: int) -> None:
    """Đọc một cụm. Mạng chập chờn là chuyện thường, nên thử lại vài lần."""
    for attempt in range(4):
        try:
            await edge_tts.Communicate(text, voice, rate=f'{pct:+d}%').save(str(path))
            if path.exists() and path.stat().st_size > 500:
                return
        except Exception as e:  # noqa: BLE001 — lỗi mạng nào cũng thử lại như nhau
            if attempt == 3:
                raise
        await asyncio.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f'không đọc được: {text[:20]}…')


async def calibrate(tmp: Path) -> dict[str, int]:
    """Tìm % tốc độ để mỗi giọng đọc đúng 3.5 chữ/giây như bản thu thật."""
    if RATES.exists():
        return json.loads(RATES.read_text())
    rates = {}
    for voice in sorted(set(VOICES.values())):
        pct = -25
        rate = 0.0
        for _ in range(5):
            chars = secs = 0
            for i, c in enumerate(CAL_CHUNKS):
                raw, cut = tmp / f'cal{i}.mp3', tmp / f'cal{i}.wav'
                await synth(c, voice, raw, pct)
                trim(raw, cut)
                chars += len(c)
                secs += dur(cut)
            rate = chars / secs
            new = max(-50, min(40, round(pct + (TARGET_ART / rate - 1) * 100)))
            if abs(new - pct) <= 1:
                break
            pct = new
        rates[voice] = pct
        print(f'  {voice}: {pct:+d}% → {rate:.2f} chữ/s')
    RATES.write_text(json.dumps(rates, indent=1) + '\n')
    return rates


def split_role(line: str) -> tuple[str, str]:
    m = LABEL.match(line)
    if not m:
        return 'narrator', line.strip()
    return {'男': 'male', '女': 'female', '问': 'ask'}[m.group(1)], line[m.end():].strip()


def chunks(text: str) -> list[tuple[str, float]]:
    """Cắt tại dấu câu, giữ lại độ dài khoảng nghỉ mà dấu đó đáng được nghỉ."""
    out: list[tuple[str, float]] = []
    buf = ''
    i = 0
    while i < len(text):
        ch = text[i]
        if ch == '…':
            j = i
            while j < len(text) and text[j] == '…':
                j += 1
            if buf.strip():
                out.append((buf.strip(), ELLIPSIS))
                buf = ''
            elif out:
                out[-1] = (out[-1][0], max(out[-1][1], ELLIPSIS))
            i = j
            continue
        if ch in PAUSE:
            if buf.strip():
                out.append((buf.strip(), PAUSE[ch]))
            buf = ''
        else:
            buf += ch
        i += 1
    if buf.strip():
        out.append((buf.strip(), 0.0))
    return out


async def render(lines: list[str], dst: Path, rates: dict[str, int], tmp: Path) -> None:
    pieces: list[tuple[str, object]] = []
    n = 0
    for k, line in enumerate(lines):
        role, text = split_role(line)
        voice = VOICES[role]
        cs = chunks(text)
        for j, (c, gap) in enumerate(cs):
            if not HAN.search(c):
                continue
            raw, cut = tmp / f's{n}.mp3', tmp / f's{n}.wav'
            n += 1
            await synth(c, voice, raw, rates[voice])
            trim(raw, cut)
            pieces.append(('a', cut))
            last = j == len(cs) - 1
            g = TURN if last and k < len(lines) - 1 else (0.0 if last else gap)
            if g:
                pieces.append(('s', g))
    if not pieces:
        raise RuntimeError('không có gì để đọc')
    wavs = []
    for k, (kind, val) in enumerate(pieces):
        if kind == 'a':
            wavs.append(val)
            continue
        w = tmp / f'g{k}.wav'
        run('ffmpeg', '-y', '-v', 'quiet', '-f', 'lavfi', '-i', f'anullsrc=r={SR}:cl=mono',
            '-t', str(val), str(w))
        wavs.append(w)
    lst = tmp / 'concat.txt'
    lst.write_text(''.join(f"file '{w}'\n" for w in wavs))
    run('ffmpeg', '-y', '-v', 'quiet', '-f', 'concat', '-safe', '0', '-i', str(lst),
        '-c:a', 'libmp3lame', '-b:a', BITRATE, '-ar', SR, '-ac', '1', str(dst))
    if not dst.exists() or dst.stat().st_size < 500:
        raise RuntimeError('ghép file hỏng')


async def main() -> int:
    if not shutil.which('ffmpeg') or not shutil.which('ffprobe'):
        print('Thiếu ffmpeg/ffprobe (brew install ffmpeg)', file=sys.stderr)
        return 1
    if not CORPUS.exists():
        print('Chưa có corpus.json — chạy `node tools/tts/collect.mjs` trước', file=sys.stderr)
        return 1
    force = '--force' in sys.argv
    corpus = json.loads(CORPUS.read_text())
    # `--limit N` để thử đường ống trên một nhúm trước khi thu cả nghìn đoạn.
    for a in sys.argv[1:]:
        if a.startswith('--limit='):
            corpus = corpus[: int(a.split('=')[1])]
    OUT.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory() as td:
        print('Hiệu chỉnh tốc độ giọng:')
        rates = await calibrate(Path(td))

        todo = [it for it in corpus
                if force or not (OUT / f"{it['key']}.mp3").exists()
                or (OUT / f"{it['key']}.mp3").stat().st_size < 500]
        print(f'{len(corpus)} đoạn, cần thu {len(todo)} (đã có sẵn {len(corpus) - len(todo)})')

        done = 0
        failed: list[str] = []
        sem = asyncio.Semaphore(CONCURRENCY)

        async def one(it: dict) -> None:
            nonlocal done
            async with sem:
                work = Path(td) / it['key']
                work.mkdir(exist_ok=True)
                try:
                    await render(it['lines'], OUT / f"{it['key']}.mp3", rates, work)
                except Exception as e:  # noqa: BLE001
                    failed.append(f"{it['key']} {it['lines'][0][:14]}… {e}")
                finally:
                    shutil.rmtree(work, ignore_errors=True)
                    done += 1
                    if done % 100 == 0 or done == len(todo):
                        print(f'  {done}/{len(todo)}', flush=True)

        await asyncio.gather(*(one(it) for it in todo))

    have = sorted(p.stem for p in OUT.glob('*.mp3') if p.stat().st_size > 500)
    MANIFEST.write_text(json.dumps(have) + '\n')
    size = sum(p.stat().st_size for p in OUT.glob('*.mp3')) / 1024 / 1024
    print(f'Xong: {len(have)} file · {size:.1f} MB · danh sách khoá → {MANIFEST.relative_to(ROOT)}')
    if failed:
        print(f'{len(failed)} đoạn lỗi (chạy lại lệnh này để thu tiếp):', file=sys.stderr)
        for f in failed[:10]:
            print('  ' + f, file=sys.stderr)
    # Đoạn nào thiếu file thì app tự đọc bằng giọng máy — không sập, chỉ lệch giọng.
    missing = [it['key'] for it in corpus if it['key'] not in set(have)]
    if missing:
        print(f'Còn thiếu {len(missing)} đoạn.', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(asyncio.run(main()))
