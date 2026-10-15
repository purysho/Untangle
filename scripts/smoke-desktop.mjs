import { _electron as electron, expect } from "@playwright/test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
const executablePath = process.env.UNTANGLE_EXECUTABLE;
if (!executablePath)
  throw new Error(
    "Set UNTANGLE_EXECUTABLE to the unpacked application executable.",
  );
const temp = await mkdtemp(path.join(tmpdir(), "untangle-smoke-"));
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;
const desktop = await electron.launch({
  executablePath: path.resolve(executablePath),
  args: ["--user-data-dir=" + path.join(temp, "profile")],
  env,
  timeout: 30000,
});
try {
  const page = await desktop.firstWindow();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await expect(
    page.getByRole("heading", { name: "Clarity, before execution." }),
  ).toBeVisible();
  expect(page.url()).toBe("untangle://app/");
  const security = await desktop.evaluate(({ BrowserWindow }) =>
    BrowserWindow.getAllWindows()[0].webContents.getLastWebPreferences(),
  );
  expect(security.nodeIntegration).toBe(false);
  expect(security.contextIsolation).toBe(true);
  expect(security.sandbox).toBe(true);
  expect(await page.evaluate(() => typeof window.require)).toBe("undefined");
  await page
    .locator("#source")
    .fill(
      "1. Inspect the seal as required.\n2. After step 1, record the result.",
    );
  await page.getByRole("button", { name: "Analyse procedure" }).click();
  await expect(page.getByText("1 explicit dependencies")).toBeVisible();
  await page
    .getByRole("button", { name: /Acceptance criteria are unclear/ })
    .first()
    .click();
  await expect(page.getByText("WHY IT WAS FLAGGED")).toBeVisible();
  await page.reload();
  expect(await page.locator("#source").inputValue()).toContain(
    "Inspect the seal as required.",
  );
  const exportPath = path.join(temp, "analysis.json");
  await desktop.evaluate(({ session }, file) => {
    session.defaultSession.once("will-download", (_event, item) =>
      item.setSavePath(file),
    );
  }, exportPath);
  await page.getByRole("button", { name: /Export analysis/ }).click();
  let exported;
  for (let i = 0; i < 50; i++) {
    try {
      exported = JSON.parse(await readFile(exportPath, "utf8"));
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  expect(exported?.source).toContain("Inspect the seal as required.");
  expect(errors).toEqual([]);
  console.log(
    "Desktop smoke passed: native startup, bundled protocol, isolation, analysis, persistence and JSON export.",
  );
} finally {
  await desktop.close();
  await rm(temp, { recursive: true, force: true });
}
