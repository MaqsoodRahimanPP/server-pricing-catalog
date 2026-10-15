"use strict";

const express = require("express");
const router = express.Router();
const { z } = require("zod");
const { generateRecommendations } = require("../services/recommendationEngine");

const recommendationRequestSchema = z.object({
  projectType: z.string().default("saas"),
  users: z.number().nonnegative().default(10000),
  traffic: z.number().nonnegative().default(1000),
  nodes: z.number().int().positive().default(2),
  db: z.string().default("postgres"),
  availability: z.enum(["standard", "ha"]).default("standard"),
  compliance: z.boolean().default(false),
  backup: z.boolean().default(true),
  ops: z.enum(["managed", "self", "serverless"]).default("managed"),
  budget: z.number().nonnegative().default(75),
  region: z.string().default("india"),
  stack: z.string().default("node"),
  resources: z.string().default("medium")
});

// POST /api/recommendations
router.post("/", (req, res) => {
  try {
    const parsed = recommendationRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.issues.map(i => i.message).join(", ")
      });
    }

    const recommendations = generateRecommendations(parsed.data);
    res.json({
      success: true,
      data: recommendations
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
