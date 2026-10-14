
"use strict";

require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const crypto = require("node:crypto");
const db = require("./db");

const app = express();

app.use(helmet());
app.use(express.json({ limit: "100kb" }));

function requireAdmin(req, res, next) {
  const configured = process.env.ADMIN_API_KEY;
  const supplied = req.get("x-admin-key");

  if (!configured || !supplied) {
    return res.status(401).json({
      error: "Admin authentication required"
    });
  }

  const expected = Buffer.from(configured);
  const actual = Buffer.from(supplied);

  if (
    expected.length !== actual.length ||
    !crypto.timingSafeEqual(expected, actual)
  ) {
    return res.status(403).json({
      error: "Invalid admin key"
    });
  }

  next();
}

app.get("/api/health", (req, res) => {
  try {
    db.prepare("SELECT 1").get();
    res.json({ status: "ok", database: "connected" });
  } catch {
    res.status(503).json({ status: "error" });
  }
});

app.get("/api/providers", (req, res) => {
  const plans = db.prepare(`
    SELECT id, provider, plan_name, region, vcpu, ram,
           storage, bandwidth, monthly_usd, pricing_url,
           pricing_status, updated_at
    FROM provider_plans
    ORDER BY provider, plan_name
  `).all();

  res.json({ count: plans.length, plans });
});

app.post("/api/estimates", (req, res) => {
  const {
    projectName,
    monthlyCompute,
    monthlyStorage,
    monthlyNetwork
  } = req.body || {};

  if (
    typeof projectName !== "string" ||
    !projectName.trim() ||
    projectName.length > 120
  ) {
    return res.status(400).json({
      error: "Provide a project name of 1–120 characters"
    });
  }

  const costs = [
    monthlyCompute,
    monthlyStorage,
    monthlyNetwork
  ];

  if (
    costs.some(
      value =>
        typeof value !== "number" ||
        !Number.isFinite(value) ||
        value < 0 ||
        value > 100000000
    )
  ) {
    return res.status(400).json({
      error: "Cost fields must be non-negative finite numbers"
    });
  }

  const result = {
    currency: "USD",
    compute: monthlyCompute,
    storage: monthlyStorage,
    network: monthlyNetwork,
    monthlyTotal: Number(
      (monthlyCompute + monthlyStorage + monthlyNetwork).toFixed(2)
    ),
    annualTotal: Number(
      ((monthlyCompute + monthlyStorage + monthlyNetwork) * 12).toFixed(2)
    ),
    estimateOnly: true
  };

  const insert = db.prepare(`
    INSERT INTO estimates
      (project_name, inputs_json, result_json)
    VALUES (?, ?, ?)
  `);

  const saved = insert.run(
    projectName.trim(),
    JSON.stringify(req.body),
    JSON.stringify(result)
  );

  res.status(201).json({
    id: saved.lastInsertRowid,
    projectName: projectName.trim(),
    result
  });
});

app.get("/api/estimates", (req, res) => {
  const rows = db.prepare(`
    SELECT id, project_name, result_json, created_at
    FROM estimates
    ORDER BY id DESC
    LIMIT 100
  `).all();

  res.json({
    estimates: rows.map(row => ({
      id: row.id,
      projectName: row.project_name,
      result: JSON.parse(row.result_json),
      createdAt: row.created_at
    }))
  });
});

app.patch("/api/admin/plans/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const { monthly_usd, pricing_status } = req.body || {};

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid plan ID" });
  }

  if (
    typeof monthly_usd !== "number" ||
    !Number.isFinite(monthly_usd) ||
    monthly_usd < 0 ||
    monthly_usd > 100000000
  ) {
    return res.status(400).json({
      error: "monthly_usd must be a non-negative number"
    });
  }

  const allowedStatuses = [
    "verified",
    "verify-before-use",
    "requires-calculator",
    "unverified"
  ];

  if (
    pricing_status !== undefined &&
    !allowedStatuses.includes(pricing_status)
  ) {
    return res.status(400).json({
      error: "Invalid pricing status"
    });
  }

  const update = db.transaction(() => {
    const old = db.prepare(
      "SELECT * FROM provider_plans WHERE id = ?"
    ).get(id);

    if (!old) return null;

    db.prepare(`
      INSERT INTO pricing_audit
        (plan_id, old_monthly_usd, new_monthly_usd)
      VALUES (?, ?, ?)
    `).run(id, old.monthly_usd, monthly_usd);

    db.prepare(`
      UPDATE provider_plans
      SET monthly_usd = ?,
          pricing_status = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      monthly_usd,
      pricing_status || old.pricing_status,
      id
    );

    return db.prepare(
      "SELECT * FROM provider_plans WHERE id = ?"
    ).get(id);
  });

  const plan = update();

  if (!plan) {
    return res.status(404).json({ error: "Plan not found" });
  }

  res.json({ plan });
});

app.get("/api/admin/audit", requireAdmin, (req, res) => {
  const entries = db.prepare(`
    SELECT a.id, a.plan_id, p.provider, p.plan_name,
           a.old_monthly_usd, a.new_monthly_usd, a.changed_at
    FROM pricing_audit a
    JOIN provider_plans p ON p.id = a.plan_id
    ORDER BY a.id DESC
    LIMIT 200
  `).all();

  res.json({ entries });
});

const port = Number(process.env.PORT || 3000);

app.listen(port, "0.0.0.0", () => {
  console.log(`CloudBlueprint API listening on ${port}`);
});
