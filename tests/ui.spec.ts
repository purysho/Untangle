import { test, expect } from "@playwright/test";
test("original fraction scenario, adaptive question, inspector and export", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Let’s untangle it." }),
  ).toBeVisible();
  await page.locator("#problem").fill("¾ + ½");
  await page.getByLabel("What answer did you get?").fill("4/6");
  await page.getByRole("button", { name: "Explore my answer" }).click();
  await expect(
    page.getByRole("heading", { name: "That answer is incorrect." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Common mistakes to check" }),
  ).toBeVisible();
  await expect(
    page.getByText("This could produce your answer", { exact: false }),
  ).toBeVisible();
  await expect(page.locator(".worked-solution")).toHaveAttribute("open", "");
  await expect(
    page.getByText("Both fractions need equal-sized parts.", { exact: false }),
  ).toBeVisible();
  await page.getByText("Show the reasoning", { exact: false }).click();
  await expect(
    page.getByRole("heading", { name: "What could explain these answers?" }),
  ).toBeVisible();
  const old = await page.locator("#problem").inputValue();
  await page.getByRole("button", { name: "Try a useful follow-up" }).click();
  expect(await page.locator("#problem").inputValue()).not.toBe(old);
  await expect(page.getByLabel("What answer did you get?")).toHaveValue("");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export session" }).click();
  expect((await download).suggestedFilename()).toBe(
    "Untangle-learning-session.json",
  );
  await page.reload();
  await expect(page.getByText("1 answers explored")).toBeVisible();
  expect(errors).toEqual([]);
});
test("every maths topic and coding can run a real answer loop", async ({
  page,
}) => {
  await page.goto("/");
  const topics = [
    "arithmetic",
    "fractions",
    "percentages",
    "algebra",
    "geometry",
    "statistics",
    "probability",
    "calculus",
    "vectors",
  ];
  for (const topic of topics) {
    await page.locator("#maths-topic").selectOption(topic);
    await page.getByLabel("What answer did you get?").fill("2");
    await page.getByRole("button", { name: "Explore my answer" }).click();
    await expect(
      page.getByRole("button", { name: "Try a useful follow-up" }),
    ).toBeVisible();
  }
  await page.getByRole("button", { name: "Code tracing", exact: true }).click();
  await page.getByLabel("What answer did you get?").fill("10");
  await page.getByRole("button", { name: "Explore my answer" }).click();
  await expect(
    page.getByRole("heading", { name: "That answer is correct." }),
  ).toBeVisible();
});
test("local knowledge imports TXT and PDF and keeps content inert", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Knowledge library", exact: true })
    .click();
  await page.getByLabel("Import knowledge").setInputFiles({
    name: "my-notes.txt",
    mimeType: "text/plain",
    buffer: Buffer.from(
      "Zebra fractions use equal parts. <script>alert(1)</script>",
    ),
  });
  await expect(page.getByRole("status")).toContainText("Added");
  await page.getByLabel("Search your sources").fill("Zebra");
  await expect(page.getByText("my-notes.txt · passage 1")).toBeVisible();
  await expect(
    page.locator("script").filter({ hasText: "alert(1)" }),
  ).toHaveCount(0);
  await page
    .getByLabel("Import knowledge")
    .setInputFiles("tests/fixtures/learning.pdf");
  await expect(page.getByRole("status")).toContainText("learning.pdf");
  await page.getByLabel("Search your sources").fill("equivalent fractions");
  await expect(
    page.getByText("learning.pdf · page 1 · passage 1"),
  ).toBeVisible();
});
test("maths map, model-free settings and mobile layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Maths topics", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "A map of mathematics" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Calculus & analysis" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Local AI", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start local model" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await page.screenshot({
    path: "/tmp/untangle-learning-mobile.png",
    fullPage: true,
  });
});
test("desktop appearance, saved-session validation and unsupported input", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.locator("#problem").fill("1/0 + 1/2");
  await page.getByLabel("What answer did you get?").fill("3");
  await page.getByRole("button", { name: "Explore my answer" }).click();
  await expect(page.getByRole("alert")).toContainText("denominators");
  await page.getByRole("button", { name: "Start a fresh session" }).click();
  await page.screenshot({
    path: "/tmp/untangle-learning-desktop.png",
    fullPage: true,
  });
});
test("imported sessions continue with an unseen task and preserve evidence", async ({
  page,
}) => {
  await page.goto("/");
  const payload = {
    version: 1,
    domain: "fractions",
    events: [{ task: { input: "3/4 + 1/2" }, answer: "4/6" }],
  };
  await page.getByLabel("Import learning session").setInputFiles({
    name: "session.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(payload)),
  });
  await expect(page.getByText("1 answers explored")).toBeVisible();
  expect(await page.locator("#problem").inputValue()).not.toBe("3/4 + 1/2");
  await page.getByLabel("What answer did you get?").fill("1");
  await page.getByRole("button", { name: "Explore my answer" }).click();
  await expect(page.getByText("2 answers explored")).toBeVisible();
});

test("first wrong answer gets guidance without claiming a diagnosis", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("What answer did you get?").fill("99");
  await page.getByRole("button", { name: "Explore my answer" }).click();
  await expect(
    page.getByRole("heading", { name: "That answer is incorrect." }),
  ).toBeVisible();
  await expect(
    page.getByText("We don’t have earlier answers to compare yet.", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Common mistakes to check" }),
  ).toBeVisible();
  await expect(
    page.getByText("This could produce your answer", { exact: false }),
  ).toHaveCount(0);
  await expect(page.locator(".worked-solution ol li")).not.toHaveCount(0);
  await page.getByRole("button", { name: "Try a useful follow-up" }).click();
  await expect(
    page.getByRole("heading", { name: "Common mistakes to check" }),
  ).toHaveCount(0);
  await page.getByLabel("What answer did you get?").fill("99");
  await page.getByRole("button", { name: "Explore my answer" }).click();
  await expect(
    page.getByRole("heading", { name: "Common mistakes to check" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "That answer is incorrect." }),
  ).toBeVisible();
});
test("equivalent correct first answer receives no mistake walkthrough", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("What answer did you get?").fill("10/8");
  await page.getByRole("button", { name: "Explore my answer" }).click();
  await expect(
    page.getByRole("heading", { name: "That answer is correct." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Common mistakes to check" }),
  ).toHaveCount(0);
  await expect(page.locator(".worked-solution")).not.toHaveAttribute(
    "open",
    "",
  );
});
