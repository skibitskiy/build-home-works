// @ts-check
import { test, expect } from "@playwright/test";

const url = "http://localhost:3000";

test("page successfully rendered", async ({ page }) => {
  await page.goto(url);

  const bundleJsResponse = await fetch(`${url}/entry.js`);
  const bundleContent = await bundleJsResponse.text();

  expect(/(\s\s)+/.test(bundleContent)).toBeFalsy();
  expect(/\n/.test(bundleContent)).toBeFalsy();

  await page.waitForSelector('.test');
  const element = await page.locator(".test");
  await expect(element).toHaveText("hello world");
});
