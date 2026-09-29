# Design Review: Color Palette Explorer

_Reviewed: 2026-09-29_
_Reviewer: designReviewer agent (Senior Reviewer perspective)_
_Documents reviewed: docs/architecture.md, docs/requirements.md_
_Prior review: 2026-09-15 (15 findings, all accepted — architecture.md updated then)_

---

## Review Summary

| Dimension | Findings | Accepted | Rejected | Deferred |
|---|---|---|---|---|
| Requirements Traceability | 1 | 1 | 0 | 0 |
| Component Design | 2 | 2 | 0 | 0 |
| Data Flow & State | 0 | 0 | 0 | 0 |
| Security | 0 | 0 | 0 | 0 |
| Performance | 0 | 0 | 0 | 0 |
| Accessibility | 3 | 3 | 0 | 0 |
| Error Handling | 0 | 0 | 0 | 0 |
| Testability & CI | 1 | 1 | 0 | 0 |
| **Total** | **7** | **7** | **0** | **0** |

**Overall verdict:** APPROVED WITH CONDITIONS — all 7 findings accepted; architecture.md updated before coding begins.

---

## Design Sanity Check Scores

| Dimension | Score | Findings |
|---|---|---|
| 1 — Requirements Coverage | PARTIAL | 1 finding |
| 2 — Security Posture | PASS | 0 findings |
| 3 — Scalability & Performance | PASS | 0 findings |
| 4 — Edge Case Coverage | PARTIAL | 0 new findings (EC-04 counted in Dimension 1) |
| 5 — Component Boundaries | PARTIAL | 2 findings |
| 6 — Accessibility Architecture | PARTIAL | 3 findings |
| 7 — Operational Readiness | PARTIAL | 1 finding |
| 8 — Cloud & Budget | PASS | 0 findings — static hosting only, no cloud cost concerns |

**Coding may start:** YES — all findings accepted and architecture.md updated.

---

## Accepted Findings (to be actioned)

### DR2-01: Clipboard Fallback Contradicts EC-04
- **Severity**: RISK
- **Dimension**: Requirements Traceability / Error Handling
- **Finding**: EC-04 requires the app to "display a fallback message rather than throwing an unhandled exception" when the Clipboard API is unavailable. `docs/architecture.md` Section 5 (data flow step 11 and sequence diagram) states "silent fallback if Clipboard API unavailable" — this directly contradicts EC-04 and would produce a silent failure with no user feedback.
- **Agreed resolution**: When `navigator.clipboard.writeText` throws (API unavailable or permission denied), `app.js` renders a DOM message `"Could not copy — please copy manually"` in the modal. Log the error via `console.warn`. No unhandled exception.
- **Architecture change required**: YES

---

### DR2-02: debounce() Is Inline in app.js — Violates ArchitectureGuidelines
- **Severity**: GAP
- **Dimension**: Component Design / Testability
- **Finding**: The component table describes `debounce()` as "Vanilla JS (inline utility)" inside `app.js`. ArchitectureGuidelines section 2 mandates that pure utility functions with no DOM coupling belong in `lib/`. The `debounce()` function has no DOM coupling and is a pure higher-order utility. Its placement in `app.js` makes it impossible to unit-test independently and violates the separation of concerns defined by ArchitectureGuidelines. Section 8 of ArchitectureGuidelines requires 100% branch coverage for all `lib/` functions.
- **Agreed resolution**: Extract `debounce()` and `DEBOUNCE_MS = 150` to `lib/debounce.js`. Add `ci/test-debounce.js` smoke test. Update component table and Mermaid diagram accordingly.
- **Architecture change required**: YES

---

### DR2-03: App State Machine Describes Unreachable Error State
- **Severity**: DECISION-NEEDED
- **Dimension**: Component Design
- **Finding**: The `app.js` component description defines the state machine as `loading → ready | error` (also DD-04 from prior review). However, NFR-07 and Section 6 of `architecture.md` both state "on any failure path app transitions to `ready` state using fallback data and shows non-dismissible warning banner — no crash, no error-only state." The `error` state is architecturally unreachable — no code path triggers it. A developer reading the state machine would likely add unreachable error-state UI, increasing footprint without value.
- **Agreed resolution**: Simplify the state machine to `loading → ready`. Define two flavors of `ready`: **normal** (full data from fetch) and **offline** (fallback data + warning banner active). Remove `| error` branch entirely. Supersedes DD-04.
- **Architecture change required**: YES

---

### DR2-04: aria-live Not Triggered for Family Dropdown Selection
- **Severity**: GAP
- **Dimension**: Accessibility
- **Finding**: The data flow sequence diagram and Section 6 NFR table specify `aria-live` announcement ("Showing N of T colors") only on "debounce resolution" — i.e., search input events only. Family dropdown selection also changes the result set immediately. Screen-reader users who use the dropdown would receive no announcement of the updated result count, violating WCAG 2.1 AA SC 4.1.3 (Status Messages).
- **Agreed resolution**: `aria-live` region must update on every filter operation: debounce resolution for search input AND immediately after dropdown selection. Document this in the sequence diagram and Section 6 NFR table.
- **Architecture change required**: YES

---

### DR2-05: aria-busy Not Specified for Loading State
- **Severity**: GAP
- **Dimension**: Accessibility
- **Finding**: ArchitectureGuidelines section 7 explicitly requires `aria-busy="true"` on the swatch container while loading state is active. Architecture Section 6 mentions the loading state (spinner/skeleton) and disabled controls, but does not specify `aria-busy` on the swatch container element. Without this attribute, screen readers cannot signal to assistive technology users that content is in progress.
- **Agreed resolution**: Add `aria-busy="true"` to the swatch container element on page load; set to `aria-busy="false"` when the `ready` state is entered (after first chunk renders). Document in Section 6 accessibility spec.
- **Architecture change required**: YES

---

### DR2-06: prefers-reduced-motion Not Addressed
- **Severity**: GAP
- **Dimension**: Accessibility
- **Finding**: ArchitectureGuidelines section 7 requires honouring `prefers-reduced-motion` for any transitions. The architecture uses `styles.css` for all visual styling and describes a loading state (spinner/skeleton) and modal (open/close transition). Neither Section 6 nor the `styles.css` component description mentions `@media (prefers-reduced-motion: reduce)`.
- **Agreed resolution**: Add a `@media (prefers-reduced-motion: reduce)` block to `styles.css` that disables or shortens all CSS transitions and animations (modal, spinner). Document this in the `styles.css` component responsibility in Section 3 and in the Section 6 accessibility spec.
- **Architecture change required**: YES

---

### DR2-07: E2E Tests Not Included in CI Specification
- **Severity**: GAP
- **Dimension**: Testability & CI
- **Finding**: ArchitectureGuidelines section 9 defines two required CI jobs: `unit-tests` (`node ci/test-*.js`) and `e2e-tests` (`npx playwright test`). The architecture CI component currently specifies only `npm test` (unit tests). FR-12 requires "build and test jobs" on every PR. Without E2E in CI, AC-08 ("build-and-test jobs complete successfully") cannot be fully satisfied — Playwright tests would never run automatically.
- **Agreed resolution**: Update `.github/workflows/ci.yml` specification to define two jobs: `unit-tests` running `node ci/test-filter.js`, `node ci/test-colorUtils.js`, and `node ci/test-debounce.js`; and `e2e-tests` running `npx playwright test --project=chromium`. Node 20 LTS for both. Update component table and CI node in diagram.
- **Architecture change required**: YES

---

## Rejected Findings

None.

---

## Deferred Items

None.

---

## Agreed Design Decisions

Prior decisions from 2026-09-15 review remain in force:
- **DD-01**: Swatch list uses `role="listbox"` with roving `tabindex` (arrow keys, Enter opens modal, Escape closes).
- **DD-02**: `app.js` structured as ES module with named exports (`initApp`, `renderChunk`, `openModal`, `applyFilter`).
- **DD-03**: Chunked rendering uses a generation ID to cancel stale render loops on re-filter.
- **DD-04**: ~~App state machine: `loading → ready | error`~~ — **superseded by DD-07**.

New decisions agreed in this review:
- **DD-05**: Clipboard API failure renders DOM message `"Could not copy — please copy manually"` — rationale: EC-04 explicitly requires a visible fallback message; silent failure violates the acceptance criterion.
- **DD-06**: `debounce()` extracted to `lib/debounce.js` with `DEBOUNCE_MS = 150` constant — rationale: ArchitectureGuidelines mandate pure utilities in `lib/` and require 100% branch coverage; inline placement prevents independent testing.
- **DD-07**: App state machine simplified to `loading → ready` with an `offlineMode` boolean flag; no separate `error` state — rationale: NFR-07 guarantees the app is always functional via embedded fallback; the `error` state is architecturally unreachable; removing it prevents dead-code UI. Supersedes DD-04.
- **DD-08**: `aria-live "Showing N of T colors"` triggers on every filter operation — debounce resolution for search input AND immediately for dropdown selection — rationale: WCAG 2.1 AA SC 4.1.3 requires status messages for all result-set changes visible on screen.

---

## Architecture Changes Required

- [x] Update Section 5 sequence diagram: clipboard failure line — shows fallback message, not silent (DR2-01, DD-05)
- [x] Update Section 5 flow description step 11: specify fallback message on clipboard failure (DR2-01, DD-05)
- [x] Update component diagram: rename `Debounce` node to `lib/debounce.js` (DR2-02, DD-06)
- [x] Update component table: `debounce()` row → `lib/debounce.js` (DR2-02, DD-06)
- [x] Update app.js component table row: remove `lib/debounce.js` inline ref, fix state machine (DR2-02, DR2-03, DD-06, DD-07)
- [x] Add `ci/test-debounce.js` to component table (DR2-02, DD-06)
- [x] Update CI diagram node and add `tests/e2e/` node (DR2-07)
- [x] Update `.github/workflows/ci.yml` component table: two jobs (DR2-07)
- [x] Update Section 5 sequence diagram: add `aria-live` line after dropdown re-render (DR2-04, DD-08)
- [x] Update Section 5 flow description step 7: note `aria-live` fires on dropdown selection (DR2-04, DD-08)
- [x] Update Section 6 NFR accessibility row: aria-live trigger expanded; add aria-busy spec; add prefers-reduced-motion spec (DR2-04, DR2-05, DR2-06)
- [x] Update Section 3 styles.css row: add prefers-reduced-motion responsibility (DR2-06)
- [x] Append Revision History entry (all DR2-XX findings)
