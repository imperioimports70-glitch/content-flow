import { test, expect } from "@playwright/test";

test.describe("Smoke", () => {
  test("landing carrega", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/ContentFlow\.ai/i).first()).toBeVisible();
  });

  test("página de login carrega", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.getByRole("heading", { name: /Entrar/i })).toBeVisible();
  });

  test("página de registro carrega", async ({ page }) => {
    await page.goto("/auth/register");
    await expect(page.getByRole("heading", { name: /Criar sua conta/i })).toBeVisible();
  });
});
