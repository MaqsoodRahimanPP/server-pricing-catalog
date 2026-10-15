"use strict";

const express = require("express");
const router = express.Router();
const db = require("../db");

// POST /api/estimates (Backward-compatible with legacy API + enhanced)
router.post("/", (req, res) => {
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
      success: false,
      error: "Provide a project name of 1–120 characters"
    });
  }

  const compute = typeof monthlyCompute === "number" && Number.isFinite(monthlyCompute) ? monthlyCompute : 0;
  const storage = typeof monthlyStorage === "number" && Number.isFinite(monthlyStorage) ? monthlyStorage : 0;
  const network = typeof monthlyNetwork === "number" && Number.isFinite(monthlyNetwork) ? monthlyNetwork : 0;

  if (compute < 0 || storage < 0 || network < 0) {
    return res.status(400).json({
      success: false,
      error: "Cost fields must be non-negative finite numbers"
    });
  }

  const total = Number((compute + storage + network).toFixed(2));
  const result = {
    currency: "USD",
    compute,
    storage,
    network,
    monthlyTotal: total,
    annualTotal: Number((total * 12).toFixed(2)),
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
    success: true,
    id: saved.lastInsertRowid,
    projectName: projectName.trim(),
    result
  });
});

// GET /api/estimates (Backward-compatible with legacy API)
router.get("/", (req, res) => {
  const rows = db
    .prepare(
      `SELECT id, project_name, result_json, created_at
       FROM estimates
       ORDER BY id DESC
       LIMIT 100`
    )
    .all();

  res.json({
    success: true,
    estimates: rows.map(row => ({
      id: row.id,
      projectName: row.project_name,
      result: JSON.parse(row.result_json),
      createdAt: row.created_at
    }))
  });
});

module.exports = router;
