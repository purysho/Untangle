import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validatePrompt,
  validateGenerated,
  buildPrompt,
  isTrustedSender,
} from "../desktop/ai-policy.cjs";
test("AI prompt is bounded and exact answer is supplied separately", () => {
  const p = validatePrompt({
    problem: "3/4 + 1/2",
    answer: "4/6",
    verified: "5/4",
    evidence: [{ source: "notes", text: "Use equal parts." }],
  });
  const text = buildPrompt(p);
  assert.ok(text.includes("5/4"));
  assert.ok(text.includes("untrusted"));
  assert.throws(() => validatePrompt({ problem: "x".repeat(20000) }));
});
test("IPC accepts only the app main frame", () => {
  assert.equal(isTrustedSender("untangle://app/", true, true), true);
  assert.equal(isTrustedSender("https://evil.com/", true, true), false);
  assert.equal(isTrustedSender("untangle://app/", false, true), false);
  assert.equal(isTrustedSender("untangle://app/", true, false), false);
});
test("generated citations cannot point to sources not retrieved", () => {
  assert.throws(
    () => validateGenerated("The result is 5/4 [2].", 1),
    /source/i,
  );
  assert.equal(
    validateGenerated("The result is 5/4 [1].", 1),
    "The result is 5/4 [1].",
  );
});
