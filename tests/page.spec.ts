import { expect, type Page, test } from "@playwright/test";
import { install, resolved } from "../src/data/plugbay";

const [acme, globex] = resolved;

// A setting's dimension is drawn solid when it applies to the directory on
// show. Both directories pin sentry, each to its own account.
const solidLine = (page: Page, account: string) =>
  page
    .locator(".elevation .dim")
    .filter({ hasText: `sentry = "${account}"` })
    .locator(".dim-solid");

const choice = (page: Page, directory: string) =>
  page.getByRole("radio", { name: directory });

async function startAgentIn(page: Page, directory: string) {
  await page
    .getByRole("group", { name: "Agent starts in" })
    .getByText(directory)
    .click();
}

async function expectElevationFor(page: Page, on: string, off: string) {
  await expect(solidLine(page, on)).toHaveCSS("opacity", "1");
  await expect(solidLine(page, off)).toHaveCSS("opacity", "0");
}

test("choosing ~/work/globex/web redraws the elevation for it", async ({
  page,
}) => {
  await page.goto("/");
  await expect(choice(page, acme.directory)).toBeChecked();
  await expectElevationFor(page, "acme", "globex");

  await startAgentIn(page, globex.directory);

  await expect(choice(page, globex.directory)).toBeChecked();
  await expectElevationFor(page, "globex", "acme");
});

test("a directory row of the elevation chooses that directory", async ({
  page,
}) => {
  await page.goto("/");

  await page.locator(".elevation .row-leaf.is-b").click();

  await expect(choice(page, globex.directory)).toBeChecked();
  await expectElevationFor(page, "globex", "acme");
});

test("the arrow keys switch the directory", async ({ page }) => {
  await page.goto("/");
  await choice(page, acme.directory).focus();

  await page.keyboard.press("ArrowRight");

  await expect(choice(page, globex.directory)).toBeChecked();
  await expectElevationFor(page, "globex", "acme");
});

test("every copy button copies its command", async ({ context, page }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  const buttons = page.locator("[data-copy]");
  await expect(buttons).toHaveCount(3);

  async function expectCopies(index: number, command: string) {
    await page.evaluate(() => navigator.clipboard.writeText(""));
    await buttons.nth(index).click();
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toBe(command);
  }

  await expectCopies(0, install.brew);
  await expectCopies(1, install.brew);
  await expectCopies(2, install.cargo);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the directory choice still redraws the elevation", async ({ page }) => {
    await page.goto("/");
    await expectElevationFor(page, "acme", "globex");

    await startAgentIn(page, globex.directory);

    await expectElevationFor(page, "globex", "acme");
  });
});
