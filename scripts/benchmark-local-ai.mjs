import { createRequire } from "node:module";
import { writeFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import os from "node:os";
const require = createRequire(import.meta.url);
const service = require("../desktop/local-ai.cjs");
if (!process.env.LLAMA_SERVER || !process.env.GGUF_MODEL)
  throw new Error("Set LLAMA_SERVER and GGUF_MODEL to trusted local files.");
let call = 0;
const dialog = {
  showOpenDialog: async () => ({
    canceled: false,
    filePaths: [
      call++ === 0 ? process.env.LLAMA_SERVER : process.env.GGUF_MODEL,
    ],
  }),
};
const cases = [
  {
    problem: "3/4 + 1/2",
    answer: "4/6",
    verified: "5/4",
    evidence: [
      {
        source: "Untangle fractions note",
        text: "Use equivalent fractions with equal-sized parts: 1/2 = 2/4. Add 3/4 + 2/4 to get 5/4. Keep the shared denominator.",
      },
    ],
  },
  {
    problem: "20% of 80",
    answer: "100",
    verified: "16",
    evidence: [
      {
        source: "Untangle percentages note",
        text: "Percent means out of 100. Multiply 20 by 80 and divide by 100: the result is 16.",
      },
    ],
  },
];
const report = {
  runtime: "llama.cpp b11658",
  model: "Qwen3-0.6B-Q8_0",
  cpu: os.cpus()[0]?.model,
  cpuCount: os.cpus().length,
  totalMemoryBytes: os.totalmem(),
  observedAt: new Date().toISOString(),
  cases: [],
};
try {
  const started = performance.now();
  await service.start(dialog, null);
  report.startupMs = Math.round(performance.now() - started);
  for (const request of cases) {
    const t = performance.now();
    try {
      const output = await service.explain(request);
      report.cases.push({
        request,
        latencyMs: Math.round(performance.now() - t),
        output,
        mentionsVerified: output.includes(request.verified),
        containsCitation: /\[1\]/.test(output),
      });
    } catch (e) {
      report.cases.push({ request, error: String(e) });
    }
  }
  await writeFile(
    process.env.BENCHMARK_OUT ?? "/tmp/untangle-model-benchmark/report.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  service.stop();
}
