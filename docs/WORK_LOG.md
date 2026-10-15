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

## 2026-10-15 — Learning rebuild v0.3.0

- Corrected the product scope back to the original learner-diagnosis concept. Preserved the writing checker as a secondary footer tool.
- Wrote learning brief, architecture/equations, build plan, discovery and evaluation contract before implementation.
- Implemented exact bounded domain adapters, Bayesian updates with residual hypotheses, expected-information-gain question selection, event replay and session transfer.
- User clarified mathematics is broader than fractions: implemented nine bounded maths packs plus coding and a wider retrieval-only mathematics map.
- Added friendly responsive interface, fraction bars, hypothesis graph, replay inspector, same-score synthetic demonstration, local passage retrieval and PDF/TXT/Markdown ingestion.
- Added optional managed llama-server/GGUF integration through sandboxed preload IPC, trusted main-frame validation, token-authenticated loopback transport, context/generation limits and process cleanup.
- Ran an actual Qwen3-0.6B-Q8_0 / llama.cpp b11658 trial. Initial outputs revealed truncation and an invented source reference. Disabled optional model thinking, adjusted budgets, restricted cited labels and rejected out-of-range citations. Final two-case raw output and host details are in docs/learning/LOCAL_AI_BENCHMARK.json. No general quality or target-PC speed claim follows from this trial; peak model RAM was not measured.
- Synthetic evaluation: adaptive selection recovered 40/40 authored strategy cases versus 39/40 with fixed generated questions, within the same authored model. This is not evidence of real-student efficacy.
- Independent review found PDF worker asset names with dots were denied, imported sessions restored an already-used task, and Unicode mixed numbers silently concatenated. Added regressions, observed failure, then fixed each. Added native PDF import to desktop smoke coverage.
- Added repeated-question protection to avoid counting the same task as independent evidence; subject progress is retained separately.
- Changed the existing mint interwoven mark to a U shape in the UI and generated PNG/ICO/ICNS assets, per user steering.
- Current local verification: 39 unit tests, six browser tests and strict production build pass. Desktop/mobile screenshots inspected for layout, text, colour, equation readability, navigation and overflow. New native release matrix verification follows.

### v0.3.0 native release verification

- Verified GitHub Actions run 38743751935 completed successfully on all four native runners: Windows x64, Linux x64, macOS Intel and macOS Apple Silicon. Each packaging job and its native app smoke test passed on the first attempt.
- Native checks cover startup, renderer isolation, learning diagnosis, bundled PDF worker/import, local-AI bridge availability, persistence and session export. Bridge availability does not establish model quality or inference performance on each OS.
- Separate CI run 38743752029 passed for released source commit 1e9879a514aee44ed15211bac5c5a5af6aa181f9.
- Confirmed v0.3.0 is published, with eight platform downloads and SHA256SUMS.txt: https://github.com/purysho/Untangle/releases/tag/v0.3.0.
- Optional inference requires a separately supplied compatible llama-server executable and GGUF model. Core diagnosis and local retrieval work without model weights. Builds remain unsigned; installer installation and Gatekeeper acceptance are outside native smoke-test coverage.

## 2026-10-15 — Explicit feedback and first-answer guidance (v0.3.1)

- Root cause: incorrect results used an indirect heading, and checked solutions were collapsed. New learners received uncertainty messaging without practical guidance.
- Added explicit correct/incorrect headings, first-answer common-mistake suggestions, cautious matching-method labels and an automatically open checked walkthrough after a first incorrect answer. Guidance is scoped to the current subject session and clears on follow-up.
- Browser regression reproduced missing incorrect feedback before the fix. Added coverage for unmatched wrong answers, guidance clearing, second answers and equivalent correct fractions; updated native smoke assertion.
- Local verification: 39 unit tests, strict TypeScript and production build passed. All eight browser tests passed using isolated browser workers; the alternate Chromium runtime cannot reuse browser contexts in this environment. Native release verification follows.

### v0.3.1 release outcome

- All eight browser checks and 39 unit tests passed, along with strict TypeScript and the production build. Inspected the first-wrong-answer screenshot for legibility, guidance, visible checked answer and open solution steps.
- The first remote release attempt failed during npm ci because the upload path truncated the lockfile. Restored the complete validated JSON from the preceding repository revision with only version fields changed. No dependency changes were intended.
- Verification CI run 38747780968 passed. Native release run 38747781139 passed Windows x64, Linux x64, Intel macOS and Apple Silicon macOS packaging and app smoke tests; publication completed successfully.
- Confirmed https://github.com/purysho/Untangle/releases/tag/v0.3.1 is published with eight platform downloads and SHA256SUMS.txt. Signing and installer acceptance limitations remain unchanged.

## 2026-10-15 — Integrated workspace design review

- User requested AI included in the app, easy RAG search, daily questions, a preloaded library and a WolframAlpha/Desmos-inspired workspace. Selected approximately 1–2 GB for the complete offline-AI download target.
- Read the requested cloner template README and workflow skill, current AI launcher, retrieval and packaging configuration, plus official product/model/resource-licensing references. Template supplies a UI reconstruction workflow, not proprietary computation engines.
- Proposed architecture saved in docs/superpowers/specs/2026-10-15-integrated-workspace-design.md. It specifies bundled runtime/weights, hybrid search, original starter corpus, in-app daily practice, checked calculation and restricted interactive graphing. Model size/performance and semantic retrieval remain to be measured, not completed claims.
- Design is awaiting user review before the detailed implementation plan. No v0.4 implementation or new installer shipped in this step.
