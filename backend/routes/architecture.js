"use strict";

const express = require("express");
const router = express.Router();
const { z } = require("zod");
const { generateArchitecture } = require("../services/architectureEngine");

const architectureRequestSchema = z.object({
  requirements: z.record(z.any()),
  selectedTier: z.enum(["budget", "balanced", "enterprise"]).default("balanced")
});

// POST /api/architecture/generate
router.post("/generate", (req, res) => {
  try {
    const parsed = architectureRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.issues.map(i => i.message).join(", ")
      });
    }

    const architecture = generateArchitecture(
      parsed.data.requirements,
      parsed.data.selectedTier
    );

    res.json({
      success: true,
      data: architecture
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
