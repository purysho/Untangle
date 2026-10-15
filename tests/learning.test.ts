import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseTask,
  parseAnswer,
  predict,
  tasksFor,
  solution,
  strategies,
  allDomains,
} from "../src/learning/domain.ts";
import {
  prior,
  update,
  entropy,
  informationGain,
  nextTask,
  makeSession,
  record,
  replay,
} from "../src/learning/inference.ts";
test("original fraction example distinguishes answer from misconception", () => {
  const t = parseTask("fractions", "¾ + ½");
  assert.equal(predict(t, "correct"), "5/4");
  assert.equal(predict(t, "across"), "2/3");
  assert.equal(parseAnswer("4/6"), "2/3");
  assert.equal(parseAnswer("1.25"), "5/4");
});
test("invalid syntax and zero denominators cannot enter the engine", () => {
  for (const x of ["1/0 + 1/2", "2 ** 3", "<script>", "1/2 + 1/3 + 1/4"])
    assert.throws(() => parseTask("fractions", x));
  assert.throws(() => parseAnswer("Infinity"));
});
test("linear equation solutions satisfy substitution on unseen inputs", () => {
  for (let a = -7; a <= 7; a++) {
    if (!a) continue;
    for (let b = -4; b <= 4; b++) {
      const x = 5;
      const c = a * x + b;
      const t = parseTask(
        "algebra",
        `${a}x ${b < 0 ? "-" : "+"} ${Math.abs(b)} = ${c}`,
      );
      assert.equal(predict(t, "correct"), "5");
      assert.ok(solution(t).length >= 2);
    }
  }
});
test("coding module does not execute submitted code and checks bounded range sums", () => {
  for (let start = 1; start < 8; start++) {
    const stop = start + 5;
    const t = parseTask("coding", `sum(range(${start}, ${stop}))`);
    let sum = 0;
    for (let i = start; i < stop; i++) sum += i;
    assert.equal(predict(t, "correct"), String(sum));
  }
  assert.throws(() => parseTask("coding", "process.exit()"));
});
test("posterior remains normalized and one ambiguous answer retains alternatives", () => {
  const t = parseTask("fractions", "3/4 + 1/2");
  const p = update(t, prior(t.domain), "4/6");
  assert.ok(p.across > p.correct);
  assert.ok(p.guess > 0);
  assert.ok(Object.values(p).filter((x) => x > 0.01).length > 1);
  assert.ok(Math.abs(Object.values(p).reduce((a, b) => a + b, 0) - 1) < 1e-12);
});
test("question selection is deterministic, informative and does not repeat", () => {
  for (const domain of allDomains) {
    const p = prior(domain);
    const next = nextTask(domain, p, []);
    assert.ok(next);
    assert.ok(informationGain(next, p) > 0);
    assert.ok(entropy(p) > 0);
    assert.notEqual(nextTask(domain, p, [next.id])?.id, next.id);
    assert.equal(nextTask(domain, p, [])?.id, next.id);
  }
});
test("session export imports by replay, ignoring forged posterior and rejecting invalid events", () => {
  const t = parseTask("fractions", "3/4 + 1/2");
  const s = makeSession("fractions");
  s.events.push({ task: t, answer: "4/6" });
  const copy = replay(JSON.stringify({ ...s, posterior: { correct: 1 } }));
  assert.equal(
    copy.posterior.across,
    update(t, prior("fractions"), "4/6").across,
  );
  assert.throws(() =>
    replay(
      JSON.stringify({
        version: 1,
        domain: "fractions",
        events: [{ task: { input: "1/0 + 1/2" }, answer: "2" }],
      }),
    ),
  );
});
test("generated strategies are identifiable on synthetic held-out responses", () => {
  for (const domain of allDomains) {
    for (const h of strategies(domain).filter((h) => h.id !== "guess")) {
      let p = prior(domain);
      const seen: string[] = [];
      for (let i = 0; i < 8; i++) {
        const t = nextTask(domain, p, seen)!;
        seen.push(t.id);
        p = update(t, p, predict(t, h.id)!);
      }
      assert.ok(p[h.id] > 0.6, `${domain}/${h.id}: ${p[h.id]}`);
    }
  }
});
test("unseen fractions match independent cross-products", () => {
  for (let b = 13; b < 20; b++)
    for (let d = 17; d < 24; d++) {
      const t = parseTask("fractions", `7/${b} + 11/${d}`);
      const r = predict(t, "correct")!;
      const [n, den = 1] = r.split("/").map(Number);
      assert.equal(n * b * d, (7 * d + 11 * b) * den);
    }
  assert.ok(tasksFor("fractions").length > 30);
});
test("maths covers multiple branches with exact bounded adapters", () => {
  const cases = [
    ["arithmetic", "2 + 3 * 4", "14"],
    ["percentages", "20% of 80", "16"],
    ["geometry", "rectangle 4 x 7", "28"],
    ["statistics", "mean(2, 4, 9)", "5"],
    ["probability", "probability 2 of 8", "1/4"],
    ["calculus", "derivative 3x^2 at 2", "12"],
    ["vectors", "dot([1,2],[3,4])", "11"],
  ] as const;
  for (const [d, input, expected] of cases) {
    const t = parseTask(d, input);
    assert.equal(predict(t, "correct"), expected);
    assert.ok(nextTask(d, prior(d), []));
    assert.ok(solution(t).length >= 2);
  }
});
test("repeating the same task is not treated as independent evidence", () => {
  const t = parseTask("fractions", "3/4 + 1/2");
  const raw = makeSession("fractions");
  const s = record(raw, t, "4/6");
  assert.throws(() => record(s, t, "4/6"), /already/);
});
test("mixed Unicode fractions cannot silently concatenate whole-number digits", () => {
  assert.throws(() => parseTask("fractions", "1½ + 1/2"), /mixed/i);
  assert.throws(() => parseAnswer("1½"), /mixed/i);
  assert.throws(() => parseAnswer("1 ½"), /mixed/i);
});
