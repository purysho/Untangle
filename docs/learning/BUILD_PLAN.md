# Learning implementation plan

Execute inline under the user's instruction to build everything.

1. `src/learning/domain.ts`: exact rational arithmetic and bounded fractions/algebra/coding adapters. Tests cover wrong denominator addition, equivalent answers, negative equations, unsupported syntax and no code execution.
2. `src/learning/inference.ts`: hypothesis update, entropy, information gain, unique-question selection and replayable sessions. Tests cover normalization, ambiguous evidence, unseen generated inputs, residual responses and deterministic replay.
3. `src/knowledge/retrieval.ts` and `import.ts`: bundled source passages, ranked lexical retrieval and bounded TXT/Markdown/PDF import. Tests cover ranking, empty queries, hostile content as data and size limits.
4. `desktop/local-ai.cjs` and preload/main integration: user-selected runtime/model, safe lifecycle, trusted IPC, loopback-only generation and explicit failures. Unit-test request validation and prompt bounds. Verify model-free desktop launch and AI-unavailable behaviour. Real model quality remains a separate benchmark unless a runtime and model are actually run.
5. `src/App.tsx` and components: subject selection, problem/answer loop, visuals, exact solutions, inspector, knowledge library, session import/export and local-AI settings. Keep original writing tool in a secondary view.
6. Update browser and native smoke tests, rebuild desktop artifacts under v0.3.0. Publish only after native tests pass. Record work in `docs/WORK_LOG.md`.

Acceptance: original 3/4+1/2=4/6 scenario works; adaptive questions distinguish modelled strategies without a one-answer diagnosis; all ten bounded modules run; local source retrieval works without AI; sessions round-trip; native apps start and export; optional AI failures are visible and non-blocking.
