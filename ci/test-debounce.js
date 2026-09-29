import assert from 'node:assert/strict';
import { debounce, DEBOUNCE_MS } from '../lib/debounce.js';

// Constant checks
assert.equal(typeof DEBOUNCE_MS, 'number', 'DEBOUNCE_MS should be a number');
assert.equal(DEBOUNCE_MS, 150, 'DEBOUNCE_MS should equal 150');

// Type check
assert.equal(typeof debounce, 'function', 'debounce should export a function');
const wrapped = debounce(() => {}, 10);
assert.equal(typeof wrapped, 'function', 'debounce() should return a function');

// Timing: multiple rapid calls coalesce into one
await new Promise((resolve, reject) => {
  let callCount = 0;
  const debouncedInc = debounce(() => { callCount++; }, 30);

  debouncedInc();
  debouncedInc();
  debouncedInc();

  assert.equal(callCount, 0, 'function should not be called before delay expires');

  setTimeout(() => {
    try {
      assert.equal(callCount, 1, 'function should be called exactly once after delay');
      resolve();
    } catch (err) {
      reject(err);
    }
  }, 100);
});

console.log('debounce: all assertions passed');
