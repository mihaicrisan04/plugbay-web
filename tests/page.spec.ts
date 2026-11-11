import { expect, type Page, test } from "@playwright/test";
import { install, resolved } from "../src/data/plugbay";

const globexLinearOff = /linear\s+by ~\/work\/globex\/plugbay\.toml/;
const acmeSentryRow = /sentry:acme\s+http/;

async function startAgentInGlobex(page: Page) {
  await page
    .getByRole("group", { name: "Agent starts in" })
    .getByText(resolved[1].directory)
    .click();
}

test("choosing ~/work/globex/web swaps the terminal output", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByText(acmeSentryRow)).toBeVisible();

  await startAgentInGlobex(page);

  await expect(page.getByText(globexLinearOff)).toBeVisible();
  await expect(page.getByText(acmeSentryRow)).toBeHidden();
});

test("the first copy button copies the brew command", async ({
  context,
  page,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");

  await page.locator("[data-copy]").first().click();

  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toBe(install.brew);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the directory choice still works", async ({ page }) => {
    await page.goto("/");

    await startAgentInGlobex(page);

    await expect(page.getByText(globexLinearOff)).toBeVisible();
  });
});
