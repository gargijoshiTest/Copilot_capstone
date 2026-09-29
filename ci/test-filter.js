import assert from 'node:assert/strict';
import { filterColors } from '../lib/filter.js';

const colors = [
  { name: 'Crimson Red',  hex: '#DC143C', family: 'Red'   },
  { name: 'Sky Blue',     hex: '#87CEEB', family: 'Blue'  },
  { name: 'Forest Green', hex: '#228B22', family: 'Green' },
  { name: 'Rose Red',     hex: '#FF007F', family: 'Red'   },
];

assert.equal(filterColors(colors, '',    'All').length, 4);
assert.equal(filterColors(colors, 'red', 'All').length, 2);
assert.equal(filterColors(colors, 'xyz', 'All').length, 0);
assert.equal(filterColors(colors, '',    'Red').length, 2);
assert.equal(filterColors(colors, 'sky', 'Blue').length, 1);
assert.equal(filterColors(colors, 'sky', 'Red').length, 0);
assert.equal(filterColors(colors, 'RED', 'All').length, 2, 'case-insensitive');

// Malformed entries (missing/undefined name) must not throw a TypeError.
// When query is empty, filterColors returns all entries (normalise() is the gatekeeper).
// When a search query is active, malformed entries cannot match and are excluded.
const withMalformed = [
  ...colors,
  { hex: '#AABBCC', family: 'Red' },                  // missing name property
  { name: undefined, hex: '#AABBCC', family: 'Red' }, // explicitly undefined name
];
assert.equal(filterColors(withMalformed, 'red', 'All').length, 2, 'malformed entries excluded from search query');
assert.equal(filterColors(withMalformed, 'xyz', 'All').length, 0, 'malformed entries excluded when no match');
// Empty query: all 6 entries pass (malformed included — normalise() handles validation)
assert.equal(filterColors(withMalformed, '', 'All').length, 6, 'empty query passes all entries without throwing');

console.log('filter: all assertions passed');
