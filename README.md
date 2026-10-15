# Untangle

**Clarity, before execution.** An inspectable technical-writing workbench that flags ambiguous language and visualises procedural dependencies.

Paste a numbered procedure, analyse it, and select a finding to reveal its exact source evidence and rationale. Follow explicit dependencies in the graph, identify missing steps and circular references, and export the full analysis as JSON.

## Run

Node.js 22.12+ (Node 24 recommended).

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. No API key or account is required. `npm run build` creates a static `dist/` directory that can be hosted on a static web server. The code does not send procedure text to a remote service. Analysed source is saved in browser local storage; this is not encrypted storage. Clearing browser storage removes it. JSON export preserves an analysis outside the browser.

## Try the demo

1. Load **Ambiguous procedure**. Select an acceptance-criteria finding to highlight its exact text and inspect the explanation.
2. Select a graph step to filter its findings. Use the text step list for keyboard access.
3. Load **Broken sequence** to see missing references and circular dependencies.
4. Edit the source. The previous graph and findings are hidden until you analyse again.
5. Export the current source, steps, flags, edges, and engine version as JSON.

## What the graph means

- **Solid mint edges:** an explicit `after step N` or `before step N` reference. The edge points from prerequisite to dependent step.
- **Dashed edges:** document order only. These do not assert a physical or safety prerequisite.
- **Conditional labels:** the text contains `if`, `unless`, `when`, or `until`. Conditions are retained as text; no executable branch is inferred.
- A textual edge list exposes the reason for each edge.

## Rule coverage and limits

The deterministic engine checks a small set of vague expressions, possible unclear pronouns, selected passive constructions, selected compound actions, modal verbs, and long lines. It does not use an LLM or infer engineering intent. Flags are review prompts and can be false positives. There is no automatic rewrite or invented technical value.

Use one step per nonempty line, optionally numbered `1.` or `1)`. Only the supported explicit reference forms are resolved; synonyms, ranges, references across multiple lines, and semantic component relationships are not inferred. Input is limited to 20,000 characters and 200 steps. Duplicate IDs are rejected. Free prose is split by line, not sentence. Decimal subsection references and negated timing clauses are flagged without drawing an explicit edge. Decimal subsection numbers are unsupported.

Inspired by controlled-language principles described by [ASD-STE100](https://www.asd-ste100.org/about_STE.html). This prototype is **not a complete STE checker, compliance certification, or aircraft-maintenance validator**. No official dictionary or standard text is redistributed. Example procedures are synthetic software demonstrations and must not be used as operational instructions.

## Engineering

React + Vite + strict TypeScript. A pure domain engine is isolated from the UI; SVG graph, findings, and exports share one analysis snapshot. Versioned browser storage is optional. No runtime CDN, font, or analytics dependency.

- [Architecture and build plan](docs/PLAN.md): diagrams, internal patterns, graph semantics, review focus.
- [Work log](docs/WORK_LOG.md): progress and verification evidence.

```sh
npm test          # domain tests
npm run typecheck # strict TypeScript
npm run build     # typecheck and production bundle
npx playwright install chromium
npm run test:ui   # browser workflow and responsive checks
```
