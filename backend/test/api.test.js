"use strict";

const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");
const http = require("node:http");

process.env.NODE_ENV = "test";
process.env.ADMIN_API_KEY = "test-secret-admin-key";
process.env.PORT = "3199";

const app = require("../server");
let server;
const BASE_URL = "http://localhost:3199";

before((_, done) => {
  server = app.listen(3199, done);
});

after((_, done) => {
  server.close(done);
});

describe("CloudBlueprint Backend API Integration", () => {
  test("GET /api/health returns ok status and connected database", async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, "ok");
    assert.strictEqual(data.database, "connected");
  });

  test("GET /api/providers returns provider plans and enriched catalog with filtering", async () => {
    const resAll = await fetch(`${BASE_URL}/api/providers`);
    assert.strictEqual(resAll.status, 200);
    const dataAll = await resAll.json();
    assert.ok(dataAll.providers.length > 0);
    assert.ok(dataAll.count > 0);

    // Filter by category = vps
    const resVps = await fetch(`${BASE_URL}/api/providers?category=vps`);
    const dataVps = await resVps.json();
    for (const p of dataVps.providers) {
      assert.strictEqual(p.category, "vps");
    }

    // Filter by maxPrice = 10
    const resBudget = await fetch(`${BASE_URL}/api/providers?maxPrice=10`);
    const dataBudget = await resBudget.json();
    for (const p of dataBudget.providers) {
      assert.ok(p.startingPrice <= 10);
    }
  });

  test("GET /api/providers/:id returns full specs and 404 on missing", async () => {
    const resAws = await fetch(`${BASE_URL}/api/providers/aws`);
    assert.strictEqual(resAws.status, 200);
    const dataAws = await resAws.json();
    assert.strictEqual(dataAws.data.id, "aws");
    assert.strictEqual(dataAws.data.name, "Amazon Web Services");

    const resMissing = await fetch(`${BASE_URL}/api/providers/non-existent-cloud`);
    assert.strictEqual(resMissing.status, 404);
  });

  test("POST /api/recommendations returns 3 tiers with hard constraints", async () => {
    // Standard SaaS
    const resStd = await fetch(`${BASE_URL}/api/recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectType: "saas", users: 10000, compliance: false })
    });
    assert.strictEqual(resStd.status, 200);
    const dataStd = await resStd.json();
    assert.strictEqual(dataStd.data.tiers.length, 3);
    assert.strictEqual(dataStd.data.bestFitTierId, "balanced");

    // Compliance = true -> requires enterprise
    const resComp = await fetch(`${BASE_URL}/api/recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectType: "saas", users: 10000, compliance: true })
    });
    const dataComp = await resComp.json();
    assert.strictEqual(dataComp.data.bestFitTierId, "enterprise");
  });

  test("POST /api/architecture/generate returns React Flow nodes and security boundaries", async () => {
    const res = await fetch(`${BASE_URL}/api/architecture/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requirements: { projectType: "saas", users: 50000, nodes: 2, db: "postgres" },
        selectedTier: "balanced"
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.data.nodes.length >= 7);
    assert.ok(data.data.edges.length >= 6);
    assert.strictEqual(data.data.boundaries.length, 3);
  });

  test("POST /api/costs/calculate returns multi-currency and scenario breakdown", async () => {
    const res = await fetch(`${BASE_URL}/api/costs/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        providerId: "aws",
        instances: 2,
        storageGB: 100,
        dataTransferGB: 1000,
        currency: "USD"
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.data.totalMonthlyUSD > 0);
    assert.strictEqual(data.data.currency, "USD");
    assert.ok(data.data.scenarios.lowUSD < data.data.scenarios.expectedUSD);
    assert.ok(data.data.scenarios.highUSD > data.data.scenarios.expectedUSD);
  });

  test("Projects CRUD: POST, GET, GET/:id, PUT/:id, DELETE/:id", async () => {
    // 1. Create project
    const createRes = await fetch(`${BASE_URL}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "E2E Test Architecture",
        description: "Created in automated test",
        mode: "founder",
        requirements: { users: 20000, projectType: "saas" },
        selectedTier: "balanced",
        architecture: { nodes: [] },
        costEstimate: { totalMonthlyUSD: 85 }
      })
    });
    assert.strictEqual(createRes.status, 201);
    const created = await createRes.json();
    const projectId = created.data.id;
    assert.ok(projectId > 0);

    // 2. Read single project
    const getRes = await fetch(`${BASE_URL}/api/projects/${projectId}`);
    assert.strictEqual(getRes.status, 200);
    const fetched = await getRes.json();
    assert.strictEqual(fetched.data.name, "E2E Test Architecture");
    assert.strictEqual(fetched.data.requirements.users, 20000);

    // 3. Update project
    const updateRes = await fetch(`${BASE_URL}/api/projects/${projectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Updated Architecture Title",
        description: "Updated description",
        mode: "devops",
        requirements: { users: 30000, projectType: "ecommerce" },
        selectedTier: "enterprise",
        architecture: { nodes: [] },
        costEstimate: { totalMonthlyUSD: 240 }
      })
    });
    assert.strictEqual(updateRes.status, 200);

    // 4. Verify updated project
    const verifyRes = await fetch(`${BASE_URL}/api/projects/${projectId}`);
    const verified = await verifyRes.json();
    assert.strictEqual(verified.data.name, "Updated Architecture Title");
    assert.strictEqual(verified.data.selectedTier, "enterprise");

    // 5. Delete project
    const deleteRes = await fetch(`${BASE_URL}/api/projects/${projectId}`, {
      method: "DELETE"
    });
    assert.strictEqual(deleteRes.status, 200);

    // 6. Verify 404 after deletion
    const checkDeletedRes = await fetch(`${BASE_URL}/api/projects/${projectId}`);
    assert.strictEqual(checkDeletedRes.status, 404);
  });

  test("Legacy estimates endpoint preserves backward compatibility", async () => {
    const listRes = await fetch(`${BASE_URL}/api/estimates`);
    assert.strictEqual(listRes.status, 200);
    const listData = await listRes.json();
    assert.ok(Array.isArray(listData.estimates));
    assert.ok(listData.estimates.length >= 1); // Preserves existing "Test SaaS" record!

    const postRes = await fetch(`${BASE_URL}/api/estimates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectName: "Legacy Estimate Test",
        monthlyCompute: 50,
        monthlyStorage: 10,
        monthlyNetwork: 15
      })
    });
    assert.strictEqual(postRes.status, 201);
    const postData = await postRes.json();
    assert.strictEqual(postData.result.monthlyTotal, 75);
  });

  test("Admin endpoints require x-admin-key and timingSafeEqual", async () => {
    // Without key -> 401
    const unauthRes = await fetch(`${BASE_URL}/api/admin/audit`);
    assert.strictEqual(unauthRes.status, 401);

    // With invalid key -> 403
    const badKeyRes = await fetch(`${BASE_URL}/api/admin/audit`, {
      headers: { "x-admin-key": "wrong-secret-key" }
    });
    assert.strictEqual(badKeyRes.status, 403);

    // With valid key -> 200
    const authRes = await fetch(`${BASE_URL}/api/admin/audit`, {
      headers: { "x-admin-key": "test-secret-admin-key" }
    });
    assert.strictEqual(authRes.status, 200);
  });
});
