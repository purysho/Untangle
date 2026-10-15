import { writeFileSync } from "node:fs";
import {
  allDomains,
  strategies,
  tasksFor,
  predict,
} from "../src/learning/domain.ts";
import { prior, nextTask, update, entropy } from "../src/learning/inference.ts";
const rows = [];
for (const domain of allDomains)
  for (const strategy of strategies(domain).filter((h) => h.id !== "guess")) {
    const run = (adaptive: boolean) => {
      let p = prior(domain);
      const seen: string[] = [];
      for (let i = 0; i < 8; i++) {
        const task = adaptive
          ? nextTask(domain, p, seen)!
          : tasksFor(domain)[i];
        seen.push(task.id);
        p = update(task, p, predict(task, strategy.id)!);
      }
      return {
        leading: Object.keys(p).sort((a, b) => p[b] - p[a])[0],
        targetWeight: p[strategy.id],
        entropyBits: entropy(p),
      };
    };
    rows.push({
      domain,
      strategy: strategy.id,
      adaptive: run(true),
      fixed: run(false),
    });
  }
const result = {
  protocol:
    "Eight responses from each of 40 synthetic fixed-strategy learners. Adaptive information-gain selection versus the first eight fixed generated questions. Same authored likelihood model for both. Not a human learning or calibrated diagnosis benchmark.",
  cases: rows.length,
  adaptiveRecovered: rows.filter((r) => r.adaptive.leading === r.strategy)
    .length,
  fixedRecovered: rows.filter((r) => r.fixed.leading === r.strategy).length,
  rows,
};
writeFileSync(
  "docs/learning/EVALUATION_RESULTS.json",
  JSON.stringify(result, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    cases: result.cases,
    adaptiveRecovered: result.adaptiveRecovered,
    fixedRecovered: result.fixedRecovered,
  }),
);
