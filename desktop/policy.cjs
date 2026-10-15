const path = require("node:path");
function resolveAsset(value) {
  try {
    const url = new URL(value);
    if (
      url.protocol !== "untangle:" ||
      url.hostname !== "app" ||
      url.port ||
      url.username ||
      url.password
    )
      return null;
    const raw = decodeURIComponent(url.pathname);
    if (
      raw.includes("\\") ||
      raw.includes("\0") ||
      raw.split("/").includes("..")
    )
      return null;
    const relative = raw.replace(/^\//, "") || "index.html";
    if (relative === "index.html" || relative === "icon.png") return relative;
    if (
      /^assets\/[a-zA-Z0-9_.-]+\.(js|mjs|css|svg|png|woff2?|wasm)$/.test(
        relative,
      )
    )
      return relative;
    return null;
  } catch {
    return null;
  }
}
function isAllowedExternal(value) {
  return (
    value === "https://huggingface.co/Qwen/Qwen3-0.6B-GGUF" ||
    value === "https://github.com/ggml-org/llama.cpp" ||
    value === "https://github.com/purysho/Untangle" ||
    value === "https://github.com/purysho/Untangle/"
  );
}
module.exports = { resolveAsset, isAllowedExternal };
