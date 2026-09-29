# Implementation Plan: Color Palette Explorer

_Generated: 2026-09-29_
_Based on: docs/TES-2/architecture.md, docs/TES-2/design-review.md_

---

## Context

Many core files (lib/colorUtils.js, lib/filter.js, ci/test-colorUtils.js, ci/test-filter.js,
index.html, styles.css, colors.v1.json, app.js, package.json, .github/workflows/ci.yml) were
scaffolded in a prior session but were not compliant with all TES-2 architecture decisions.

This plan captures the **gap-filling tasks** required to bring the codebase into full compliance
with the architecture.md + design-review.md (DD-01..DD-08) and to produce all required deliverables.

Files that already fully satisfy their requirements are marked [EXISTING — NO CHANGE].

---

## Execution Order

Tasks are listed in dependency order. Unblocked tasks at the same level can be worked in parallel.

### Wave 1 — Pure Utilities (no source dependencies)

- TASK-01: Create `lib/debounce.js`

### Wave 2 — Unit Tests (depend only on lib/)

- TASK-02: Create `ci/test-debounce.js`

### Wave 3 — Configuration

- TASK-03: Update `package.json` test script to include test-debounce.js

### Wave 4 — Static Assets (already complete — no source changes)

- TASK-04: `colors.v1.json` — [EXISTING — NO CHANGE]
- TASK-05: `styles.css` — [EXISTING — NO CHANGE]

### Wave 5 — HTML Shell

- TASK-06: Update `index.html` — add aria-busy="true" to swatch-list; add copy-message element

### Wave 6 — App Orchestrator

- TASK-07: Update `app.js` — import debounce from lib/debounce.js; fix clipboard DD-05;
  fix SEC-01 innerHTML; add aria-busy management DR2-05; add aria-label on swatches

---

## Blocked Tasks

| Task | Blocked By | Reason |
|---|---|---|
| TASK-02 | TASK-01 | test-debounce.js imports lib/debounce.js |
| TASK-07 | TASK-01 | app.js imports lib/debounce.js |
| TASK-03 | TASK-02 | package.json references ci/test-debounce.js |

---

## Task Details

---

TASK-01: Create lib/debounce.js
  Type:         [FILE]
  Output:       lib/debounce.js
  Depends on:   none
  Blocked by:   unblocked
  Description:  Extracts the trailing-edge debounce utility and DEBOUNCE_MS = 150 constant into a
                pure module with no DOM coupling. Required by DD-06 (design-review.md): pure
                utilities must live in lib/ so they are independently unit-testable.
                Importable by both app.js and ci/test-debounce.js (Node environment, no browser
                globals needed).
  Acceptance:   DD-06, DR2-02, NFR-01, ArchitectureGuidelines §2 (lib/ = pure functions)

---

TASK-02: Create ci/test-debounce.js
  Type:         [FILE]
  Output:       ci/test-debounce.js
  Depends on:   TASK-01
  Blocked by:   TASK-01
  Description:  Node smoke test for lib/debounce.js. Verifies: DEBOUNCE_MS is 150; debounce()
                returns a function; the returned function delays invocation until after the delay
                period and coalesces multiple rapid calls into one. Runs with plain `node` — no
                test framework needed. Uses top-level await (ES module, Node 20).
  Acceptance:   DD-06, FR-11, AC-07, ArchitectureGuidelines §8 (100% branch coverage for lib/)

---

TASK-03: Update package.json test script
  Type:         [EDIT]
  Output:       package.json
  Depends on:   TASK-02
  Blocked by:   TASK-02
  Description:  Adds `node ci/test-debounce.js` to the test npm script so that `npm test` runs
                all four smoke tests: test-colorUtils.js, test-filter.js, test-debounce.js,
                test-playground.js. Keeps existing tests so TES-3 remains covered.
  Acceptance:   FR-11, AC-07, AC-08

---

TASK-04: colors.v1.json — EXISTING, NO CHANGE
  Type:         [FILE]
  Output:       colors.v1.json
  Depends on:   none
  Blocked by:   unblocked
  Description:  Static color dataset with 20+ entries. Each entry has name (string), hex (string),
                family (string). Already present and valid. No changes required.
  Acceptance:   FR-01, AC-01

---

TASK-05: styles.css — EXISTING, NO CHANGE
  Type:         [FILE]
  Output:       styles.css
  Depends on:   none
  Blocked by:   unblocked
  Description:  Complete: warning colour token, offline banner, loading spinner with
                @media (prefers-reduced-motion: reduce), swatch grid, modal, empty state,
                responsive breakpoints. Satisfies DR2-06 and DD-01..DD-08 visual requirements.
  Acceptance:   NFR-02, DR2-06, AC-01, AC-06

---

TASK-06: Update index.html
  Type:         [EDIT]
  Output:       index.html
  Depends on:   none
  Blocked by:   unblocked
  Description:  Two targeted edits: (1) Add aria-busy="true" to the swatch-list div so assistive
                technology knows content is loading (DR2-05). (2) Add a <p id="copy-message">
                element inside the modal-inner div for the DD-05 clipboard failure message.
  Acceptance:   DR2-05, DD-05, NFR-03, AC-05, EC-04

---

TASK-07: Update app.js
  Type:         [EDIT]
  Output:       app.js
  Depends on:   TASK-01, TASK-06
  Blocked by:   TASK-01, TASK-06
  Description:  Six targeted changes:
                (1) Import { debounce, DEBOUNCE_MS } from './lib/debounce.js'; remove inline
                    debounce() function and const DEBOUNCE_MS (DD-06).
                (2) Replace two list.innerHTML = '' calls with list.replaceChildren() (SEC-01).
                (3) Fix copyHex() — on Clipboard API unavailable or rejection, call
                    showCopyMessage('Could not copy — please copy manually') (DD-05, EC-04).
                (4) Add aria-busy management to setAppState: set 'true' on loading, 'false'
                    on ready (DR2-05).
                (5) Add aria-label="${color.name} ${color.hex}" on each swatch button
                    (ArchitectureGuidelines §7).
                (6) Reset copy-message to hidden on every openModal() call.
  Acceptance:   DD-05, DD-06, DD-07, DR2-05, SEC-01, NFR-03, NFR-05, EC-04, AC-05

---

## Completion Checklist

| Task | Satisfies |
|---|---|
| TASK-01 | DD-06, DR2-02, NFR-01, FR-11 |
| TASK-02 | DD-06, FR-11, AC-07 |
| TASK-03 | FR-11, AC-07, AC-08 |
| TASK-04 | FR-01, AC-01 (no change) |
| TASK-05 | NFR-02, DR2-06 (no change) |
| TASK-06 | DR2-05, DD-05, NFR-03 |
| TASK-07 | DD-05, DD-06, DD-07, DR2-05, SEC-01, NFR-03, NFR-05, EC-04, AC-05 |
