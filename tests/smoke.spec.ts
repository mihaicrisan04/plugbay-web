import { expect, test } from "@playwright/test";
import { routes } from "./routes";

for (const route of routes) {
  test(`${route} renders without errors or horizontal overflow`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") {
        errors.push(message.text());
      }
    });

    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("main")).toBeVisible();

    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(overflows).toBe(false);
    expect(errors).toEqual([]);
  });
}
