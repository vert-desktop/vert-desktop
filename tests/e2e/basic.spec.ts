import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("shows app title and tagline", async ({ page }) => {
    await expect(page.locator("text=VERT")).toBeVisible();
    await expect(page.locator("text=Desktop")).toBeVisible();
  });

  test("shows category cards", async ({ page }) => {
    await expect(page.locator("text=Images")).toBeVisible();
    await expect(page.locator("text=Audio")).toBeVisible();
    await expect(page.locator("text=Video")).toBeVisible();
    await expect(page.locator("text=Documents")).toBeVisible();
  });

  test("shows file drop zone", async ({ page }) => {
    await expect(page.locator("text=Drop files here")).toBeVisible();
  });

  test("navigation links are visible", async ({ page }) => {
    await expect(page.locator("nav a[href='/']")).toBeVisible();
    await expect(page.locator("nav a[href='/settings']")).toBeVisible();
  });
});

test.describe("Settings page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/settings");
  });

  test("shows settings title", async ({ page }) => {
    await expect(page.locator("h1:has-text('Settings')")).toBeVisible();
  });

  test("shows appearance section", async ({ page }) => {
    await expect(page.locator("text=Appearance")).toBeVisible();
    await expect(page.locator("text=Theme")).toBeVisible();
    await expect(page.locator("text=Language")).toBeVisible();
  });

  test("shows conversion section", async ({ page }) => {
    await expect(page.locator("text=Conversion")).toBeVisible();
    await expect(page.locator("text=Image quality")).toBeVisible();
  });

  test("can change theme", async ({ page }) => {
    const select = page.locator("select").first();
    await select.selectOption("dark");
    await expect(page.locator("html")).toHaveClass(/dark/);
  });
});

test.describe("Navigation", () => {
  test("navigates between pages", async ({ page }) => {
    await page.goto("/");
    await page.click("a[href='/settings']");
    await expect(page).toHaveURL("/settings");
    await page.click("a[href='/']");
    await expect(page).toHaveURL("/");
  });
});
