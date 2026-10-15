# Untangle

**A debugger for understanding.** Enter a problem and an answer. Untangle compares possible methods, asks a question that helps distinguish them, and offers a checked explanation with local supporting material.

[Download desktop apps for Windows, Linux and macOS](https://github.com/purysho/Untangle/releases/latest)

## Try the original demonstration

1. Choose **Fractions** and enter `¾ + ½`.
2. Answer `4/6`.
3. Choose **Try a useful follow-up**. The next problem is selected by expected information gain.
4. Open **Show the reasoning** to inspect competing strategies, their predictions, evidence replay and provisional weights.
5. Open **See the checked explanation** for exact arithmetic and fraction bars.

One answer is not a learner diagnosis. Several strategies can produce the same result. Model weights describe an authored model with explicit assumptions, not empirically calibrated probabilities about a child.

## Working diagnostic packs

| Area           | Current supported input | What is checked                                  |
| -------------- | ----------------------- | ------------------------------------------------ |
| Arithmetic     | `2 + 3 * 4`             | Multiplication before addition                   |
| Fractions      | `3/4 + 1/2` or `¾ + ½`  | Addition and equivalent numeric answers          |
| Percentages    | `20% of 80`             | Percentage of a positive number                  |
| Algebra        | `2x + 3 = 11`           | Bounded linear equations `ax + b = c`            |
| Geometry       | `rectangle 4 x 7`       | Rectangle area versus perimeter                  |
| Statistics     | `mean(2, 4, 9)`         | Mean versus median/range/sum                     |
| Probability    | `probability 2 of 8`    | Equally likely favourable outcomes / total       |
| Calculus       | `derivative 3x^2 at 2`  | Power-rule derivative evaluated at a point       |
| Linear algebra | `dot([1,2],[3,4])`      | Two-dimensional vector dot products              |
| Coding         | `sum(range(1, 5))`      | Bounded Python-style exclusive-stop accumulation |

These are real but bounded adapters, **not unrestricted maths or arbitrary code execution**. Input help and parser errors state supported forms. Unsupported mixed-number notation such as `1½` is rejected; use `3/2`. The wider **Maths topics** map includes advanced areas for source-library exploration. A retrieval-only area does not claim a working diagnostic solver.

## Local knowledge and RAG

The knowledge library searches bundled explanations and imported **PDF, TXT and Markdown** passages on the device. Retrieval uses a BM25-style lexical ranker: it is not embedding-based semantic search. Each passage keeps its source name and PDF page number.

PDF import is limited to 20 MB, 100 pages and 200,000 extracted characters. Scanned PDFs need OCR first. Imported text remains inert data. A source with the same filename replaces its previous passages. Imported-library storage is capped; browser storage can be unavailable or full and errors are shown.

When a local model is enabled, retrieved passages and the independently checked answer ground the explanation prompt. Generated prose is labelled, cannot change the calculation or hypothesis weights, and references to nonexistent source numbers are rejected. Valid source numbers alone do not establish that every generated claim is supported.

## Optional offline AI

Core learning, retrieval, checked solutions and diagnostics need **no model, account, cloud or API key**.

In the desktop app:

1. Obtain a trusted [llama.cpp](https://github.com/ggml-org/llama.cpp) build and keep its runtime files together.
2. Obtain a compatible GGUF instruction model whose licence permits your use. A tested small example is [Qwen3-0.6B-GGUF](https://huggingface.co/Qwen/Qwen3-0.6B-GGUF), Q8_0 (approximately 639 MB).
3. Open **Local AI → Start local model**. Pick `llama-server` / `llama-server.exe`, then the GGUF file.
4. Within an answer's supporting-material panel, choose **Explain with my local model**.

Untangle starts the selected process without a shell or visible terminal, bound to loopback with a per-launch API token. It uses a 4096-token context, bounded generation and timeouts. Stop it in settings or quit the app to stop it. Model files are **not included** in the installer. The first downloads require internet; inference thereafter is local. Performance and memory use depend on your computer and model.

A real two-case CPU trial of llama.cpp b11658 + Qwen3-0.6B-Q8_0 is recorded in [LOCAL_AI_BENCHMARK.json](docs/learning/LOCAL_AI_BENCHMARK.json). This is a small integration trial, not an explanation-quality benchmark. No foundation model was trained. Peak model RAM was not measured. Earlier trials exposed output truncation and invented citation numbers; generation settings and citation validation were tightened.

## Sessions and storage

Explored answers are saved locally after each accepted response. Subject sessions are kept separately; open/export JSON for transfers and backups. Import replays validated task/answer events instead of trusting supplied model weights. A question cannot count twice as independent evidence. A session is limited to 60 answers. Unsubmitted input edits are not saved. Browser and desktop profiles are separate. Storage is not encrypted.

The earlier technical-writing prototype remains a secondary **Technical writing tool**, reached from the footer. It is not the main product and does not claim ASD-STE100 compliance.

## Desktop downloads

| Platform            | Package                          |
| ------------------- | -------------------------------- |
| Windows x64         | Installer EXE or portable EXE    |
| Linux x64           | AppImage or Debian/Ubuntu `.deb` |
| Intel macOS         | DMG or ZIP                       |
| Apple Silicon macOS | DMG or ZIP                       |

Apps open in their own window without Node.js or a local web server. Initial releases are unsigned; macOS is not notarized, so the OS can show verification prompts. Follow your organisation's installation policy. AppImage may need FUSE and executable permission. Portable Windows builds keep data in the user profile, not beside the EXE.

## Development and verification

Node.js 22.12+; Node 24 recommended.

```sh
npm ci
npm run dev
npm test
npm run build
npm run evaluate
npx playwright install chromium
npm run test:ui
npm run desktop
npm run package -- --win --x64
npm run package -- --linux --x64
npm run package -- --mac --arm64
npm run package -- --mac --x64
```

Build on the target operating system; macOS requires macOS. `release/` contains generated packages. Desktop releases require a version bump and all four native build/smoke jobs to pass. Published version assets are not overwritten.

- [Learning brief](docs/learning/PROJECT_BRIEF.md), [architecture and equations](docs/learning/ARCHITECTURE.md), [build plan](docs/learning/BUILD_PLAN.md).
- [Discovery](docs/learning/DISCOVERY.md), [evaluation contract](docs/learning/EVALUATION.md), [synthetic results](docs/learning/EVALUATION_RESULTS.json).
- [Work log](docs/WORK_LOG.md), [desktop architecture](docs/DESKTOP_PLAN.md), [third-party notices](THIRD_PARTY_NOTICES.md).

The synthetic experiment compares adaptive selection with eight fixed generated questions for 40 authored strategy cases. It tests the model's own assumptions, not classroom effectiveness or real-learner diagnostic accuracy.
