# Discovery record — 2026-10-15

## Scope and access

Reviewed the existing Untangle implementation and tests, the supplied LightLLM/billion-context/cocoindex-code READMEs through GitHub, and official llama.cpp/AirLLM documentation. No target-PC local-model performance has been measured. Repository review is limited to these components, not a portfolio-wide audit.

## Evidence ledger

| Source                                                            | Access/evidence                         | Relevance and decision                                              | Rights/maintenance/reproduction                                                                  |
| ----------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| https://github.com/ModelTC/lightllm                               | README and official install docs opened | GPU serving; defer for desktop                                      | README states Apache-2.0; dependency terms not audited; runtime not reproduced                   |
| https://github.com/ranxianglei/billion-context                    | README inspected                        | Conversation compression, not retrieval/model; defer                | Licence not independently audited; performance claims not reproduced                             |
| https://github.com/cocoindex-io/cocoindex-code                    | README inspected                        | AST code retrieval; possible future coding retrieval adapter        | README states Apache-2.0; full Python embedding dependencies too heavy for default pack; not run |
| https://github.com/lyogavin/airllm                                | Official README opened                  | Layer streaming trades VRAM for disk traffic; defer                 | Repo identifies Apache-2.0; model rights separate; no speed benchmark run                        |
| https://github.com/ggml-org/llama.cpp                             | Official README opened                  | Quantized local inference across CPU/GPU backends; optional adapter | Repo identifies MIT; selected model terms remain user's choice; no model benchmark run           |
| https://www.wolframalpha.com/examples/mathematics/elementary-math | Official examples opened                | Reference for approachable input and maths visuals                  | No code/content imported; vendor examples, not an adopted engine                                 |

## Decision

Build a deterministic local diagnostic core plus local lexical retrieval first, with optional llama-server/GGUF integration. RAG and inference complement one another. Do not train a foundation model or bundle a large Python stack. Model selection remains conditional on speed, RAM, rights and explanation quality tests. Core functionality must survive an unavailable model.

## First experiment

Compare correct checks and diagnostic selection against static questions over generated strategy-labelled sessions. Separately compare exact authored explanations against local-model explanations on the same held-out questions, recording arithmetic corruption, source support, latency and peak RAM. Synthetic strategy recovery is not proof of classroom efficacy.
