"use strict";

const { PROVIDER_CATALOG } = require("./catalogData");

const CURRENCY_RATES = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.78,
  INR: 86.5
};

/**
 * Calculates a complete, deterministic cloud infrastructure cost estimate.
 * Shared by backend APIs and frontend simulations.
 */
function calculateCosts(inputs) {
  const {
    providerId = "aws",
    instances = 2,
    instanceType = "t4g.small",
    dbType = "postgres",
    dbHosting = "managed", // "managed" | "self" | "serverless" | "none"
    storageGB = 100,
    storageType = "ssd", // "ssd" | "nvme" | "object"
    dataTransferGB = 1000,
    cdnRequired = true,
    backupRequired = true,
    natGatewayCount = 0,
    monitoringLevel = "standard", // "basic" | "standard" | "advanced"
    currency = "USD"
  } = inputs;

  const provider =
    PROVIDER_CATALOG.find(p => p.id === providerId) || PROVIDER_CATALOG[0];

  // 1. Compute Cost
  let unitComputeUSD = 14.60;
  if (provider.computeOptions && provider.computeOptions.length > 0) {
    const matched = provider.computeOptions.find(o => o.name === instanceType);
    unitComputeUSD = matched ? matched.monthlyUSD : provider.computeOptions[0].monthlyUSD;
  } else {
    unitComputeUSD = provider.startingPrice || 15.0;
  }
  const computeMonthlyUSD = Number((instances * unitComputeUSD).toFixed(2));

  // 2. Database Cost
  let databaseMonthlyUSD = 0;
  if (dbType !== "none" && dbHosting !== "none") {
    if (dbHosting === "self") {
      // Self hosted uses raw compute resources (approx $10-$20 baseline or shared)
      databaseMonthlyUSD = provider.id === "hetzner" ? 4.50 : 15.00;
    } else if (dbHosting === "serverless") {
      databaseMonthlyUSD = 19.00; // Neon base
    } else {
      // Managed database
      if (provider.databaseOptions && provider.databaseOptions.length > 0) {
        databaseMonthlyUSD = provider.databaseOptions[0].monthlyUSD;
      } else {
        databaseMonthlyUSD = provider.managed ? 60.00 : 25.00;
      }
    }
  }

  // 3. Storage Cost
  const ratePerGB = storageType === "nvme" ? 0.12 : storageType === "object" ? 0.015 : 0.08;
  const storageMonthlyUSD = Number((storageGB * ratePerGB).toFixed(2));

  // 4. Bandwidth / Egress Cost
  const billableTransferGB = Math.max(0, dataTransferGB - (provider.egressIncludedGB || 100));
  const transferMonthlyUSD = Number((billableTransferGB * (provider.egressRate || 0.09)).toFixed(2));

  // 5. CDN & Networking
  const cdnMonthlyUSD = cdnRequired ? (dataTransferGB > 5000 ? 20.00 : 0.00) : 0.00; // Cloudflare standard edge free for baseline
  const natMonthlyUSD = Number((natGatewayCount * (provider.natGatewayMonthlyUSD || 32.85)).toFixed(2));
  const loadBalancerMonthlyUSD = instances > 1 ? (provider.category === "hyperscaler" ? 22.00 : 12.00) : 0.00;
  const networkingMonthlyUSD = Number((cdnMonthlyUSD + natMonthlyUSD + loadBalancerMonthlyUSD).toFixed(2));

  // 6. Backup & Monitoring
  const backupMonthlyUSD = backupRequired ? Number((storageGB * 0.05 + 5.00).toFixed(2)) : 0.00;
  const monitoringMonthlyUSD =
    monitoringLevel === "advanced" ? 25.00 : monitoringLevel === "standard" ? 10.00 : 0.00;

  // Breakdown aggregations
  const fixedMonthlyUSD = Number(
    (computeMonthlyUSD + databaseMonthlyUSD + loadBalancerMonthlyUSD + natMonthlyUSD + monitoringMonthlyUSD).toFixed(2)
  );
  const usageMonthlyUSD = Number(
    (storageMonthlyUSD + transferMonthlyUSD + backupMonthlyUSD + cdnMonthlyUSD).toFixed(2)
  );

  const totalMonthlyUSD = Number((fixedMonthlyUSD + usageMonthlyUSD).toFixed(2));
  const annualProjectedUSD = Number((totalMonthlyUSD * 12).toFixed(2));

  // Scenarios
  const lowScenarioUSD = Number((fixedMonthlyUSD + usageMonthlyUSD * 0.75).toFixed(2));
  const highScenarioUSD = Number((fixedMonthlyUSD + usageMonthlyUSD * 1.50).toFixed(2));

  // Currency exchange
  const fxRate = CURRENCY_RATES[currency] || 1.0;
  const toCurr = amount => Number((amount * fxRate).toFixed(2));

  // Major cost drivers identification
  const items = [
    { name: "Application Compute", amountUSD: computeMonthlyUSD, category: "Compute" },
    { name: "Database Service", amountUSD: databaseMonthlyUSD, category: "Database" },
    { name: "Storage Volumes", amountUSD: storageMonthlyUSD, category: "Storage" },
    { name: "Data Transfer / Egress", amountUSD: transferMonthlyUSD, category: "Network" },
    { name: "Networking (NAT & ALB)", amountUSD: networkingMonthlyUSD, category: "Network" },
    { name: "Backups & Monitoring", amountUSD: backupMonthlyUSD + monitoringMonthlyUSD, category: "Operations" }
  ];

  const sortedDrivers = items
    .filter(i => i.amountUSD > 0)
    .sort((a, b) => b.amountUSD - a.amountUSD)
    .map(i => ({
      ...i,
      amountFormatted: `${currency} ${toCurr(i.amountUSD).toLocaleString()}`,
      percentage: totalMonthlyUSD > 0 ? Number(((i.amountUSD / totalMonthlyUSD) * 100).toFixed(1)) : 0
    }));

  // Optimization recommendations
  const potentialOptimizations = [];
  if (transferMonthlyUSD > 30) {
    potentialOptimizations.push({
      area: "Egress Bandwidth",
      action: "Use Cloudflare CDN or Cloudflare R2 for assets to reduce origin data egress to $0.",
      estimatedSavingsUSD: Number((transferMonthlyUSD * 0.8).toFixed(2))
    });
  }
  if (natMonthlyUSD > 30) {
    potentialOptimizations.push({
      area: "NAT Gateways",
      action: "Configure VPC Gateway Endpoints for S3/DynamoDB to eliminate NAT data processing surcharges.",
      estimatedSavingsUSD: Number((natMonthlyUSD * 0.5).toFixed(2))
    });
  }
  if (databaseMonthlyUSD > 80 && dbHosting === "managed") {
    potentialOptimizations.push({
      area: "Database Rightsizing",
      action: "Add PgBouncer connection pooling to downscale RDS instance size without connection drops.",
      estimatedSavingsUSD: 45.00
    });
  }

  return {
    provider: {
      id: provider.id,
      name: provider.name,
      category: provider.category,
      tier: provider.tier,
      officialUrl: provider.officialUrl,
      lastVerifiedDate: provider.lastVerifiedDate
    },
    currency,
    exchangeRate: fxRate,
    lineItems: {
      computeUSD: computeMonthlyUSD,
      databaseUSD: databaseMonthlyUSD,
      storageUSD: storageMonthlyUSD,
      transferUSD: transferMonthlyUSD,
      networkingUSD: networkingMonthlyUSD,
      backupUSD: backupMonthlyUSD,
      monitoringUSD: monitoringMonthlyUSD
    },
    fixedMonthlyUSD,
    usageMonthlyUSD,
    totalMonthlyUSD,
    annualProjectedUSD,
    scenarios: {
      lowUSD: lowScenarioUSD,
      expectedUSD: totalMonthlyUSD,
      highUSD: highScenarioUSD
    },
    formatted: {
      totalMonthly: `${currency} ${toCurr(totalMonthlyUSD).toLocaleString()}`,
      annualProjected: `${currency} ${toCurr(annualProjectedUSD).toLocaleString()}`,
      lowScenario: `${currency} ${toCurr(lowScenarioUSD).toLocaleString()}`,
      highScenario: `${currency} ${toCurr(highScenarioUSD).toLocaleString()}`
    },
    costDrivers: sortedDrivers,
    optimizations: potentialOptimizations,
    assumptions: [
      `Compute based on ${instances} instance(s) running 730 hours/month on ${provider.name}`,
      `Bandwidth includes ${provider.egressIncludedGB} GB allowance; billable at $${provider.egressRate}/GB`,
      "All pricing is based on public 2026 baseline on-demand rates without long-term reservations",
      "Estimates represent infrastructure sizing guidance and not an official cloud invoice"
    ]
  };
}

module.exports = { calculateCosts, CURRENCY_RATES };
