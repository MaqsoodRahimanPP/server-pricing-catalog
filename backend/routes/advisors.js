"use strict";

const express = require("express");
const router = express.Router();
const {
  DATABASE_ADVISOR_OPTIONS,
  generateFinOpsInsights
} = require("../services/advisors");

// GET /api/database-advisor
router.get("/database", (req, res) => {
  const { workload = "general", highAvailability = "false" } = req.query;
  const isHA = highAvailability === "true";

  // Match optimal database for current workload
  let recommendationId = "supabase";
  if (isHA) {
    recommendationId = "rds-multi-az";
  } else if (workload === "bursty" || workload === "preview-branches") {
    recommendationId = "neon";
  } else if (workload === "kubernetes") {
    recommendationId = "cloudnative-pg";
  } else if (workload === "budget") {
    recommendationId = "self-hosted-pg";
  }

  res.json({
    success: true,
    data: {
      recommendedId: recommendationId,
      options: DATABASE_ADVISOR_OPTIONS
    }
  });
});

// POST /api/finops-advisor
router.post("/finops", (req, res) => {
  const { requirements = {}, estimate = {} } = req.body || {};
  const insights = generateFinOpsInsights(requirements, estimate);

  res.json({
    success: true,
    data: {
      count: insights.length,
      insights
    }
  });
});

module.exports = router;
