// @ts-check
import { test, expect } from "@playwright/test";

const url = "http://localhost:3000";

test("page rendered without error", async ({ page }) => {
  const consoleErrors = [];
  const consoleMessages = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }

    if (message.type() === "log") {
      consoleMessages.push(message.text());
    }
  });

  await page.goto(url);

  expect(consoleErrors).toEqual([]);
  expect(consoleMessages).toEqual(["11"]);
});
