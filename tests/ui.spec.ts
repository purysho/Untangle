import { test, expect } from "@playwright/test";
test("source editing, evidence inspection, dependency selection and export", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page).toHaveTitle(/Untangle/);
  await expect(
    page.getByRole("heading", { name: "Clarity, before execution." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /Acceptance criteria are unclear/ })
    .first()
    .click();
  await expect(page.getByText("WHY IT WAS FLAGGED")).toBeVisible();
  const selected = await page
    .locator("#source")
    .evaluate((e: HTMLTextAreaElement) =>
      e.value.slice(e.selectionStart, e.selectionEnd),
    );
  expect(selected).toBe("as required");
  await page
    .locator("#source")
    .fill("1. Inspect the seal.\n2. After step 1, record the result.");
  await expect(page.getByText("Analysis needs an update")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Export analysis/ }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Analyse procedure" }).click();
  await expect(page.getByText("1 explicit dependencies")).toBeVisible();
  await page.getByLabel("Explicit only").check();
  await page.locator(".step-list button").last().click();
  await expect(
    page.getByRole("button", { name: "Clear step 2 ×" }),
  ).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Export analysis/ }).click();
  expect((await downloadPromise).suggestedFilename()).toBe(
    "untangle-analysis.json",
  );
  await page.reload();
  await expect(page.locator("#source")).toHaveValue(
    "1. Inspect the seal.\n2. After step 1, record the result.",
  );
  expect(errors).toEqual([]);
});
test("handles cycles, duplicate numbers and empty input", async ({ page }) => {
  await page.goto("/");
  await page.locator("#example").selectOption("2");
  await expect(
    page.getByRole("heading", { name: "Circular dependency" }).first(),
  ).toBeVisible();
  await page.locator("#source").fill("1. Open valve.\n1. Close valve.");
  await page.getByRole("button", { name: "Analyse procedure" }).click();
  await expect(page.getByRole("alert")).toContainText("Duplicate step");
  await page.locator("#source").fill("");
  await page.getByRole("button", { name: "Analyse procedure" }).click();
  await expect(
    page.getByRole("heading", { name: "Start with an instruction." }),
  ).toBeVisible();
});
test("mobile layout and untrusted source are safe", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page
    .locator("#source")
    .fill("1. <img src=x onerror=alert(1)> inspect it.");
  await page.getByRole("button", { name: "Analyse procedure" }).click();
  expect(await page.locator("img").count()).toBe(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "/tmp/untangle-mobile.png", fullPage: true });
});
test("desktop screenshot and storage-denied operation", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("denied");
      },
    });
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.getByRole("button", { name: "Analyse procedure" }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Analysed · browser storage unavailable",
  );
  await page.screenshot({ path: "/tmp/untangle-desktop.png", fullPage: true });
});
