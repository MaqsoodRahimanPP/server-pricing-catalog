import { test, expect } from "@playwright/test";

test.describe("CloudBlueprint Complete End-to-End User Journey", () => {
  test("Complete 17-step workflow: Founder Mode, 3 Tiers, Interactive Diagram, Save, Restore, and Export", async ({
    page
  }) => {
    // 1. Open CloudBlueprint
    await page.goto("http://localhost:5173");
    await expect(page).toHaveTitle(/CloudBlueprint/);
    await expect(page.getByText("CloudBlueprint", { exact: true })).toBeVisible();

    // 2. Start a new project / Reset
    await page.getByRole("button", { name: "New Project" }).click();

    // 3. Select Founder Mode
    await page.getByRole("button", { name: "Founder Mode" }).first().click();

    // 4. Fill project name & inputs
    const projectNameInput = page.getByPlaceholder("e.g. Acme SaaS Platform");
    await projectNameInput.fill("E2E Automated SaaS Suite");

    // 5. Click Generate Architecture
    const generateBtn = page.getByRole("button", { name: /generate architecture/i }).first();
    await generateBtn.click();

    // 6. Inspect 3 Recommendation Tiers
    await expect(page.getByText("Ultra-Budget", { exact: true })).toBeVisible();
    await expect(page.getByText("Balanced Value", { exact: true })).toBeVisible();
    await expect(page.getByText("Enterprise Scalability", { exact: true })).toBeVisible();

    // 7. Select Enterprise Scalability recommendation
    const selectEnterpriseBtn = page
      .locator("div")
      .filter({ hasText: /^Enterprise Scalability/ })
      .getByRole("button", { name: /select & render topology/i });

    if (await selectEnterpriseBtn.isVisible()) {
      await selectEnterpriseBtn.click();
    }

    // 8. Verify Architecture Diagram Canvas is rendered
    const diagramContainer = page.locator("#react-flow-diagram-container");
    await expect(diagramContainer).toBeVisible();

    // 9. Inspect a component node in the diagram
    const appNode = page.locator(".react-flow__node").filter({ hasText: /App/i }).first();
    if (await appNode.isVisible()) {
      await appNode.click();
      await expect(page.getByText("Component Inspector")).toBeVisible();

      // Modify subtitle
      const subtitleInput = page.locator('input[value*="node"]');
      if (await subtitleInput.isVisible()) {
        await subtitleInput.fill("4 node(s) · High Traffic Cluster");
      }
      await page.getByRole("button", { name: "Done" }).click();
    }

    // 10. Recalculate costs by moving to Cost Calculator
    await page.getByRole("button", { name: "Cost Calculator" }).first().click();
    await expect(page.getByText("Infrastructure Sizing Parameters")).toBeVisible();
    await expect(page.getByText("Estimated Infrastructure Monthly Spend")).toBeVisible();

    // Switch currency to EUR
    await page.getByRole("button", { name: "EUR" }).click();
    await expect(page.getByText("EUR", { exact: true })).toBeVisible();

    // Return to Designer
    await page.getByRole("button", { name: "Architecture Designer" }).first().click();

    // 11. Save Project to SQLite database
    const saveBtn = page.getByRole("button", { name: /save project/i });
    await saveBtn.click();
    await expect(page.getByText(/project saved to sqlite/i)).toBeVisible({ timeout: 5000 });

    // 12. Navigate away to Provider Catalog
    await page.getByRole("button", { name: "Provider Catalog" }).first().click();
    await expect(page.getByText("Provider Pricing & Intelligence Catalog")).toBeVisible();

    // Test Catalog Search and Filter
    const searchInput = page.getByPlaceholder("Search provider, strength, tier…");
    await searchInput.fill("Hetzner");
    await expect(page.getByText("Hetzner Cloud", { exact: true })).toBeVisible();

    // 13. Reopen the saved project in Saved Projects
    await page.getByRole("button", { name: /saved/i }).first().click();
    await expect(page.getByText("Saved Architecture Projects (SQLite)")).toBeVisible();
    await expect(page.getByRole("heading", { name: "E2E Automated SaaS Suite" })).toBeVisible();

    // 14. Click Restore & Edit
    const restoreBtn = page
      .locator("div")
      .filter({ hasText: "E2E Automated SaaS Suite" })
      .getByRole("button", { name: /restore & edit/i })
      .first();
    await restoreBtn.click();

    // Verify restored state in designer
    await expect(page.getByRole("heading", { name: "E2E Automated SaaS Suite" })).toBeVisible();

    // 15. Export Diagram & Cost Report
    const exportBtn = page.getByRole("button", { name: /export report & diagram/i });
    await exportBtn.click();

    await expect(page.getByText("Export Architecture & Cost Report")).toBeVisible();
    await expect(page.getByText("Markdown Report")).toBeVisible();

    // Switch to SVG export tab
    await page.getByRole("button", { name: /svg architecture vector/i }).click();
    await expect(page.getByText("Download SVG Vector File")).toBeVisible();

    // Close export modal
    await page.locator("button").filter({ has: page.locator("svg.lucide-x") }).last().click();

    // 16. Test DevOps Mode
    await page.getByRole("button", { name: "DevOps Mode" }).first().click();
    await expect(page.getByText("DevOps / System Designer Mode")).toBeVisible();

    // Check compliance gate
    const complianceCheckbox = page.getByRole("checkbox", { name: /compliance/i }).first();
    if (await complianceCheckbox.isVisible()) {
      await complianceCheckbox.check();
      const devopsSubmit = page.getByRole("button", { name: /regenerate devops topology/i });
      await devopsSubmit.click();
      // Ultra-budget should now be disqualified
      await expect(page.getByText("Disqualified by Constraints")).toBeVisible();
    }
  });

  test("Database Advisor and FinOps screens function correctly", async ({ page }) => {
    await page.goto("http://localhost:5173");

    // Navigate to Database Advisor
    await page.getByRole("button", { name: "Database Advisor" }).first().click();
    await expect(page.getByText("Database Architecture Advisor")).toBeVisible();
    await expect(page.getByText("AWS RDS PostgreSQL (Multi-AZ)")).toBeVisible();
    await expect(page.getByText("Neon Serverless Postgres")).toBeVisible();
    await expect(page.getByText("Supabase Managed Postgres")).toBeVisible();

    // Navigate to FinOps Advisor
    await page.getByRole("button", { name: "FinOps Advisor" }).first().click();
    await expect(page.getByText("FinOps & Cloud Security Advisor")).toBeVisible();
    await expect(page.getByText("Egress & CDN Optimization")).toBeVisible();
    await expect(page.getByText("Database Connection Pooling")).toBeVisible();
  });
});
