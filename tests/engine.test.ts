import { test } from "node:test";
import assert from "node:assert/strict";
import { analyse } from "../src/engine.ts";

test("flags vague language with exact source evidence", () => {
  const text = "1. Tighten the bolt as required.";
  const result = analyse(text);
  const flag = result.findings.find((f) => f.rule === "vague");
  assert.ok(flag);
  assert.equal(text.slice(flag.start, flag.end), "as required");
});
test("flags unclear pronouns and compound actions", () => {
  const r = analyse("1. Remove it and check the seal.");
  assert.ok(r.findings.some((f) => f.rule === "reference"));
  assert.ok(r.findings.some((f) => f.rule === "compound"));
});
test("detects passive wording", () =>
  assert.ok(
    analyse("1. The cover must be removed.").findings.some(
      (f) => f.rule === "passive",
    ),
  ));
test("explicit references are distinguishable from document order", () => {
  const r = analyse(
    "1. Isolate the supply.\n2. Remove the cover.\n3. After step 1, inspect the seal.",
  );
  assert.ok(
    r.edges.some(
      (e) => e.from === "1" && e.to === "3" && e.kind === "explicit",
    ),
  );
  assert.ok(
    r.edges.some((e) => e.from === "1" && e.to === "2" && e.kind === "order"),
  );
});
test("reports unresolved references", () =>
  assert.ok(
    analyse("1. After step 8, inspect the seal.").findings.some(
      (f) => f.rule === "missing-step",
    ),
  ));
test("detects cycles in explicit references", () =>
  assert.ok(
    analyse(
      "1. After step 2, remove the cover.\n2. After step 1, inspect the seal.",
    ).findings.some((f) => f.rule === "cycle"),
  ));
test("rejects duplicate IDs", () =>
  assert.throws(() => analyse("1. Open valve.\n1. Close valve."), /Duplicate/));
test("empty source gives empty snapshot", () =>
  assert.equal(analyse(" \n").steps.length, 0));
test("analysis is deterministic and retains hostile text as data", () => {
  const text = "1. <img src=x onerror=alert(1)> inspect it.";
  assert.deepEqual(analyse(text), analyse(text));
  assert.ok(analyse(text).steps[0].text.includes("<img"));
});
test("limits input size", () =>
  assert.throws(() => analyse("x".repeat(20001)), /20,000/));
test("retains conditional wording without inventing prerequisites", () => {
  const r = analyse("1. If the indicator is red, stop the test.");
  assert.equal(r.steps[0].conditional, true);
  assert.equal(r.edges.length, 0);
});
test("missing and self references are not silently accepted", () =>
  assert.ok(
    analyse("1. After step 1, inspect seal.").findings.some(
      (f) => f.rule === "cycle",
    ),
  ));
test("caps procedure nodes to keep graph and cycle work bounded", () =>
  assert.throws(
    () =>
      analyse(
        Array.from({ length: 201 }, (_, i) => `${i + 1}. Inspect seal.`).join(
          "\n",
        ),
      ),
    /200 steps/,
  ));
test("before references reverse dependency direction", () => {
  const r = analyse("1. Before step 2, inspect seal.\n2. Record result.");
  assert.ok(
    r.edges.some(
      (e) => e.from === "1" && e.to === "2" && e.kind === "explicit",
    ),
  );
});
test("source offsets survive CRLF and indentation", () => {
  const text = "  1. Inspect seal.\r\n  2. Tighten as required.\r\n";
  const r = analyse(text);
  const f = r.findings[0];
  assert.equal(text.slice(f.start, f.end), "as required");
});

test("negated timing is flagged rather than converted into a reversed prerequisite", () => {
  const r = analyse(
    "1. Do not open the valve before step 2.\n2. Isolate the supply.",
  );
  assert.equal(r.edges.filter((e) => e.kind === "explicit").length, 0);
  assert.ok(r.findings.some((f) => f.rule === "negated-dependency"));
});
test("decimal step references never partially resolve to integer steps", () => {
  const r = analyse("1. After step 2.1, inspect seal.\n2. Isolate supply.");
  assert.equal(r.edges.filter((e) => e.kind === "explicit").length, 0);
  assert.ok(r.findings.some((f) => f.rule === "unsupported-reference"));
});
