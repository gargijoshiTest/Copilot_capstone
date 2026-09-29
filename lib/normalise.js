/**
 * lib/normalise.js — shared color-data normalisation utilities
 *
 * Pure module: no DOM access, no side effects; safe to import in Node.js CI.
 */

/** Embedded fallback dataset used when colors.v1.json cannot be fetched. */
export const FALLBACK_COLORS = [
  { name: 'Crimson',      hex: '#DC143C', family: 'Red'     },
  { name: 'Royal Blue',   hex: '#4169E1', family: 'Blue'    },
  { name: 'Forest Green', hex: '#228B22', family: 'Green'   },
  { name: 'Gold',         hex: '#FFD700', family: 'Yellow'  },
  { name: 'Indigo',       hex: '#4B0082', family: 'Purple'  },
  { name: 'Silver',       hex: '#C0C0C0', family: 'Neutral' },
];

/**
 * Validates and filters raw color data from JSON.
 * Returns only entries with string name, hex, and family.
 * @param {unknown} raw
 * @returns {{ name: string, hex: string, family: string }[]}
 */
export function normalise(raw) {
  if (!Array.isArray(raw)) {
    console.warn('Color data is not an array, using fallback.');
    return [];
  }
  return raw.filter(c => {
    const ok = c && typeof c.name === 'string' && typeof c.hex === 'string' && typeof c.family === 'string';
    if (!ok) console.warn('Dropping malformed color entry:', c);
    return ok;
  });
}
