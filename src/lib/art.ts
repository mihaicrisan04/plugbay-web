// Stipple artwork ships as one-bit masks. A dark theme gets its own mask where
// one exists (`name-dark.png` beside `name.png`), because a tonal negative
// turns an empty socket into a lit one.
import type { ImageMetadata } from "astro";

const darkMasks = import.meta.glob<{ default: ImageMetadata }>(
  ["../assets/*-dark.png", "../assets/figures/*/*-dark.png"],
  { eager: true }
);

const FILE = /(?<name>[^/]+)-dark\.png$/;

// The dark mask for an artwork, by the file name of its light one.
export function darkMaskFor(name: string): ImageMetadata | undefined {
  const match = Object.entries(darkMasks).find(
    ([path]) => FILE.exec(path)?.groups?.name === name
  );
  return match?.[1].default;
}

// The CSS variables a `.stipple` reads: one mask per theme, only one loaded.
export function maskStyle(light: ImageMetadata, name: string) {
  const dark = darkMaskFor(name);
  return [`--art:url(${light.src})`, dark ? `--art-dark:url(${dark.src})` : ""]
    .filter(Boolean)
    .join(";");
}
