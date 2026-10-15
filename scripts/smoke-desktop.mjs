import { _electron as electron, expect } from "@playwright/test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
const executablePath = process.env.UNTANGLE_EXECUTABLE;
if (!executablePath)
  throw new Error("Set UNTANGLE_EXECUTABLE to the unpacked app.");
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
    page.getByRole("heading", { name: "Let’s untangle it." }),
  ).toBeVisible();
  expect(page.url()).toBe("untangle://app/");
  const security = await desktop.evaluate(({ BrowserWindow }) =>
    BrowserWindow.getAllWindows()[0].webContents.getLastWebPreferences(),
  );
  expect(security.nodeIntegration).toBe(false);
  expect(security.contextIsolation).toBe(true);
  expect(security.sandbox).toBe(true);
  expect(await page.evaluate(() => typeof window.require)).toBe("undefined");
  await page.getByLabel("What answer did you get?").fill("4/6");
  await page.getByRole("button", { name: "Explore my answer" }).click();
  await expect(
    page.getByRole("heading", { name: "Let’s look at your method." }),
  ).toBeVisible();
  await page.getByText("Show the reasoning", { exact: false }).click();
  await expect(
    page.getByRole("heading", { name: "What could explain these answers?" }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByText("1 answers explored")).toBeVisible();
  expect(await page.evaluate(() => typeof window.untangleAI.explain)).toBe(
    "function",
  );
  await page.getByRole("button", { name: "Local AI", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start local model" }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Knowledge library", exact: true })
    .click();
  await page
    .getByLabel("Import knowledge")
    .setInputFiles("tests/fixtures/learning.pdf");
  await expect(page.getByRole("status")).toContainText("learning.pdf");
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  const exportPath = path.join(temp, "session.json");
  await desktop.evaluate(({ session }, file) => {
    session.defaultSession.once("will-download", (_event, item) =>
      item.setSavePath(file),
    );
  }, exportPath);
  await page.getByRole("button", { name: /Export session/ }).click();
  let exported;
  for (let i = 0; i < 50; i++) {
    try {
      exported = JSON.parse(await readFile(exportPath, "utf8"));
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  expect(exported?.events?.[0]?.answer).toBe("4/6");
  expect(errors).toEqual([]);
  console.log(
    "Desktop smoke passed: native startup, isolation, diagnosis, PDF import, AI bridge, persistence and session export.",
  );
} finally {
  await desktop.close();
  await rm(temp, { recursive: true, force: true });
}
