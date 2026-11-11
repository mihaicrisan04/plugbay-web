"""Dark-theme stipple mask from a one-bit light mask, keeping the light mask's own drawing.

The light mask puts ink where it is dark. Here ink goes where it is lit, so the base is the
exact negative of the light mask inside the object's silhouette: every outline, tooth and dot
of the original stays where it was, now as open ground on a lit surface. Tone is then moved to
a target by adding or removing specks, never by redrawing.
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

from darken import INK, PAPER, disk, dither, load_mask, save_mask, silhouette, structure_of


def masked_blur(values, mask, sigma):
    """Mean of `values` over the part of each neighbourhood that lies inside `mask`."""
    weight = ndi.gaussian_filter(mask.astype(np.float64), sigma)
    total = ndi.gaussian_filter(np.where(mask, values, 0).astype(np.float64), sigma)
    return np.where(weight > 1e-3, total / np.maximum(weight, 1e-3), 0)


def white_point(density, inside, window, quantile, ceiling):
    """The lightest tone a surface reaches near each point: what full light looks like there.
    Capped, so a hole or a deep shadow is never mistaken for a dark surface in full light."""
    half = density[::2, ::2]
    known = inside[::2, ::2]
    # Outside the object counts as fully dark, so it never sets the white point.
    filled = np.where(known, half, 1.0)
    size = max(3, int(window / 2) | 1)
    low = ndi.percentile_filter(filled, quantile, size=size)
    low = ndi.gaussian_filter(low, size / 4)
    full = np.kron(low, np.ones((2, 2)))[: density.shape[0], : density.shape[1]]
    full = np.pad(full, ((0, density.shape[0] - full.shape[0]), (0, density.shape[1] - full.shape[1])), mode="edge")
    return np.minimum(full, ceiling)


def zone_mask(shape, zone):
    """A hand-traced band: a polyline and its width, in the mask's pixels."""
    image = Image.new("L", shape[::-1], 0)
    draw = ImageDraw.Draw(image)
    points = [tuple(point) for point in zone["path"]]
    draw.line(points, fill=255, width=int(zone["width"]), joint="curve")
    radius = zone["width"] / 2
    for x, y in (points[0], points[-1]):
        draw.ellipse([x - radius, y - radius, x + radius, y + radius], fill=255)
    band = np.array(image) > 127
    if "after" in zone:
        # A straight cut across the band: only what lies below the line through (x, y) with
        # this slope belongs to it. Used where a cable comes out of a cast shadow.
        x, y, slope = zone["after"]
        rows, columns = np.mgrid[: shape[0], : shape[1]]
        band &= rows - y >= slope * (columns - x)
    return band


def smooth_outline(inside, ink, line, sigma):
    """Where the light mask draws an edge as a row of dots, the silhouette found from it is
    ragged. Smooth it there. Where the edge is a drawn line, keep it to the pixel."""
    rounded = ndi.gaussian_filter(inside.astype(np.float64), sigma) > 0.5
    drawn = ndi.binary_dilation(structure_of(ink, line), structure=disk(3))
    return np.where(drawn, inside, rounded)


def lit_masses(lit, sigma, level, least_area, least_radius):
    """The solid lit parts of a mask: what is left of it once specks and stray lines are gone."""
    mass = ndi.gaussian_filter(lit.astype(np.float64), sigma) > level
    labels, count = ndi.label(mass)
    if count == 0:
        return mass
    index = np.arange(1, count + 1)
    area = ndi.sum(mass, labels, index=index)
    radius = ndi.maximum(ndi.distance_transform_edt(mass), labels, index=index)
    kept = np.zeros(count + 1, dtype=bool)
    kept[1:] = (area >= least_area) & (radius >= least_radius)
    return kept[labels]


def clear_strays(lit, settings, scale):
    """Drop every lit pixel outside the solid lit parts of the object: specks left by a faint
    cast shadow, columns at the picture's edge, a line cut off from its surface. Fine detail
    inside a lit surface, such as the rim of a socket, is enclosed by it and stays."""
    masses = lit_masses(
        lit,
        settings.get("mass_sigma", 2.0) * scale,
        settings.get("mass_level", 0.3),
        settings.get("mass_area", 400) * scale * scale,
        settings.get("mass_radius", 2.5) * scale,
    )
    hull = ndi.binary_fill_holes(ndi.binary_dilation(masses, structure=disk(2)))
    return lit & hull, masses


def relight(ink, settings):
    scale = settings.get("scale", 1.0)
    seal = max(2, round(settings.get("seal", 4) * scale))
    dot = max(3, round(settings.get("dot", 14) * scale * scale))
    inside = silhouette(ink, seal, settings.get("clear", 18) * scale, settings.get("pocket", 7) * scale, dot)
    line = max(dot, round(settings.get("line", 40) * scale * scale))
    inside = smooth_outline(inside, ink, line, settings.get("outline_sigma", 2.0) * scale)
    for centre_x, centre_y, radius_x, radius_y in settings.get("holes", ()):
        rows, columns = np.mgrid[: ink.shape[0], : ink.shape[1]]
        inside &= ((columns - centre_x) / radius_x) ** 2 + ((rows - centre_y) / radius_y) ** 2 > 1

    # A band along the silhouette, the width of the light mask's outline. Where the surface
    # behind it is lit it is drawn solid, as the lit edge of the object.
    rim = inside & ndi.binary_dilation(~inside, structure=disk(settings.get("edge", 2)))
    shade = ink & inside & ~rim

    sigma = settings.get("sigma", 2.5) * scale
    density = masked_blur(shade, inside, sigma)
    low = white_point(
        density,
        inside,
        settings.get("window", 61) * scale,
        settings.get("quantile", 20),
        settings.get("ceiling", 0.06),
    )
    target = np.clip(1 - (density - low) / settings.get("range", 0.4), 0, 1) ** settings.get("gamma", 1.0)
    for zone in settings.get("zones", ()):
        band = zone_mask(ink.shape, zone) & inside
        blur = zone.get("soft", 2.0)
        soft = ndi.gaussian_filter(band.astype(np.float64), blur) if blur else band.astype(np.float64)
        lit = np.clip(1 - (density - zone["white"]) / zone["range"], 0, 1)
        target = target * (1 - soft) + lit * soft

    # Move the exact negative to the target tone. Where the surface should be lighter than the
    # negative, some of the original dots are filled in. Where darker, specks are opened.
    negative = 1 - density
    fill = np.clip((target - negative) / np.maximum(1 - negative, 1e-3), 0, 1)
    keep = np.clip(target / np.maximum(negative, 1e-3), 0, 1)
    tone = np.where(shade, fill, keep)
    tone[rim | ~inside] = 0
    lit, masses = clear_strays(dither(tone) & inside & ~rim, settings, scale)

    # The lit edge runs where a lit surface lies just behind the silhouette. It is decided a
    # stretch at a time, not a pixel at a time: short gaps close, short scraps go.
    reach = settings.get("edge_reach", 4.0) * scale
    behind = masked_blur(target, inside & ~rim, reach)
    near = ndi.binary_dilation(masses, structure=disk(max(2, round(settings.get("edge_gap", 9) * scale))))
    lit_rim = rim & near & (behind > settings.get("edge_floor", 0.35))
    # A stretch of outline can be named, where the object's own edge is in shade but the
    # outline has to stay whole: left, top, right, bottom, in the mask's pixels.
    for left, top, right, bottom in settings.get("rim_on", ()):
        lit_rim[top:bottom, left:right] |= rim[top:bottom, left:right]
    join = disk(max(1, round(settings.get("edge_join", 8) * scale)))
    lit_rim = ndi.binary_closing(np.pad(lit_rim, 16), structure=join)[16:-16, 16:-16] & rim & near
    scraps, count = ndi.label(lit_rim, structure=np.ones((3, 3)))
    length = ndi.sum(lit_rim, scraps, index=np.arange(1, count + 1))
    long_enough = np.zeros(count + 1, dtype=bool)
    long_enough[1:] = length >= settings.get("edge_least", 60) * scale
    lit |= long_enough[scraps]
    # A patch can be named to be left as ground: left, top, right, bottom, in the mask's pixels.
    for left, top, right, bottom in settings.get("erase", ()):
        lit[top:bottom, left:right] = False
    return lit, inside


def paint(mask, paper, ink):
    canvas = np.empty((*mask.shape, 3), dtype=np.uint8)
    canvas[...] = paper
    canvas[mask] = ink
    return Image.fromarray(canvas)


if __name__ == "__main__":
    source, target = sys.argv[1], sys.argv[2]
    settings = json.loads(Path(sys.argv[3]).read_text()) if len(sys.argv) > 3 else {}
    ink = load_mask(source)
    dark, inside = relight(ink, settings)
    save_mask(dark, target)
    if len(sys.argv) > 4:
        gap = 16
        height, width = ink.shape
        sheet = Image.new("RGB", (width * 2 + gap, height), (128, 128, 128))
        sheet.paste(paint(ink, PAPER, INK), (0, 0))
        sheet.paste(paint(dark, PAPER, INK), (width + gap, 0))
        sheet.save(sys.argv[4])
    print(Path(target).name, ink.shape[::-1], "lit", round(float(dark.mean()), 3), Path(target).stat().st_size, "bytes; light mask", Path(source).stat().st_size)
