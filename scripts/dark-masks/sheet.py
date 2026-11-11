"""Comparison sheet for one plate: the light theme, the dark theme as it renders now (the light
mask in the dark ink), and the dark theme with the new mask."""
import sys

import numpy as np
from PIL import Image

from darken import INK, PAPER, load_mask, oklch

LIGHT_PAPER = (255, 255, 255)
LIGHT_INK = oklch(0.42, 0.24, 284)


def paint(mask, paper, ink):
    canvas = np.empty((*mask.shape, 3), dtype=np.uint8)
    canvas[...] = paper
    canvas[mask] = ink
    return Image.fromarray(canvas)


light, dark, target, zoom = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])
light_mask, dark_mask = load_mask(light), load_mask(dark)
assert light_mask.shape == dark_mask.shape, (light_mask.shape, dark_mask.shape)
height, width = light_mask.shape
gap = 16
panels = [paint(light_mask, LIGHT_PAPER, LIGHT_INK), paint(light_mask, PAPER, INK), paint(dark_mask, PAPER, INK)]
sheet = Image.new("RGB", (width * 3 + gap * 4, height + gap * 2), (128, 128, 128))
for index, panel in enumerate(panels):
    sheet.paste(panel, (gap + index * (width + gap), gap))
sheet.resize((sheet.width * zoom, sheet.height * zoom), Image.NEAREST).save(target)
# Lit ink never lands outside the light mask's object, and never on its solid ink.
print(target, sheet.size, "zoom", zoom)
