"""Generate TTS audio segments from narration.json using edge-tts."""

import asyncio
import json
import struct
import sys
from pathlib import Path

WORK_DIR = Path(__file__).resolve().parent
NARRATION_PATH = WORK_DIR / "narration.json"
DURATIONS_PATH = WORK_DIR / "durations.json"


def mp3_duration_seconds(path: Path) -> float:
    """Estimate MP3 duration by parsing frame headers."""
    data = path.read_bytes()
    if not data:
        return 0.0
    # Use mutagen if available, otherwise fall back to rough estimate
    try:
        from mutagen.mp3 import MP3
        return MP3(str(path)).info.length
    except ImportError:
        pass
    # Rough estimate: file size / bitrate
    # edge-tts outputs ~48kbps on average
    return len(data) / (48000 / 8)


async def generate_audio(text: str, voice: str, rate: str, output: Path):
    """Generate a single TTS audio file."""
    import edge_tts
    communicate = edge_tts.Communicate(text, voice, rate=rate)
    srt_path = output.with_suffix(".srt")
    submaker = edge_tts.SubMaker()
    with open(output, "wb") as f:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                submaker.feed(chunk)
    srt_content = submaker.get_srt()
    if srt_content:
        srt_path.write_text(srt_content, encoding="utf-8")


async def generate_all(lang: str = None, slide_indices: list = None):
    narration = json.loads(NARRATION_PATH.read_text(encoding="utf-8"))
    meta = narration["meta"]
    languages = [lang] if lang else list(meta["voices"].keys())
    durations = {}

    for lng in languages:
        voice = meta["voices"][lng]
        rate = meta.get("rate", {}).get(lng, "+0%")
        audio_dir = WORK_DIR / "audio" / lng
        audio_dir.mkdir(parents=True, exist_ok=True)
        durations[lng] = {}

        for slide in narration["slides"]:
            idx = slide["index"]
            if slide_indices and idx not in slide_indices:
                continue

            slide_durations = []
            for seg_i, segment in enumerate(slide["segments"]):
                narration_key = f"narration_{lng}"
                text = segment.get(narration_key, "")
                if not text or text.startswith("[TODO"):
                    print(f"  SKIP slide {idx} seg {seg_i} ({lng}): no narration")
                    slide_durations.append(3.0)
                    continue

                out_file = audio_dir / f"slide_{idx:02d}_seg_{seg_i:02d}.mp3"
                print(f"  Generating {out_file.name} ({lng}, {len(text)} chars)...")
                try:
                    await generate_audio(text, voice, rate, out_file)
                    dur = mp3_duration_seconds(out_file)
                    slide_durations.append(round(dur, 2))
                    print(f"    -> {dur:.1f}s")
                except Exception as e:
                    print(f"    ERROR: {e}")
                    slide_durations.append(5.0)

            durations[lng][str(idx)] = slide_durations

    # Merge with existing durations instead of overwriting
    existing = {}
    if DURATIONS_PATH.exists():
        try:
            existing = json.loads(DURATIONS_PATH.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            pass
    existing.update(durations)
    DURATIONS_PATH.write_text(
        json.dumps(existing, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print(f"\nDurations written to {DURATIONS_PATH}")
    return durations


def main():
    lang = None
    slide_indices = None
    args = sys.argv[1:]

    for i, arg in enumerate(args):
        if arg in ("--lang", "-l") and i + 1 < len(args):
            lang = args[i + 1]
        if arg in ("--slides", "-s") and i + 1 < len(args):
            slide_indices = [int(x) for x in args[i + 1].split(",")]

    asyncio.run(generate_all(lang=lang, slide_indices=slide_indices))


if __name__ == "__main__":
    main()
