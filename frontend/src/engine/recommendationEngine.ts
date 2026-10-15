import { Requirements, RecommendationTier } from "../types";
import { calculateClientCosts } from "./costEngine";

export function generateClientRecommendations(req: Requirements): {
  bestFitTierId: "budget" | "balanced" | "enterprise";
  bestFitReason: string;
  tiers: RecommendationTier[];
} {
  const {
    users = 10000,
    trafficGB = 1000,
    nodes = 2,
    database = "postgres",
    availability = "standard",
    compliance = false,
    backup = true,
    ops = "managed",
    budgetUSD = 75,
    region = "india"
  } = req;

  // Ultra-Budget Tier
  const budgetProvider = region === "europe" ? "Hetzner Cloud" : "Contabo Cloud VPS";
  const budgetProviderId = region === "europe" ? "hetzner" : "contabo";
  const budgetEstimate = calculateClientCosts({
    providerId: budgetProviderId,
    providerName: budgetProvider,
    category: "vps",
    instances: Math.max(1, Math.min(2, nodes)),
    unitComputeUSD: budgetProviderId === "hetzner" ? 4.50 : 5.50,
    dbType: database,
    dbHosting: database === "none" ? "none" : "self",
    storageGB: 50,
    dataTransferGB: trafficGB,
    backupRequired: backup
  });

  const budgetTier: RecommendationTier = {
    tierId: "budget",
    tierName: "Ultra-Budget",
    providerId: budgetProviderId,
    providerName: budgetProvider,
    monthlyEstimateUSD: budgetEstimate.totalMonthlyUSD,
    pricingConfidence: "High (Fixed-cost monthly VPS model)",
    headline: "Unbeatable compute density and high bandwidth for MVPs",
    whySelected:
      "Avoids managed cloud service premiums by using high-RAM VPS instances with Docker and Cloudflare R2 zero-egress object storage.",
    satisfiedRequirements: [
      `Supports ${users.toLocaleString()} users on dedicated compute`,
      "Generous included bandwidth allowance (20TB+)",
      "Zero vendor lock-in with portable Docker containers"
    ],
    includedComponents: [
      `${budgetProvider} Instances (${nodes}x)`,
      "Docker / Coolify deployment runtime",
      database !== "none" ? "Self-hosted PostgreSQL container" : "No database",
      "Cloudflare Free CDN & SSL",
      "Automated R2 snapshot backup scripts"
    ],
    excludedComponents: [
      "Automated multi-AZ database standby",
      "Cloud provider managed OS patching",
      "Enterprise WAF and IAM governance"
    ],
    operationalComplexity: "Medium-High (Sysadmin required for updates and backups)",
    tradeoffs: {
      availability: availability === "ha" ? "Limited: Single-host failover requires manual intervention" : "Suitable for standard non-critical workloads",
      security: compliance ? "Disqualified: Lacks turnkey compliance certifications" : "Isolated docker networks with UFW firewall rules"
    },
    risks: [
      "Unmanaged database: corrupted WAL or disk full requires manual repair",
      "No automated multi-datacenter failover"
    ],
    eligible: !compliance,
    eligibilityReason: compliance ? "Disqualified: Lacks turnkey SOC 2 / HIPAA compliance" : "Eligible"
  };

  // Balanced Value Tier
  const balancedEstimate = calculateClientCosts({
    providerId: "digitalocean",
    providerName: "DigitalOcean",
    category: "vps",
    instances: Math.max(1, nodes),
    unitComputeUSD: 12.00,
    dbType: database,
    dbHosting: database === "none" ? "none" : "managed",
    storageGB: 100,
    dataTransferGB: trafficGB,
    backupRequired: backup
  });

  const balancedTier: RecommendationTier = {
    tierId: "balanced",
    tierName: "Balanced Value",
    providerId: "digitalocean",
    providerName: "DigitalOcean / Akamai Linode",
    monthlyEstimateUSD: balancedEstimate.totalMonthlyUSD,
    pricingConfidence: "High (Published droplet and managed DB rates)",
    headline: "Balanced developer velocity, managed durability, and controlled cost",
    whySelected:
      "Pairs scalable application instances with fully managed PostgreSQL (daily backups, maintenance, standby node) without hyperscaler complexity.",
    satisfiedRequirements: [
      `Turnkey managed ${database.toUpperCase()} with automated failover`,
      "VPC private networking for database isolation",
      "Easy scaling with load balancers and one-click upgrades"
    ],
    includedComponents: [
      `App Droplets (${nodes}x) behind Cloud Load Balancer`,
      database !== "none" ? `Managed ${database.toUpperCase()} Cluster` : "No database",
      "Cloudflare CDN & SSL termination",
      "VPC Private Network",
      "Automated daily snapshots"
    ],
    excludedComponents: [
      "Cross-region active-active database replication",
      "Hardware security modules (HSM)"
    ],
    operationalComplexity: "Low (Platform manages database uptime; developers focus on product)",
    tradeoffs: {
      availability: availability === "ha" ? "High: Standby replica provides automated failover" : "Standard high reliability",
      security: "Robust: Private VPC network, encrypted disks, platform patching"
    },
    risks: [
      "Egress over 2 TB billed at $0.01/GB",
      "Discrete price jumps on managed database compute upgrades"
    ],
    eligible: true,
    eligibilityReason: "Fully eligible across all standard and HA workloads"
  };

  // Enterprise Scalability Tier
  const enterpriseEstimate = calculateClientCosts({
    providerId: "aws",
    providerName: "Amazon Web Services",
    category: "hyperscaler",
    instances: Math.max(2, nodes),
    unitComputeUSD: 14.60,
    dbType: database,
    dbHosting: database === "none" ? "none" : "managed",
    storageGB: 150,
    dataTransferGB: trafficGB,
    backupRequired: backup,
    natGatewayCount: availability === "ha" ? 2 : 1,
    monitoringLevel: "advanced"
  });

  const enterpriseTier: RecommendationTier = {
    tierId: "enterprise",
    tierName: "Enterprise Scalability",
    providerId: "aws",
    providerName: "Amazon Web Services (AWS)",
    monthlyEstimateUSD: enterpriseEstimate.totalMonthlyUSD,
    pricingConfidence: "Medium (Hyperscaler egress and NAT gateway depend on usage)",
    headline: "Mission-critical reliability, multi-AZ failover, and compliance readiness",
    whySelected:
      "Enterprise standard architecture with AWS RDS Multi-AZ synchronous failover, Application Load Balancers, AWS WAF, and IAM governance.",
    satisfiedRequirements: [
      "Turnkey SOC 2, ISO 27001, HIPAA, and PCI-DSS readiness",
      "Multi-AZ synchronous redundancy across separate physical facilities",
      "Granular IAM policies, KMS CMK encryption, and CloudWatch metrics"
    ],
    includedComponents: [
      `AWS EC2 / ECS App Cluster (${Math.max(2, nodes)}x instances)`,
      "Application Load Balancer (ALB)",
      database !== "none" ? "AWS RDS Multi-AZ PostgreSQL with synchronous standby" : "No database",
      "NAT Gateways for private subnet outbound egress",
      "AWS WAF managed rule groups",
      "CloudWatch Alarms & GuardDuty"
    ],
    excludedComponents: [
      "Ultra-budget server consolidation",
      "Free unmetered egress bandwidth"
    ],
    operationalComplexity: "High (Requires dedicated cloud engineering/DevOps team)",
    tradeoffs: {
      availability: "Industry Benchmark: Synchronous multi-AZ failover (< 60s RTO)",
      security: "Maximum: KMS keys, VPC endpoints, strict IAM roles"
    },
    risks: [
      "Egress transfer ($0.09/GB) and NAT Gateways ($32/mo) can inflate bills if unmonitored",
      "Steep operational learning curve"
    ],
    eligible: true,
    eligibilityReason: "Mandatory when compliance = true or enterprise SLA is required"
  };

  // Determine Best Fit with hard constraints
  let bestFitTierId: "budget" | "balanced" | "enterprise" = "balanced";
  let bestFitReason = "";

  if (compliance) {
    bestFitTierId = "enterprise";
    bestFitReason = "Enterprise Scalability selected as Best Fit because compliance requirements mandate certified multi-AZ infrastructure and audited governance.";
  } else if (budgetUSD < 25) {
    bestFitTierId = "budget";
    bestFitReason = "Ultra-Budget selected as Best Fit to maintain infrastructure costs strictly below budget constraints.";
  } else if (availability === "ha" && users >= 500000) {
    bestFitTierId = "enterprise";
    bestFitReason = "Enterprise Scalability selected as Best Fit to handle high concurrent traffic and mission-critical uptime.";
  } else if (ops === "self") {
    bestFitTierId = "budget";
    bestFitReason = "Ultra-Budget selected as Best Fit aligning with your preference for self-managed Docker workloads.";
  } else {
    bestFitTierId = "balanced";
    bestFitReason = "Balanced Value selected as Best Fit offering the sweet spot of managed reliability, automated backups, and predictable pricing.";
  }

  budgetTier.isBestFit = bestFitTierId === "budget";
  balancedTier.isBestFit = bestFitTierId === "balanced";
  enterpriseTier.isBestFit = bestFitTierId === "enterprise";

  return {
    bestFitTierId,
    bestFitReason,
    tiers: [budgetTier, balancedTier, enterpriseTier]
  };
}
