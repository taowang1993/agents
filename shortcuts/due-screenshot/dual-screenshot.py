#!/usr/bin/env -S /Users/max/.local/bin/uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["Pillow"]
# ///
"""
Dual-screen vertical screenshot: Mac display (top) + iPad Sidecar (bottom).
Output saved to ~/Desktop with timestamp and copied to clipboard.
"""

import subprocess
import os
import sys
from pathlib import Path
from datetime import datetime

from PIL import Image


def capture_display(display_num: int, path: str) -> bool:
    """Capture a single display using macOS screencapture."""
    result = subprocess.run(
        ["/usr/sbin/screencapture", "-D", str(display_num), path],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(f"Error capturing display {display_num}: {result.stderr}", file=sys.stderr)
        return False
    return True


def combine_vertical(img1: Image.Image, img2: Image.Image) -> Image.Image:
    """Stack two images vertically, making them the same width."""
    # Resize wider image to match narrower one's width for a clean look
    w1, h1 = img1.size
    w2, h2 = img2.size
    target_width = min(w1, w2)

    if w1 != target_width:
        ratio = target_width / w1
        img1 = img1.resize((target_width, int(h1 * ratio)), Image.LANCZOS)
    if w2 != target_width:
        ratio = target_width / w2
        img2 = img2.resize((target_width, int(h2 * ratio)), Image.LANCZOS)

    w1, h1 = img1.size
    w2, h2 = img2.size

    combined = Image.new("RGB", (target_width, h1 + h2))
    combined.paste(img1, (0, 0))
    combined.paste(img2, (0, h1))
    return combined


def play_feedback_sound() -> None:
    """Play a feedback sound to indicate screenshot was taken."""
    # Absolute path — Shortcuts may execute from a temp copy of the script
    sound = "/Users/max/.agents/shortcuts/due-screenshot/camera-shutter.mp3"
    try:
        subprocess.run(["/usr/bin/afplay", "-v", "0.5", sound], capture_output=True, timeout=3)
    except Exception:
        pass  # Silent fail if sound can't play


def copy_to_clipboard(path: str) -> None:
    """Copy PNG image to macOS clipboard via osascript."""
    subprocess.run([
        "/usr/bin/osascript", "-e",
        f'set the clipboard to (read (POSIX file "{path}") as «class PNGf»)',
    ])


def main():
    # Capture displays 1 (Mac) and 2 (Sidecar)
    displays_to_capture = [1, 2]

    # Temp files
    tmp_dir = Path("/tmp/dual_screenshot")
    tmp_dir.mkdir(exist_ok=True)
    img1_path = tmp_dir / "display1.png"
    img2_path = tmp_dir / "display2.png"

    images = []
    for d in displays_to_capture:
        path = tmp_dir / f"display{d}.png"
        if capture_display(d, str(path)):
            try:
                img = Image.open(path)
                images.append(img)
                print(f"Display {d}: {img.size[0]}x{img.size[1]}")
            except Exception as e:
                print(f"Failed to open display {d} capture: {e}", file=sys.stderr)
        else:
            print(f"Display {d} not available, skipping", file=sys.stderr)

    if len(images) < 2:
        print("Error: Could not capture both displays. Is your iPad connected via Sidecar?",
              file=sys.stderr)
        sys.exit(1)

    combined = combine_vertical(images[0], images[1])

    # Save to Desktop — auto-clean old screenshots first
    output_dir = Path.home() / "Desktop"
    for old in output_dir.glob("screenshot_dual_*.png"):
        old.unlink()
    timestamp = datetime.now().strftime("%Y-%m-%d_%H.%M.%S")
    output_path = output_dir / f"screenshot_dual_{timestamp}.png"
    combined.save(str(output_path), "PNG")
    print(f"Saved: {output_path}")

    # Copy to clipboard
    copy_to_clipboard(str(output_path))
    print("Copied to clipboard ✓")

    # Play feedback sound
    play_feedback_sound()

    # Cleanup
    img1_path.unlink(missing_ok=True)
    img2_path.unlink(missing_ok=True)
    tmp_dir.rmdir()


if __name__ == "__main__":
    main()
