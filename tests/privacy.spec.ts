import { expect, test } from "@playwright/test";

const PRIVACY_URL = /\/privacy\/?$/;

const LIMITED_USE =
  "plugbay's use and transfer of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements.";

test("the home page links to the privacy policy", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Privacy policy" }).click();

  await expect(page).toHaveURL(PRIVACY_URL);
  await expect(
    page.getByRole("heading", { level: 1, name: "Privacy policy" })
  ).toBeVisible();
});

test("the privacy policy carries Google's Limited Use statement", async ({
  page,
}) => {
  await page.goto("/privacy");

  await expect(page.getByText(LIMITED_USE, { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Google API Services User Data Policy" })
  ).toHaveAttribute(
    "href",
    "https://developers.google.com/terms/api-services-user-data-policy"
  );
});
