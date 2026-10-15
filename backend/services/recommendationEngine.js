"use strict";

const { calculateCosts } = require("./costEngine");

/**
 * Generates three distinct, transparent architectural recommendation tiers.
 */
function generateRecommendations(requirements) {
  const {
    projectType = "saas",
    users = 10000,
    traffic = 1000,
    nodes = 2,
    db = "postgres",
    availability = "standard", // "standard" | "ha"
    compliance = false,
    backup = true,
    ops = "managed", // "managed" | "self" | "serverless"
    budget = 75,
    region = "india",
    stack = "node",
    resources = "medium"
  } = requirements;

  // Tier 1: Ultra-Budget (VPS + Docker/Coolify + R2 + Self-hosted DB)
  const budgetProviderId = region === "europe" ? "hetzner" : "contabo";
  const budgetEstimate = calculateCosts({
    providerId: budgetProviderId,
    instances: Math.max(1, Math.min(2, nodes)),
    instanceType: budgetProviderId === "hetzner" ? "CX22" : "Cloud VPS S",
    dbType: db,
    dbHosting: db === "none" ? "none" : "self",
    storageGB: users > 100000 ? 200 : 50,
    storageType: "ssd",
    dataTransferGB: traffic,
    cdnRequired: true,
    backupRequired: backup,
    natGatewayCount: 0,
    monitoringLevel: "basic"
  });

  const budgetTier = {
    tierId: "budget",
    tierName: "Ultra-Budget",
    providerId: budgetProviderId,
    providerName: budgetProviderId === "hetzner" ? "Hetzner Cloud" : "Contabo Cloud VPS",
    monthlyEstimateUSD: budgetEstimate.totalMonthlyUSD,
    pricingConfidence: "High (Predictable flat-rate VPS billing)",
    headline: "Unbeatable price-to-performance for bootstrapped projects and lean MVPs",
    whySelected:
      "Eliminates managed service markups by utilizing high-memory virtual private servers paired with Docker containers and Cloudflare R2 zero-egress storage.",
    satisfiedRequirements: [
      `Accommodates ${users.toLocaleString()} MAU on dedicated vCPU/RAM allocation`,
      `Includes generous outbound transfer (${budgetProviderId === "hetzner" ? "20 TB" : "32 TB"} monthly quota)`,
      "Keeps recurring cloud expenditure well within lean startup limits"
    ],
    includedComponents: [
      `${budgetEstimate.provider.name} VPS Instances (${nodes}x)`,
      "Docker / Coolify application runtime container orchestration",
      db !== "none" ? "Self-hosted PostgreSQL container on private docker network" : "No database",
      "Cloudflare Free Edge CDN for DNS, TLS, and asset caching",
      "Automated local snapshot backup scripts to Cloudflare R2"
    ],
    excludedComponents: [
      "Multi-AZ automatic failover standby",
      "Cloud provider managed database patching",
      "Dedicated Enterprise WAF & IAM governance"
    ],
    operationalComplexity: "Medium-High (You are responsible for Linux OS patching, firewall rules, and database crash recovery)",
    tradeoffs: {
      availability: availability === "ha" ? "Limited: Single-host failover requires manual intervention or container restart policies" : "Acceptable for standard non-critical workloads (99.5% uptime target)",
      security: compliance ? "Disqualified for audited compliance frameworks without custom third-party attestation" : "Good: Private docker network isolation, SSH key-only access, UFW firewall"
    },
    risks: [
      "Unmanaged database: corrupted WAL or disk full requires sysadmin recovery",
      "No native managed failover without complex Patroni/Corosync cluster setup"
    ],
    eligible: !compliance,
    eligibilityReason: compliance ? "Disqualified: Lacks turnkey SOC 2 / HIPAA compliance certifications" : "Fully eligible"
  };

  // Tier 2: Balanced Value (DigitalOcean / Linode / Render + Managed DB)
  const balancedProviderId = "digitalocean";
  const balancedEstimate = calculateCosts({
    providerId: balancedProviderId,
    instances: Math.max(1, nodes),
    instanceType: "Basic Droplet 2GB",
    dbType: db,
    dbHosting: db === "none" ? "none" : "managed",
    storageGB: users > 100000 ? 250 : 100,
    storageType: "ssd",
    dataTransferGB: traffic,
    cdnRequired: true,
    backupRequired: backup,
    natGatewayCount: 0,
    monitoringLevel: "standard"
  });

  const balancedTier = {
    tierId: "balanced",
    tierName: "Balanced Value",
    providerId: balancedProviderId,
    providerName: "DigitalOcean / Akamai Linode",
    monthlyEstimateUSD: balancedEstimate.totalMonthlyUSD,
    pricingConfidence: "High (Published standard droplet and managed database pricing)",
    headline: "Optimal harmony of developer velocity, managed durability, and controlled cost",
    whySelected:
      "Pairs scalable application droplets with fully managed database infrastructure (automated maintenance, daily backups, standby node support) without hyperscaler complexity.",
    satisfiedRequirements: [
      `Production-grade managed ${db.toUpperCase()} with zero sysadmin overhead`,
      "Straightforward scaling with load balancer and private VPC network",
      "Automated point-in-time database snapshots and health recovery"
    ],
    includedComponents: [
      `Application Droplets (${nodes} nodes behind Load Balancer)`,
      db !== "none" ? `Managed ${db.toUpperCase()} with automatic security updates` : "No database",
      "Cloudflare CDN & TLS termination",
      "VPC Private Network isolating database from public ingress",
      "Automated daily backups with one-click restore drill"
    ],
    excludedComponents: [
      "Complex multi-cloud enterprise IAM hierarchies",
      "Dedicated hardware security modules (HSM)",
      "Multi-region active-active database replication"
    ],
    operationalComplexity: "Low (Platform manages database uptime, patching, and backups; developers focus on application code)",
    tradeoffs: {
      availability: availability === "ha" ? "High: Managed standby replica provides automated failover within 2 minutes" : "Standard: High reliability with minimal operational friction",
      security: "Robust: Private VPC network isolation, encrypted disks, automated platform patching"
    },
    risks: [
      "Bandwidth overages pool charged at $0.01/GB if egress spikes beyond included quota",
      "Managed database compute upgrades step up in discrete price brackets"
    ],
    eligible: true,
    eligibilityReason: "Fully eligible across all standard and HA workloads"
  };

  // Tier 3: Enterprise Scalability (AWS / GCP / Azure + Multi-AZ RDS + WAF)
  const enterpriseProviderId = "aws";
  const enterpriseEstimate = calculateCosts({
    providerId: enterpriseProviderId,
    instances: Math.max(2, nodes),
    instanceType: "t4g.small",
    dbType: db,
    dbHosting: db === "none" ? "none" : "managed",
    storageGB: users > 100000 ? 500 : 150,
    storageType: "ssd",
    dataTransferGB: traffic,
    cdnRequired: true,
    backupRequired: backup,
    natGatewayCount: availability === "ha" ? 2 : 1,
    monitoringLevel: "advanced"
  });

  const enterpriseTier = {
    tierId: "enterprise",
    tierName: "Enterprise Scalability",
    providerId: enterpriseProviderId,
    providerName: "Amazon Web Services (AWS)",
    monthlyEstimateUSD: enterpriseEstimate.totalMonthlyUSD,
    pricingConfidence: "Medium (Hyperscaler usage, egress, and NAT gateway fees depend on exact traffic patterns)",
    headline: "Mission-critical reliability, multi-AZ synchronous redundancy, and strict compliance governance",
    whySelected:
      "Enterprise standard architecture with AWS RDS Multi-AZ synchronous failover, Application Load Balancers, AWS WAF, IAM least-privilege policies, and CloudWatch metrics.",
    satisfiedRequirements: [
      "Turnkey SOC 2, ISO 27001, HIPAA, and PCI-DSS compliance readiness",
      "High availability (99.99%) across separate physical availability zones",
      "Enterprise grade encryption at rest (KMS) and transit (TLS 1.3)"
    ],
    includedComponents: [
      `AWS EC2 / ECS App Cluster (${Math.max(2, nodes)} instances across 2 AZs)`,
      "Application Load Balancer with automated health checks and SSL",
      db !== "none" ? "AWS RDS Multi-AZ PostgreSQL with synchronous standby replica" : "No database",
      "NAT Gateways for private subnet outbound internet access",
      "AWS WAF managed rule groups (OWASP Top 10, IP reputation)",
      "CloudWatch Alarms, GuardDuty anomaly detection, KMS CMK encryption"
    ],
    excludedComponents: [
      "Ultra-low budget server consolidation",
      "Unmetered free outbound bandwidth"
    ],
    operationalComplexity: "High (Requires dedicated cloud engineering/DevOps for IAM permissions, VPC routing tables, and security groups)",
    tradeoffs: {
      availability: "Industry Benchmark: Synchronous multi-AZ failover with < 60 second recovery time objective (RTO)",
      security: "Maximum: Hardware-backed KMS keys, VPC endpoint private links, strict IAM roles with zero shared root access"
    },
    risks: [
      "Egress transfer ($0.09/GB) and NAT Gateway ($32/mo + $0.045/GB) can significantly inflate invoices if unmonitored",
      "Substantial learning curve and configuration overhead"
    ],
    eligible: true,
    eligibilityReason: "Required when compliance = true or high availability enterprise SLAs are mandated"
  };

  // Determine Best Fit: Apply Hard Constraints
  let bestFitTierId = "balanced";

  if (compliance) {
    // Hard constraint: compliance requires Enterprise
    bestFitTierId = "enterprise";
  } else if (budget < 25) {
    // Hard constraint: very low budget requires Ultra-Budget
    bestFitTierId = "budget";
  } else if (availability === "ha" && users >= 500000) {
    bestFitTierId = "enterprise";
  } else if (ops === "self") {
    bestFitTierId = "budget";
  } else {
    // Balanced value is default sweet spot
    bestFitTierId = "balanced";
  }

  budgetTier.isBestFit = bestFitTierId === "budget";
  balancedTier.isBestFit = bestFitTierId === "balanced";
  enterpriseTier.isBestFit = bestFitTierId === "enterprise";

  return {
    bestFitTierId,
    bestFitReason:
      bestFitTierId === "enterprise"
        ? compliance
          ? "Selected as Best Fit because compliance requirements demand enterprise IAM and multi-AZ certified infrastructure."
          : "Selected as Best Fit due to mission-critical scale and high availability targets."
        : bestFitTierId === "budget"
        ? "Selected as Best Fit to optimize for cost efficiency and low monthly commitments."
        : "Selected as Best Fit offering the ideal equilibrium between fully managed reliability and controlled expenditure.",
    tiers: [budgetTier, balancedTier, enterpriseTier]
  };
}

module.exports = { generateRecommendations };
