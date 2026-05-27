import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/** Collect JS/console errors so we can assert the page is clean. */
function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  return errors;
}

test.describe("Prime Cane coming-soon", () => {
  test("loads the hero with headline, countdown and form — no console errors", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
      /Zimbabwe's sugar, refined from the ground up\./,
    );
    await expect(page.getByText("Sustainable Agricultural Solutions").first()).toBeVisible();

    // Countdown labels render
    for (const label of ["Days", "Hours", "Mins", "Secs"]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }

    await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
    await expect(page.getByRole("button", { name: "Notify me" })).toBeVisible();

    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("rejects an invalid email client-side", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("you@example.com").fill("not-an-email");
    await page.getByRole("button", { name: "Notify me" }).click();
    await expect(page.getByText("valid email address")).toBeVisible();
  });

  test("submits a valid email and shows success (API mocked)", async ({ page }) => {
    await page.route("**/api/subscribe", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: '{"status":"subscribed"}' }),
    );
    await page.goto("/");
    await page.getByPlaceholder("you@example.com").fill("jane@example.com");
    await page.getByRole("button", { name: "Notify me" }).click();
    await expect(page.getByText("You're on the list")).toBeVisible();
  });

  test("surfaces the duplicate state", async ({ page }) => {
    await page.route("**/api/subscribe", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: '{"status":"duplicate"}' }),
    );
    await page.goto("/");
    await page.getByPlaceholder("you@example.com").fill("jane@example.com");
    await page.getByRole("button", { name: "Notify me" }).click();
    await expect(page.getByText("already on the list")).toBeVisible();
  });

  test("has correct SEO metadata and structured data", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Prime Cane.*Coming Soon/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://primecane.com/");
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      "https://primecane.com/og-image.png",
    );
    const ld = await page.locator('script[type="application/ld+json"]').textContent();
    expect(ld).toContain('"@type": "Organization"');
    expect(ld).toContain("Chiredzi");
  });

  test("renders calmly under reduced motion", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await ctx.close();
  });

  test("has no critical/serious accessibility violations", async ({ page }) => {
    await page.goto("/");
    // let the preloader clear so the real content is scanned
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious, JSON.stringify(serious.map((v) => v.id), null, 2)).toEqual([]);
  });
});
