"use strict";

const express = require("express");
const router = express.Router();
const crypto = require("node:crypto");
const db = require("../db");

function requireAdmin(req, res, next) {
  const configured = process.env.ADMIN_API_KEY;
  const supplied = req.get("x-admin-key");

  if (!configured || !supplied) {
    return res.status(401).json({
      success: false,
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
      success: false,
      error: "Invalid admin key"
    });
  }

  next();
}

// PATCH /api/admin/plans/:id
router.patch("/plans/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const { monthly_usd, pricing_status } = req.body || {};

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, error: "Invalid plan ID" });
  }

  if (
    typeof monthly_usd !== "number" ||
    !Number.isFinite(monthly_usd) ||
    monthly_usd < 0 ||
    monthly_usd > 100000000
  ) {
    return res.status(400).json({
      success: false,
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
      success: false,
      error: "Invalid pricing status"
    });
  }

  const update = db.transaction(() => {
    const old = db.prepare("SELECT * FROM provider_plans WHERE id = ?").get(id);
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

    return db.prepare("SELECT * FROM provider_plans WHERE id = ?").get(id);
  });

  const plan = update();

  if (!plan) {
    return res.status(404).json({ success: false, error: "Plan not found" });
  }

  res.json({ success: true, plan });
});

// GET /api/admin/audit
router.get("/audit", requireAdmin, (req, res) => {
  const entries = db
    .prepare(
      `SELECT a.id, a.plan_id, p.provider, p.plan_name,
              a.old_monthly_usd, a.new_monthly_usd, a.changed_at
       FROM pricing_audit a
       JOIN provider_plans p ON p.id = a.plan_id
       ORDER BY a.id DESC
       LIMIT 200`
    )
    .all();

  res.json({ success: true, entries });
});

module.exports = router;
