"""Cafe Roma photo grade: "Golden Hour Trattoria".

One consistent look for the website photo set: warm gold highlights, a
faint teal lean in the shadows, a gentle film-style S-curve, vibrance
(low-saturation colours pushed more than already-rich ones), and a soft
vignette. Tuned to sit beside images/exterior.jpg, the sunny hero.

Run from anywhere:  python images/graded/grade.py
Reads the originals in images/ (never modified). Writes JPEGs here.
Requires Pillow + numpy.
"""
from __future__ import annotations

import io
import shutil
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

HERE = Path(__file__).resolve().parent
IMG = HERE.parent
MAX_BYTES = 350_000  # decimal KB, the stricter reading of "under 350 KB"
LONG_SIDE = 1600

LUMA = np.array([0.299, 0.587, 0.114], dtype=np.float32)


# --------------------------------------------------------------------------
# Grade primitives (float32 RGB in 0..1, gamma space; good enough for web)
# --------------------------------------------------------------------------
def white_balance(x, gains):
    return x * np.asarray(gains, dtype=np.float32)


def tone_curve(x, lift=0.0, contrast=0.0, gamma=1.0):
    """Film-ish curve: blend toward a smoothstep S-curve, then lift blacks."""
    s = x * x * (3.0 - 2.0 * x)
    y = (1.0 - contrast) * x + contrast * s
    if gamma != 1.0:
        y = np.power(np.clip(y, 0, 1), 1.0 / gamma)
    return lift + (1.0 - lift) * y


def split_tone(x, shadow, highlight, amount):
    l = (x * LUMA).sum(axis=-1, keepdims=True)
    ws = (1.0 - l) ** 2
    wh = l ** 2
    return x + amount * (ws * np.asarray(shadow, np.float32)
                         + wh * np.asarray(highlight, np.float32))


def vibrance(x, amount, saturation=0.0):
    l = (x * LUMA).sum(axis=-1, keepdims=True)
    sat = x.max(axis=-1, keepdims=True) - x.min(axis=-1, keepdims=True)
    k = 1.0 + saturation + amount * (1.0 - sat)
    return l + (x - l) * k


def vignette(x, strength=0.12, start=0.55, end=1.25):
    h, w = x.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    r = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2)
    t = np.clip((r - start) / (end - start), 0, 1)
    t = t * t * (3 - 2 * t)
    return x * (1.0 - strength * t)[..., None]


BASE = dict(
    wb=(1.025, 1.0, 0.965),          # a touch of warmth
    lift=0.012,                      # blacks not crushed
    contrast=0.28,                   # gentle S
    gamma=1.0,
    shadow=(-0.030, 0.004, 0.040),   # teal lean in the shadows
    highlight=(0.040, 0.020, -0.028),  # gold in the highlights
    split=0.9,
    vibrance=0.22,
    saturation=0.03,
    vignette=0.11,
)


def grade(im: Image.Image, **over) -> Image.Image:
    p = {**BASE, **over}
    x = np.asarray(im.convert("RGB"), dtype=np.float32) / 255.0
    x = white_balance(x, p["wb"])
    x = tone_curve(np.clip(x, 0, 1), p["lift"], p["contrast"], p["gamma"])
    x = split_tone(x, p["shadow"], p["highlight"], p["split"])
    x = vibrance(x, p["vibrance"], p["saturation"])
    x = vignette(np.clip(x, 0, 1), p["vignette"])
    x = np.clip(x, 0, 1) * 255.0 + 0.5
    return Image.fromarray(x.astype(np.uint8), "RGB")


# --------------------------------------------------------------------------
# Output pipeline
# --------------------------------------------------------------------------
def fit(im: Image.Image, long_side: int | None) -> Image.Image:
    """Downscale to long_side. Never upscale: a crop stays at native pixels."""
    w, h = im.size
    if long_side is None or max(w, h) <= long_side:
        return im
    s = long_side / max(w, h)
    return im.resize((round(w * s), round(h * s)), Image.Resampling.LANCZOS)


def save_jpeg(im: Image.Image, path: Path, sharpen: int = 55) -> tuple[int, str]:
    """Highest quality that fits MAX_BYTES: 4:2:2 chroma first, then 4:2:0."""
    if sharpen:
        im = im.filter(ImageFilter.UnsharpMask(radius=1.0, percent=sharpen, threshold=2))
    attempts = [(1, q) for q in range(90, 77, -2)] + \
               [(2, q) for q in range(86, 59, -2)]
    for sub, q in attempts:
        buf = io.BytesIO()
        im.save(buf, "JPEG", quality=q, optimize=True, progressive=True,
                subsampling=sub)
        if buf.tell() <= MAX_BYTES:
            break
    else:
        raise SystemExit(f"{path.name}: cannot fit under {MAX_BYTES} bytes")
    path.write_bytes(buf.getvalue())
    return buf.tell(), f"q{q} 4:2:{'2' if sub == 1 else '0'}"


# (name, source, crop box in source pixels or None, grade overrides, output)
# output keys: long (max long side, default LONG_SIDE), sharpen (unsharp %),
# preblur (gaussian radius before downscale, tames dense detail for size)
JOBS = [
    # Real Cafe Roma interior. Crop drops the bin and bin bag (bottom-left)
    # and the stranger's arm entering at the right edge.
    ("interior.jpg", IMG / "interior.jpg", (275, 30, 1128, 900), {}, {}),
    # Detail crops from the same real photo, at native pixels.
    ("interior-mirrors.jpg", IMG / "interior.jpg", (285, 60, 905, 570), {}, {}),
    ("interior-counter.jpg", IMG / "interior.jpg", (655, 280, 1112, 745), {}, {}),
    ("interior-lights.jpg", IMG / "interior.jpg", (620, 40, 1200, 350),
     dict(vignette=0.14), {}),
    # Stock photos already live on the site. Warmed to match the room.
    ("coffee.jpg", IMG / "coffee.jpg", None,
     dict(wb=(1.03, 1.0, 0.955), vignette=0.16, contrast=0.24), {}),
    # High-key white background: keep the vignette faint so the corners
    # stay white, not grey.
    ("pastries.jpg", IMG / "pastries.jpg", None,
     dict(wb=(1.012, 1.0, 0.975), vignette=0.05, contrast=0.22, gamma=1.03,
          highlight=(0.02, 0.01, -0.012), split=0.6, lift=0.0), {}),
    # Real, owner-uploaded shopfront. Tight crop on the blue frontage,
    # lemon trees and pavement tables; neighbours' signage dropped.
    # Very dense detail: 1300px + light pre-blur is what fits 350 KB at q78.
    ("exterior-front.jpg", IMG / "google" / "owner" / "exterior-1.jpg",
     (350, 40, 2160, 1807),
     dict(vibrance=0.18, saturation=0.0, vignette=0.09,
          shadow=(-0.02, 0.004, 0.03)),
     dict(long=1300, preblur=0.6, sharpen=35)),
]


def keep_original(name: str) -> None:
    src = IMG / f"{name}.jpg"
    dst = IMG / f"{name}-original.jpg"
    if src.exists() and not dst.exists():
        shutil.copy2(src, dst)


def main() -> None:
    for n in ("interior", "coffee", "pastries"):
        keep_original(n)
    for name, src, box, over, out in JOBS:
        im = Image.open(src)
        if box:
            im = im.crop(box)
        im = grade(im, **over)
        if out.get("preblur"):
            im = im.filter(ImageFilter.GaussianBlur(out["preblur"]))
        im = fit(im, out.get("long", LONG_SIDE))
        size, enc = save_jpeg(im, HERE / name, out.get("sharpen", 55))
        print(f"{name:22s} {im.size[0]}x{im.size[1]:<5d} {size/1024:6.1f} KB  {enc}")


if __name__ == "__main__":
    main()
