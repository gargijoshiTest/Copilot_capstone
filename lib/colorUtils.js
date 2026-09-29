// WCAG 2.1 §1.4.3 sRGB linearisation constants
const SRGB_LINEAR_THRESHOLD = 0.03928; // below this, channel is in the linear region
const SRGB_LINEAR_DIVISOR   = 12.92;   // divisor for the linear region
const SRGB_GAMMA_OFFSET     = 0.055;   // offset applied before gamma expansion
const SRGB_GAMMA_SCALE      = 1.055;   // scale applied before gamma expansion
const SRGB_GAMMA            = 2.4;     // gamma exponent for sRGB

// WCAG 2.1 relative luminance coefficients for sRGB primaries
const LUM_R = 0.2126;
const LUM_G = 0.7152;
const LUM_B = 0.0722;

// Luminance threshold: above this value, black text (#000) achieves ≥4.5:1 contrast
const SWATCH_LUMINANCE_THRESHOLD = 0.179;

export function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function linearise(c) {
  return c <= SRGB_LINEAR_THRESHOLD
    ? c / SRGB_LINEAR_DIVISOR
    : Math.pow((c + SRGB_GAMMA_OFFSET) / SRGB_GAMMA_SCALE, SRGB_GAMMA);
}

function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return LUM_R * linearise(r / 255) +
         LUM_G * linearise(g / 255) +
         LUM_B * linearise(b / 255);
}

export function getContrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hex1), l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2), darker = Math.min(l1, l2);
  return parseFloat(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

export function getSwatchTextColor(hex) {
  return relativeLuminance(hex) > SWATCH_LUMINANCE_THRESHOLD ? '#000000' : '#ffffff';
}
