"use strict";

const express = require("express");
const router = express.Router();
const db = require("../db");
const { PROVIDER_CATALOG } = require("../services/catalogData");
const {
  getSyncStatus,
  getWeeklyChanges,
  triggerSyncNow
} = require("../services/pricingSyncService");

// GET /api/providers/sync-status
router.get("/sync-status", (req, res) => {
  res.json({
    success: true,
    data: getSyncStatus()
  });
});

// POST /api/providers/sync-now
router.post("/sync-now", (req, res) => {
  const result = triggerSyncNow();
  res.json(result);
});

// GET /api/providers/weekly-changes
router.get("/weekly-changes", (req, res) => {
  const { filter } = req.query;
  const result = getWeeklyChanges(filter);
  res.json(result);
});

// GET /api/providers

router.get("/", (req, res) => {
  const {
    category,
    region,
    search,
    maxPrice,
    managed,
    status,
    sortBy = "price",
    sortOrder = "asc"
  } = req.query;

  // Retrieve plans from database table provider_plans
  const dbPlans = db
    .prepare(
      `SELECT id, provider, plan_name, region, vcpu, ram,
              storage, bandwidth, monthly_usd, pricing_url,
              pricing_status, updated_at
       FROM provider_plans
       ORDER BY provider, plan_name`
    )
    .all();

  // Combine DB plans with rich catalog metadata
  let providers = PROVIDER_CATALOG.map(p => {
    const matchingDbPlans = dbPlans.filter(
      dp => dp.provider.toLowerCase() === p.name.toLowerCase() || dp.provider.toLowerCase() === p.id.toLowerCase()
    );
    return {
      ...p,
      dbPlans: matchingDbPlans
    };
  });

  // Apply filters
  if (category && category !== "all") {
    providers = providers.filter(p => p.category === category);
  }

  if (region && region !== "all") {
    providers = providers.filter(
      p => p.regions && (p.regions.includes(region) || p.regions.includes("global"))
    );
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    providers = providers.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tier.toLowerCase().includes(q) ||
        (p.strengths && p.strengths.some(s => s.toLowerCase().includes(q)))
    );
  }

  if (maxPrice && !isNaN(Number(maxPrice))) {
    providers = providers.filter(p => p.startingPrice <= Number(maxPrice));
  }

  if (managed !== undefined && managed !== "all") {
    const isManaged = managed === "true" || managed === true;
    providers = providers.filter(p => p.managed === isManaged);
  }

  if (status && status !== "all") {
    providers = providers.filter(p => p.pricingStatus === status);
  }

  // Sorting
  providers.sort((a, b) => {
    let comp = 0;
    if (sortBy === "price") {
      comp = (a.startingPrice || 0) - (b.startingPrice || 0);
    } else if (sortBy === "name") {
      comp = a.name.localeCompare(b.name);
    }
    return sortOrder === "desc" ? -comp : comp;
  });

  // Return both count/plans (for legacy frontend) and rich providers data
  res.json({
    success: true,
    count: dbPlans.length,
    plans: dbPlans,
    providersCount: providers.length,
    providers
  });
});

// GET /api/providers/:id
router.get("/:id", (req, res) => {
  const provider = PROVIDER_CATALOG.find(
    p => p.id.toLowerCase() === req.params.id.toLowerCase()
  );

  if (!provider) {
    return res.status(404).json({
      success: false,
      error: `Provider '${req.params.id}' not found`
    });
  }

  const matchingDbPlans = db
    .prepare(
      `SELECT * FROM provider_plans
       WHERE LOWER(provider) = LOWER(?) OR LOWER(provider) = LOWER(?)`
    )
    .all(provider.name, provider.id);

  res.json({
    success: true,
    data: {
      ...provider,
      dbPlans: matchingDbPlans
    }
  });
});

module.exports = router;
