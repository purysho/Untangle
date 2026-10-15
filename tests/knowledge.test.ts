import { test } from "node:test";
import assert from "node:assert/strict";
import {
  searchKnowledge,
  makePassages,
  builtins,
} from "../src/knowledge/retrieval.ts";
test("retrieves denominator explanation with preserved citation", () => {
  const hits = searchKnowledge(
    "adding fractions denominator equal parts",
    builtins,
  );
  assert.equal(hits[0].passage.id, "fractions-parts");
  assert.ok(hits[0].score > 0);
  assert.ok(hits[0].passage.source);
});
test("empty queries return no fabricated relevance", () =>
  assert.deepEqual(searchKnowledge("  ", builtins), []));
test("imported material stays inert and bounded", () => {
  const text = "Fractions use equal parts. <script>alert(1)</script>";
  const p = makePassages("notes.md", text);
  assert.ok(p[0].text.includes("<script>"));
  assert.equal(p[0].source, "notes.md");
  assert.throws(() => makePassages("x", "x".repeat(200001)), /200,000/);
});
