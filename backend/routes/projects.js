"use strict";

const express = require("express");
const router = express.Router();
const { z } = require("zod");
const db = require("../db");

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(120),
  description: z.string().max(500).optional().default(""),
  mode: z.enum(["founder", "devops"]).default("founder"),
  requirements: z.record(z.any()),
  selectedTier: z.string().default("balanced"),
  architecture: z.record(z.any()),
  costEstimate: z.record(z.any()),
  components: z.array(z.any()).default([]),
  tags: z.string().optional().default("")
});

// GET /api/projects
router.get("/", (req, res) => {
  try {
    const rows = db
      .prepare(
        `SELECT id, name, description, mode, requirements_json,
                selected_tier, architecture_json, cost_estimate_json,
                components_json, tags, created_at, updated_at
         FROM projects
         ORDER BY id DESC`
      )
      .all();

    const projects = rows.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      mode: r.mode,
      requirements: JSON.parse(r.requirements_json),
      selectedTier: r.selected_tier,
      architecture: JSON.parse(r.architecture_json),
      costEstimate: JSON.parse(r.cost_estimate_json),
      components: JSON.parse(r.components_json),
      tags: r.tags,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));

    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/projects/:id
router.get("/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, error: "Invalid project ID" });
    }

    const row = db
      .prepare(
        `SELECT id, name, description, mode, requirements_json,
                selected_tier, architecture_json, cost_estimate_json,
                components_json, tags, created_at, updated_at
         FROM projects
         WHERE id = ?`
      )
      .get(id);

    if (!row) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }

    res.json({
      success: true,
      data: {
        id: row.id,
        name: row.name,
        description: row.description,
        mode: row.mode,
        requirements: JSON.parse(row.requirements_json),
        selectedTier: row.selected_tier,
        architecture: JSON.parse(row.architecture_json),
        costEstimate: JSON.parse(row.cost_estimate_json),
        components: JSON.parse(row.components_json),
        tags: row.tags,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/projects
router.post("/", (req, res) => {
  try {
    const parsed = projectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.issues.map(i => i.message).join(", ")
      });
    }

    const {
      name,
      description,
      mode,
      requirements,
      selectedTier,
      architecture,
      costEstimate,
      components,
      tags
    } = parsed.data;

    const insert = db.prepare(`
      INSERT INTO projects
        (name, description, mode, requirements_json, selected_tier,
         architecture_json, cost_estimate_json, components_json, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      name,
      description || "",
      mode,
      JSON.stringify(requirements),
      selectedTier,
      JSON.stringify(architecture),
      JSON.stringify(costEstimate),
      JSON.stringify(components),
      tags || ""
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.lastInsertRowid,
        name,
        mode,
        selectedTier,
        message: "Project successfully saved to SQLite database"
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/projects/:id
router.put("/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, error: "Invalid project ID" });
    }

    const parsed = projectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.issues.map(i => i.message).join(", ")
      });
    }

    const {
      name,
      description,
      mode,
      requirements,
      selectedTier,
      architecture,
      costEstimate,
      components,
      tags
    } = parsed.data;

    const update = db.prepare(`
      UPDATE projects
      SET name = ?,
          description = ?,
          mode = ?,
          requirements_json = ?,
          selected_tier = ?,
          architecture_json = ?,
          cost_estimate_json = ?,
          components_json = ?,
          tags = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = update.run(
      name,
      description || "",
      mode,
      JSON.stringify(requirements),
      selectedTier,
      JSON.stringify(architecture),
      JSON.stringify(costEstimate),
      JSON.stringify(components),
      tags || "",
      id
    );

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }

    res.json({
      success: true,
      data: { id, name, message: "Project successfully updated" }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/projects/:id
router.delete("/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, error: "Invalid project ID" });
    }

    const del = db.prepare("DELETE FROM projects WHERE id = ?");
    const result = del.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }

    res.json({
      success: true,
      data: { id, message: "Project deleted successfully" }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
