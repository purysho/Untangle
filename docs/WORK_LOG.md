# Untangle work log

## 2026-10-15 — Initial build

- Confirmed the repository was empty and retrieved the user's aerospace/ASD-STE100 reference context. Prior aerospace discussion was unavailable; the user clarified ambiguity flags and procedural dependencies.
- Wrote and committed `docs/PLAN.md` before product implementation, including dependency semantics, architecture diagrams and internal design patterns.
- Implemented pure TypeScript analysis, explicit reference resolution, missing-step flags, cycle detection, source offsets and bounded input.
- Domain tests first failed for missing engine; after implementation 12 tests passed. Added a step-count regression test, observed its failure, applied the 200-step bound, then all 15 passed.
- Built React workbench with editable samples, source-linked findings, severity filter, SVG map with textual keyboard-accessible alternatives, explicit/order distinction, stale-state handling, optional local storage and JSON export.
- Strict TypeScript and production build passed. Removed an empty CSS import identified by the first build.
- Browser plugin is not available. Playwright fallback selected. Standard Chromium download was truncated by the environment; checking an alternate Chromium runtime.
- Added CI for tests, production build and browser tests.

## Decisions

- Local-first modular application instead of distributed backend: the initial workflow has no server-side requirement.
- Technical-document analysis is the interpreted scope of the user's clarification. This build does not contain the earlier fractions-learning concept.
- Regex findings are explicitly described as heuristics, not official standard enforcement. Explicit dependencies carry source evidence; order edges carry an uncertainty label.
- Maximum 200 steps keeps graph rendering and explicit cycle search bounded.

## Final verification

- Independent code review found two important parser issues: negated timing could reverse the intended sequence, and decimal step references could partially resolve to an integer ID.
- Wrote regressions, observed both fail, then changed the parser to flag those cases and omit their explicit edges. Final domain suite: **17/17 passed**.
- Browser validation used Playwright with an alternate Chromium 153 binary because the standard download was truncated. The serverless binary needs a fresh browser per test; running four isolated workers passed **4/4 browser tests**. The CI path retains standard Playwright Chromium.
- Verified workflow: source evidence selection, stale-state gating, dependency selection and filter, JSON download, persistence on reload, missing references/cycles, duplicate IDs, empty state, inert HTML-like source, mobile width and denied storage.
- Inspected desktop (1440 × 1000 viewport) and mobile (390 × 844 viewport) full-page screenshots. Checked three-panel/stacked layout, typography, mint/orange semantics, editor readability, graph edges, and mobile overflow. No raster concept was used; all UI and graph artwork is code-native.
- Strict TypeScript, production Vite build, and `git diff --check` passed. Production dependency audit: **0 vulnerabilities**.
- Remaining limitations: heuristic rules and limited reference grammar; no complete STE grammar/dictionary, no technical correctness proof, no executable branch modelling. Source is saved only when analysed.

## 2026-10-15 — Desktop packaging

- Added Electron with a bundled custom protocol, sandboxed renderer, context isolation, disabled Node integration, denied permissions and restricted external navigation.
- Added native Save As for JSON exports, single-instance focus, platform menus and existing-logo desktop icons in PNG, ICO and ICNS formats.
- Configured Windows installer/portable EXE, Linux AppImage/deb and macOS Intel/Apple Silicon DMG/ZIP builds.
- Added native-runner release matrix, packaged-app smoke tests and checksum generation. Publication waits for all platform builds and smoke tests.
- Desktop URL-policy tests observed failing before implementation; domain and policy suite now passes 20/20. Production build and local Linux unpacked packaging succeeded.
- Signing/notarization credentials are not supplied; builds are explicitly documented as unsigned.
- Packaging code review found a release-integrity issue: reusing a version could overwrite published downloads while preserving an older tag. Fixed publication to leave published releases untouched; only drafts can be retried. New release content requires a version bump.

### Native release verification

- GitHub Actions built Windows x64 installer + portable EXE, Linux x64 AppImage + deb, macOS x64 DMG + ZIP, and macOS arm64 DMG + ZIP.
- Each of the four native runners passed the packaged-app smoke test: startup, bundled custom origin, sandbox/context isolation, absent renderer Node access, live analysis, saved text on reload and actual JSON export.
- Intel macOS initially failed while detaching the temporary DMG volume (`hdiutil: Resource busy`). Retried only the failed job on a fresh runner without changing source; its build and smoke test passed. Windows, Linux and arm64 macOS succeeded on the first attempt.
- Release workflow: https://github.com/purysho/Untangle/actions/runs/38732455121 (attempt 2). Installer installation and macOS Gatekeeper/notarization acceptance remain outside automated coverage.
