import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("shows app title and tagline", async ({ page }) => {
    await expect(page.getByText("VERT", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Desktop", { exact: true })).toBeVisible();
  });

  test("shows category cards", async ({ page }) => {
    await expect(page.getByText("Images", { exact: true })).toBeVisible();
    await expect(page.getByText("Audio", { exact: true })).toBeVisible();
    await expect(page.getByText("Video", { exact: true })).toBeVisible();
    await expect(page.getByText("Documents", { exact: true })).toBeVisible();
  });

  test("shows file drop zone", async ({ page }) => {
    await expect(page.getByText("Drop files here")).toBeVisible();
  });

  test("navigation links are visible", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Settings" })).toBeVisible();
  });
});

test.describe("Settings page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/settings");
  });

  test("shows settings title", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  });

  test("shows appearance section", async ({ page }) => {
    await expect(page.getByText("Appearance")).toBeVisible();
    await expect(page.getByText("Theme")).toBeVisible();
    await expect(page.getByText("Language")).toBeVisible();
  });

  test("shows conversion section", async ({ page }) => {
    await expect(page.getByText("Conversion")).toBeVisible();
    await expect(page.getByText("Image quality")).toBeVisible();
  });

  test("can change theme to dark", async ({ page }) => {
    const select = page.locator("select").first();
    await select.selectOption("dark");
    await expect(page.locator("html")).toHaveClass(/dark/);
  });
});

test.describe("Navigation", () => {
  test("navigates between pages", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Settings" }).click();
    await expect(page).toHaveURL("/settings");
    await page.getByRole("link", { name: "Home" }).click();
    await expect(page).toHaveURL("/");
  });
});
