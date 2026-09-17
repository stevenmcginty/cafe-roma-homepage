"""Remove the owner's personal details from the app captures used on the site.

The captures in this folder came from a signed-in session, so they carry a real
name and a real points balance. The website is a public demo, so both are
replaced with neutral stand-ins. Re-runnable: it works from the *-raw.png
copies, which are the untouched captures.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).parent
ARIAL = "C:/Windows/Fonts/arial.ttf"
ARIAL_BD = "C:/Windows/Fonts/arialbd.ttf"

GREY = (154, 168, 180)
WHITE = (243, 246, 248)
GOLD = (240, 190, 100)


def raw(name):
    """Keep one pristine copy per capture, and always edit from it."""
    src, keep = HERE / f"{name}.png", HERE / f"{name}-raw.png"
    if not keep.exists():
        keep.write_bytes(src.read_bytes())
    return Image.open(keep).convert("RGB")


def fill(im, box, sample):
    ImageDraw.Draw(im).rectangle(box, fill=im.getpixel(sample))


def greeting(im):
    """'Evening, Steven' -> 'Evening, Guest'."""
    fill(im, (146, 24, 420, 100), (440, 60))
    d = ImageDraw.Draw(im)
    d.text((150, 30), "Evening,", font=ImageFont.truetype(ARIAL, 38), fill=GREY)
    d.text((305, 30), "Guest", font=ImageFont.truetype(ARIAL_BD, 38), fill=WHITE)


def points_line(im):
    """Drop the real balance from the 'Free drinks available' card."""
    fill(im, (180, 752, 968, 796), (1000, 775))
    ImageDraw.Draw(im).text(
        (182, 757),
        "Collect 200 pts and your next drink is free.",
        font=ImageFont.truetype(ARIAL, 32),
        fill=GOLD,
    )


def main():
    for name, steps in (
        ("02-menu", (greeting,)),
        ("04-basket", (greeting, points_line)),
    ):
        im = raw(name)
        for step in steps:
            step(im)
        im.save(HERE / f"{name}.png", optimize=True)
        print(name, im.size, (HERE / f"{name}.png").stat().st_size // 1024, "KB")


if __name__ == "__main__":
    main()
