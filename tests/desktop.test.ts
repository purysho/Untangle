import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveAsset, isAllowedExternal } from "../desktop/policy.cjs";
test("maps application origin to bundled files", () => {
  assert.equal(resolveAsset("untangle://app/"), "index.html");
  assert.equal(
    resolveAsset("untangle://app/assets/index-a.js"),
    "assets/index-a.js",
  );
});
test("rejects host changes, traversal, encoded separators and non-assets", () => {
  for (const url of [
    "https://app/index.html",
    "untangle://evil/index.html",
    "untangle://app/%2e%2e%2fpackage.json",
    "untangle://app/desktop/main.cjs",
    "untangle://app/assets/../../package.json",
    "untangle://app/assets/%5csecret.js",
  ])
    assert.equal(resolveAsset(url), null, url);
});
test("only source repository may open externally", () => {
  assert.equal(isAllowedExternal("https://github.com/purysho/Untangle"), true);
  for (const url of [
    "file:///etc/passwd",
    "https://github.com.evil/purysho/Untangle",
    "https://evil.com",
    "https://github.com/purysho/Untangle-malicious",
  ])
    assert.equal(isAllowedExternal(url), false, url);
});
