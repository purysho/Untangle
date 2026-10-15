# Untangle learning rebuild

The original product is a debugger for understanding. The technical-writing prototype was a scope error. Its code stays as a secondary tool; the main experience is a learner-friendly diagnostic tutor.

## Approved direction

User asks to build all of the proposed hybrid: exact checks, diagnostic inference, local knowledge retrieval, optional small offline AI and a simple interface. RAG supplies relevant evidence and explanations, not a new subject to diagnose.

## Scope expansion

User clarified maths includes the wider subject landscape, not only fractions. Added nine bounded maths adapters (arithmetic, fractions, percentages, algebra, rectangle geometry, mean, simple probability, power-rule differentiation, 2D dot products), plus coding. A broader topic map marks other areas as retrieval-only. User also requested a U-shaped interwoven logo.

## Complete loops

- Fractions: enter fraction addition, enter an answer, compare explanatory strategies, select the next diagnostic question, view fraction bars and an exact worked solution.
- Algebra: enter a bounded linear equation `ax + b = c`, compare inverse-operation strategies, ask a discriminating equation and show verified steps.
- Coding: safe Python-style range/accumulator trace questions, predict output, distinguish exclusive/inclusive bounds and accumulator mistakes. Never execute submitted code.
- Knowledge: search bundled explanations and imported TXT/Markdown/PDF text. Preserve source/page references and retrieve relevant passages locally.
- Optional local model: desktop file pickers for a llama-server executable and GGUF model, managed hidden process, loopback-only requests, bounded prompts and timeouts. No model is silently downloaded. A separately supplied pretrained model is required; no model is trained from scratch.

## Learner experience

A simple subject picker, a problem field, an answer field and one next step at a time. Explanations are visual and friendly. An optional reasoning inspector exposes model weights, prediction evidence, entropy and next-question information gain. Hypothesis weights are illustrative assumptions, not calibrated probabilities about a child.

## Boundaries

This is a bounded diagnostic prototype, not a general-purpose algebra solver or arbitrary code runner. Keep unsupported syntax explicit. Do not label a learner from one answer. Maintain a residual/guessing hypothesis and positive likelihoods. Prior task evidence is versioned and replayable. Export/import sessions for transfer. Offline core runs with no model or network. A local-model failure cannot block checks, retrieval or diagnosis.
