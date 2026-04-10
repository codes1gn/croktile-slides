"""Assemble per-slide recordings + audio into final MP4 using ffmpeg."""

import json
import os
import subprocess
import sys
from pathlib import Path

WORK_DIR = Path(__file__).resolve().parent
NARRATION_PATH = WORK_DIR / "narration.json"
DURATIONS_PATH = WORK_DIR / "durations.json"
RECORDINGS_DIR = WORK_DIR / "recordings"
AUDIO_DIR = WORK_DIR / "audio"
OUTPUT_DIR = WORK_DIR / "output"

def _find_ffmpeg():
    if subprocess.run(["which", "ffmpeg"], capture_output=True).returncode == 0:
        return "ffmpeg", "ffprobe"
    try:
        import imageio_ffmpeg
        exe = imageio_ffmpeg.get_ffmpeg_exe()
        return exe, None
    except ImportError:
        pass
    pw = Path.home() / ".cache" / "ms-playwright" / "ffmpeg-1011" / "ffmpeg-linux"
    if pw.exists():
        return str(pw), None
    return "ffmpeg", "ffprobe"


FFMPEG_BIN, FFPROBE_BIN = _find_ffmpeg()


def run_ffmpeg(args: list, desc: str = ""):
    """Run an ffmpeg command, raising on failure."""
    cmd = [FFMPEG_BIN, "-y"] + args
    print(f"  ffmpeg: {desc}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  FFMPEG ERROR: {result.stderr[-500:]}")
        raise RuntimeError(f"ffmpeg failed: {desc}")


def concat_audio_segments(lang: str, slide_idx: int, segments: list) -> Path:
    """Concatenate audio segments for a slide into one file."""
    audio_dir = AUDIO_DIR / lang
    parts = []
    for seg_i in range(len(segments)):
        seg_file = audio_dir / f"slide_{slide_idx:02d}_seg_{seg_i:02d}.mp3"
        if seg_file.exists():
            parts.append(seg_file)

    if not parts:
        return None

    if len(parts) == 1:
        return parts[0]

    # Concatenate using ffmpeg
    concat_file = audio_dir / f"slide_{slide_idx:02d}_combined.mp3"
    list_file = audio_dir / f"slide_{slide_idx:02d}_concat.txt"
    list_file.write_text(
        "\n".join(f"file '{p.name}'" for p in parts), encoding="utf-8"
    )
    run_ffmpeg(
        ["-f", "concat", "-safe", "0", "-i", str(list_file), "-c", "copy", str(concat_file)],
        f"concat audio slide {slide_idx}",
    )
    list_file.unlink()
    return concat_file


def merge_slide_video_audio(lang: str, slide_idx: int, segments: list) -> Path:
    """Merge a slide's video recording with its audio."""
    rec_dir = RECORDINGS_DIR / lang
    video_file = rec_dir / f"slide_{slide_idx:02d}.webm"
    output_dir = OUTPUT_DIR / lang / "clips"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / f"slide_{slide_idx:02d}.mp4"

    if not video_file.exists():
        print(f"  SKIP slide {slide_idx}: no recording")
        return None

    audio_file = concat_audio_segments(lang, slide_idx, segments)

    if audio_file and audio_file.exists():
        # Merge video + audio, using shortest stream to determine duration
        run_ffmpeg(
            [
                "-i", str(video_file),
                "-i", str(audio_file),
                "-c:v", "libx264",
                "-preset", "medium",
                "-crf", "20",
                "-c:a", "aac",
                "-b:a", "192k",
                "-shortest",
                "-movflags", "+faststart",
                str(output_file),
            ],
            f"merge slide {slide_idx}",
        )
    else:
        # Video only (chapter/transition slides may have short/no audio)
        run_ffmpeg(
            [
                "-i", str(video_file),
                "-c:v", "libx264",
                "-preset", "medium",
                "-crf", "20",
                "-an",
                "-movflags", "+faststart",
                str(output_file),
            ],
            f"convert slide {slide_idx} (no audio)",
        )

    return output_file


def assemble_final(lang: str, slide_indices: list = None):
    """Assemble all slide clips into one final video."""
    narration = json.loads(NARRATION_PATH.read_text(encoding="utf-8"))
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    clips_dir = OUTPUT_DIR / lang / "clips"
    clips_dir.mkdir(parents=True, exist_ok=True)

    clip_files = []

    for slide in narration["slides"]:
        idx = slide["index"]
        if slide_indices and idx not in slide_indices:
            continue

        print(f"Processing slide {idx}: {slide['title']}")
        clip = merge_slide_video_audio(lang, idx, slide["segments"])
        if clip and clip.exists():
            clip_files.append(clip)

    if not clip_files:
        print("No clips to assemble!")
        return

    # Write concat list
    concat_list = OUTPUT_DIR / lang / "concat_list.txt"
    concat_list.write_text(
        "\n".join(f"file '{c.resolve()}'" for c in clip_files), encoding="utf-8"
    )

    final_output = OUTPUT_DIR / f"croqtile-intro-{lang}.mp4"

    # Concatenate all clips
    run_ffmpeg(
        [
            "-f", "concat",
            "-safe", "0",
            "-i", str(concat_list),
            "-c:v", "libx264",
            "-preset", "medium",
            "-crf", "20",
            "-c:a", "aac",
            "-b:a", "192k",
            "-vf", "fade=t=in:st=0:d=1,fade=t=out:st=999:d=2",
            "-movflags", "+faststart",
            str(final_output),
        ],
        "final assembly",
    )

    # Fix fade-out: re-encode with correct duration (requires ffprobe)
    if FFPROBE_BIN:
        probe = subprocess.run(
            [FFPROBE_BIN, "-v", "error", "-show_entries", "format=duration",
             "-of", "default=noprint_wrappers=1:nokey=1", str(final_output)],
            capture_output=True, text=True,
        )
        try:
            total_dur = float(probe.stdout.strip())
            fade_out_start = max(0, total_dur - 2)
            temp_output = final_output.with_stem(final_output.stem + "_tmp")
            final_output.rename(temp_output)
            run_ffmpeg(
                [
                    "-i", str(temp_output),
                    "-c:v", "libx264",
                    "-preset", "medium",
                    "-crf", "20",
                    "-c:a", "aac",
                    "-b:a", "192k",
                    "-vf", f"fade=t=in:st=0:d=1,fade=t=out:st={fade_out_start:.2f}:d=2",
                    "-af", f"afade=t=in:st=0:d=1,afade=t=out:st={fade_out_start:.2f}:d=2",
                    "-movflags", "+faststart",
                    str(final_output),
                ],
                "apply fade in/out",
            )
            temp_output.unlink()
        except (ValueError, FileNotFoundError):
            print("  Warning: could not apply fade-out")
    else:
        print("  Note: ffprobe not available, skipping fade-out pass")

    print(f"\nFinal video: {final_output}")
    print(f"  Duration: ~{total_dur:.0f}s" if 'total_dur' in dir() else "")


def main():
    lang = "zh"
    slide_indices = None
    args = sys.argv[1:]

    for i, arg in enumerate(args):
        if arg in ("--lang", "-l") and i + 1 < len(args):
            lang = args[i + 1]
        if arg in ("--slides", "-s") and i + 1 < len(args):
            slide_indices = [int(x) for x in args[i + 1].split(",")]

    assemble_final(lang=lang, slide_indices=slide_indices)


if __name__ == "__main__":
    main()
