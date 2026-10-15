"use strict";

const express = require("express");
const router = express.Router();
const { z } = require("zod");
const { calculateCosts } = require("../services/costEngine");

const costCalculationSchema = z.object({
  providerId: z.string().default("aws"),
  instances: z.number().int().min(1).max(50).default(2),
  instanceType: z.string().optional().default("t4g.small"),
  dbType: z.string().default("postgres"),
  dbHosting: z.enum(["managed", "self", "serverless", "none"]).default("managed"),
  storageGB: z.number().nonnegative().default(100),
  storageType: z.enum(["ssd", "nvme", "object"]).default("ssd"),
  dataTransferGB: z.number().nonnegative().default(1000),
  cdnRequired: z.boolean().default(true),
  backupRequired: z.boolean().default(true),
  natGatewayCount: z.number().int().min(0).max(5).default(0),
  monitoringLevel: z.enum(["basic", "standard", "advanced"]).default("standard"),
  currency: z.enum(["USD", "EUR", "GBP", "INR"]).default("USD")
});

// POST /api/costs/calculate
router.post("/calculate", (req, res) => {
  try {
    const parsed = costCalculationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.issues.map(i => i.message).join(", ")
      });
    }

    const estimate = calculateCosts(parsed.data);
    res.json({
      success: true,
      data: estimate
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
