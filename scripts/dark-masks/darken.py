"""Derive a dark-theme stipple mask from a one-bit light mask.

Light mask: opaque where the ink goes, so ink means shadow, outline and hole.
Dark mask: opaque where the light ink goes, so it must mean lit surface instead.
Steps: find the object's silhouette, recover tone from ink density, dither the lit tone.
"""
import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as ndi


def disk(radius):
    y, x = np.ogrid[-radius : radius + 1, -radius : radius + 1]
    return x * x + y * y <= radius * radius + 0.5


def oklch(lightness, chroma, hue):
    a = chroma * math.cos(math.radians(hue))
    b = chroma * math.sin(math.radians(hue))
    l_ = lightness + 0.3963377774 * a + 0.2158037573 * b
    m_ = lightness - 0.1055613458 * a - 0.0638541728 * b
    s_ = lightness - 0.0894841775 * a - 1.2914855480 * b
    l, m, s = l_**3, m_**3, s_**3
    linear = (
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
    )
    return tuple(
        round(255 * (12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055))
        for c in (min(1, max(0, v)) for v in linear)
    )


PAPER = oklch(0.15, 0.045, 283)
INK = oklch(0.82, 0.115, 290)


def load_mask(path):
    return np.array(Image.open(path).convert("RGBA"))[..., 3] > 127


def silhouette(ink, seal, clear, pocket, dot, outside=(), inside=()):
    """True inside the drawn object.

    The ink is thickened first, so the gaps in a stippled outline close and empty space outside
    cannot leak in. Ground is then any open region that is far from all ink, or a dot-free
    pocket that is too wide to be a highlight or that runs off the picture. Ground is grown
    back to the outline at the end.
    """
    thick = ndi.binary_dilation(ink, structure=disk(seal))
    labels, count = ndi.label(~thick)
    reach = ndi.distance_transform_edt(~ink)
    index = np.arange(1, count + 1)
    widest = ndi.maximum(reach, labels, index=index)
    area = ndi.sum(~thick, labels, index=index)
    # Stipple dots are small separate specks of ink. A lit surface is open space with dots in it.
    dots = ink & ~structure_of(ink, dot)
    # Each open pixel's label, spread over the thickened ink around it, to count the dots it holds.
    spread = ndi.grey_dilation(labels, footprint=disk(seal + 1))
    dotted = ndi.sum(dots, spread, index=index) / np.maximum(area, 1)
    edge = np.zeros(count + 1, dtype=bool)
    for strip in (labels[0], labels[-1], labels[:, 0], labels[:, -1]):
        edge[np.unique(strip)] = True
    ground = np.zeros(count + 1, dtype=bool)
    plain = dotted < 0.004
    ground[1:] = (widest > clear) | (plain & (widest > pocket)) | (plain & edge[1:])
    for x, y in outside:
        ground[labels[y, x]] = True
    for x, y in inside:
        ground[labels[y, x]] = False
    ground[0] = False
    open_ground = ground[labels]
    inside = ~(ndi.binary_dilation(open_ground, structure=disk(seal)) & ~ink)
    # Where an outline runs along the edge of the picture there is no ground beyond it to grow
    # back from. What is left there is a sliver of empty space, not part of the object.
    slivers, sliver_count = ndi.label(inside & ~ink & (labels == 0))
    sliver_index = np.arange(1, sliver_count + 1)
    sliver_area = ndi.sum(np.ones_like(ink), slivers, index=sliver_index)
    sliver_dots = ndi.sum(ndi.binary_dilation(dots, structure=disk(1)), slivers, index=sliver_index)
    on_edge = np.zeros(sliver_count + 1, dtype=bool)
    for strip in (slivers[0], slivers[-1], slivers[:, 0], slivers[:, -1]):
        on_edge[np.unique(strip)] = True
    stray = np.zeros(sliver_count + 1, dtype=bool)
    stray[1:] = on_edge[1:] & (sliver_dots == 0) & (sliver_area < 40 * seal * seal)
    stray[0] = False
    return inside & ~stray[slivers]


def structure_of(ink, dot):
    """Ink that is drawing rather than shading: outlines, holes and solid shadow.
    A stipple dot is a speck of at most `dot` pixels."""
    blobs, count = ndi.label(ink)
    sizes = ndi.sum(ink, blobs, index=np.arange(1, count + 1))
    return np.isin(blobs, np.flatnonzero(sizes > dot) + 1)


def dither(tone):
    """Floyd-Steinberg, serpentine, so the dots do not line up in worms."""
    work = tone.astype(np.float64).copy()
    height, width = work.shape
    out = np.zeros_like(work, dtype=bool)
    for y in range(height):
        row = range(width) if y % 2 == 0 else range(width - 1, -1, -1)
        step = 1 if y % 2 == 0 else -1
        for x in row:
            old = work[y, x]
            new = old >= 0.5
            out[y, x] = new
            error = old - (1.0 if new else 0.0)
            if 0 <= x + step < width:
                work[y, x + step] += error * 7 / 16
            if y + 1 < height:
                if 0 <= x - step < width:
                    work[y + 1, x - step] += error * 3 / 16
                work[y + 1, x] += error * 5 / 16
                if 0 <= x + step < width:
                    work[y + 1, x + step] += error * 1 / 16
    return out


def lit_tone(ink, sigma, open_at, toe):
    """How lit each point is, from how little ink the light mask put around it.

    Bare paper in the light mask is a full highlight. Below `toe` the surface is left open, so
    deep shade and the faint stipple of a cast shadow stay ground instead of turning to specks.
    """
    density = ndi.gaussian_filter(ink.astype(np.float64), sigma)
    lit = np.clip(1 - density / open_at, 0, 1)
    return np.clip((lit - toe) / (1 - toe), 0, 1)


def save_mask(mask, path):
    image = Image.fromarray(mask.astype(np.uint8), mode="P")
    image.putpalette([0, 0, 0, 0, 0, 0])
    image.save(path, bits=1, transparency=0, optimize=True, compress_level=9)


def render(mask):
    canvas = np.empty((*mask.shape, 3), dtype=np.uint8)
    canvas[...] = PAPER
    canvas[mask] = INK
    return Image.fromarray(canvas)


def compare(light, dark, inside, path):
    gap = 24
    height, width = light.shape
    sheet = Image.new("RGB", (width * 3 + gap * 2, height), PAPER)
    sheet.paste(render(light), (0, 0))
    sheet.paste(render(dark), (width + gap, 0))
    sheet.paste(render(inside), (2 * (width + gap), 0))
    sheet.save(path)


def main(source, target, comparison, **settings):
    ink = load_mask(source)
    # Sizes below are in pixels of a drawing about 1000 wide; smaller masks scale them down.
    scale = settings.get("scale", 1.0)
    dot = max(3, round(settings.get("dot", 14) * scale * scale))
    inside = silhouette(
        ink,
        max(2, round(settings.get("seal", 4) * scale)),
        settings.get("clear", 18) * scale,
        settings.get("pocket", 7) * scale,
        dot,
        settings.get("outside", ()),
        settings.get("inside", ()),
    )
    tone = lit_tone(
        ink,
        settings.get("sigma", 1.8) * scale,
        settings.get("open_at", 0.62),
        settings.get("toe", 0.2),
    )
    tone[~inside] = 0
    # A through-hole shows bare paper in the light mask, which is the ground. The mask cannot
    # tell that from a highlight, so each one is named: centre and radii, in the mask's pixels.
    rows, columns = np.mgrid[: ink.shape[0], : ink.shape[1]]
    for centre_x, centre_y, radius_x, radius_y in settings.get("holes", ()):
        through = ((columns - centre_x) / radius_x) ** 2 + ((rows - centre_y) / radius_y) ** 2 <= 1
        tone[through] = 0
    # The drawing's own lines stay exactly where they are, as open ground between lit surfaces.
    lines = structure_of(ink, max(dot, round(settings.get("line", 40) * scale * scale)))
    # Dots the size of the light mask's own stipple: dither coarse, then cut the lines in fine.
    grain = settings.get("grain", 1)
    height, width = tone.shape
    if grain > 1:
        padded = np.pad(tone, ((0, -height % grain), (0, -width % grain)), mode="edge")
        coarse = padded.reshape(padded.shape[0] // grain, grain, padded.shape[1] // grain, grain).mean(axis=(1, 3))
        dots = np.kron(dither(coarse), np.ones((grain, grain), dtype=bool))[:height, :width]
    else:
        dots = dither(tone)
    # Same finishing as relight.py: a smooth silhouette where the outline is dotted, and nothing
    # lit that is not part of a solid lit surface.
    from relight import clear_strays, smooth_outline

    inside = smooth_outline(inside, ink, max(dot, round(settings.get("line", 40) * scale * scale)), settings.get("outline_sigma", 2.0) * scale)
    dark, _ = clear_strays(dots & inside & ~lines, settings, scale)
    save_mask(dark, target)
    compare(ink, dark, inside, comparison)
    print(Path(target).name, ink.shape[::-1], "light on", round(ink.mean(), 3), "dark on", round(dark.mean(), 3), "inside", round(inside.mean(), 3), Path(target).stat().st_size, "bytes vs", Path(source).stat().st_size)


if __name__ == "__main__":
    import json

    main(sys.argv[1], sys.argv[2], sys.argv[3], **json.loads(sys.argv[4] if len(sys.argv) > 4 else "{}"))
