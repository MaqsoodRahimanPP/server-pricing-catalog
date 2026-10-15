import { Requirements, RecommendationTier, TierId } from "../types";
import { calculateClientCosts } from "./costEngine";

export function generateClientRecommendations(req: Requirements): {
  bestFitTierId: TierId;
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

  // 1. Ultra-Budget Tier (Contabo / Hetzner)
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
    monthlyEstimateINR: Math.round(budgetEstimate.totalMonthlyUSD * 86.5),
    pricingConfidence: "High (Fixed-cost monthly VPS model)",
    headline: "Unbeatable compute density and high bandwidth for bootstrapper MVPs",
    whySelected:
      "Avoids managed cloud premiums by using high-RAM VPS instances with Docker and Cloudflare R2 zero-egress storage.",
    satisfiedRequirements: [
      `Supports ${users.toLocaleString()} users on dedicated compute`,
      "Generous included bandwidth allowance (20TB+)",
      "Zero vendor lock-in with portable Docker containers"
    ],
    includedComponents: [
      `${budgetProvider} Instances (${nodes}x)`,
      "Docker / Portainer deployment runtime",
      database !== "none" ? "Self-hosted PostgreSQL container" : "No database",
      "Cloudflare Free CDN & SSL",
      "Automated R2 snapshot backup scripts"
    ],
    excludedComponents: [
      "Automated multi-AZ database standby",
      "Managed OS auto-patching",
      "Enterprise WAF and IAM governance"
    ],
    operationalComplexity: "Medium-High (Sysadmin required for updates and backups)",
    tradeoffs: {
      availability:
        availability === "ha"
          ? "Limited: Single-host failover requires manual intervention"
          : "Suitable for standard non-critical workloads",
      security: compliance
        ? "Disqualified: Lacks turnkey compliance certifications"
        : "Isolated docker networks with UFW firewall rules"
    },
    risks: [
      "Unmanaged database: corrupted WAL or disk full requires manual repair",
      "Shared I/O noisy-neighbor spikes during peak hours"
    ],
    eligible: !compliance,
    eligibilityReason: compliance
      ? "Disqualified: Lacks turnkey SOC 2 / HIPAA compliance"
      : "Eligible"
  };

  // 2. NEW TIER: Hostinger Smart NVMe Value
  const hostingerPlan =
    users >= 500000
      ? { name: "KVM 8", introUSD: 25.99, renewalUSD: 49.99, introINR: 2199, renewalINR: 4199, ram: "32 GB", vcpu: "8 vCPU", nvme: "400 GB" }
      : users >= 50000 || nodes >= 2
      ? { name: "KVM 4", introUSD: 12.99, renewalUSD: 28.99, introINR: 1099, renewalINR: 2499, ram: "16 GB", vcpu: "4 vCPU", nvme: "200 GB" }
      : { name: "KVM 2", introUSD: 8.99, renewalUSD: 14.99, introINR: 799, renewalINR: 1299, ram: "8 GB", vcpu: "2 vCPU", nvme: "100 GB" };

  const hostingerMonthlyUSD = Number((hostingerPlan.introUSD * Math.max(1, Math.min(2, nodes))).toFixed(2));
  const hostingerRenewalMonthlyUSD = Number((hostingerPlan.renewalUSD * Math.max(1, Math.min(2, nodes))).toFixed(2));
  const hostingerTco1YearUSD = Number((hostingerMonthlyUSD * 12).toFixed(2));
  const hostingerTco3YearUSD = Number((hostingerMonthlyUSD * 12 + hostingerRenewalMonthlyUSD * 24).toFixed(2));

  const hostingerMonthlyINR = hostingerPlan.introINR * Math.max(1, Math.min(2, nodes));
  const hostingerRenewalMonthlyINR = hostingerPlan.renewalINR * Math.max(1, Math.min(2, nodes));
  const hostingerTco1YearINR = hostingerMonthlyINR * 12;
  const hostingerTco3YearINR = hostingerMonthlyINR * 12 + hostingerRenewalMonthlyINR * 24;

  const hostingerTier: RecommendationTier = {
    tierId: "hostinger",
    tierName: "Smart NVMe Value",
    providerId: "hostinger",
    providerName: "Hostinger KVM + Coolify",
    monthlyEstimateUSD: hostingerMonthlyUSD,
    monthlyEstimateINR: hostingerMonthlyINR,
    introMonthlyUSD: hostingerMonthlyUSD,
    renewalMonthlyUSD: hostingerRenewalMonthlyUSD,
    introMonthlyINR: hostingerMonthlyINR,
    renewalMonthlyINR: hostingerRenewalMonthlyINR,
    tco1YearUSD: hostingerTco1YearUSD,
    tco3YearUSD: hostingerTco3YearUSD,
    tco1YearINR: hostingerTco1YearINR,
    tco3YearINR: hostingerTco3YearINR,
    badge: "SMART NVMe VALUE",
    pricingConfidence: "High (Published Intro & Transparent Renewal TCO)",
    headline: "Pure Gen4 NVMe disk speed, Coolify 1-Click PaaS, and Kodee AI Server Assistant",
    whySelected:
      "Delivers up to 3,500 MB/s NVMe storage throughput and unthrottled 300 Mb/s ports with turnkey Coolify/Docker deployments and Mumbai/Singapore datacenter routing.",
    satisfiedRequirements: [
      `High-speed NVMe storage handles ${users.toLocaleString()} users with sub-millisecond database I/O`,
      "1-Click Coolify PaaS (Heroku-like Git push deployments at VPS pricing)",
      "Kodee AI Assistant simplifies Linux server administration and log inspection",
      "Mumbai, India (Asia South) local routing for ultra-low domestic latency"
    ],
    includedComponents: [
      `Hostinger ${hostingerPlan.name} (${hostingerPlan.vcpu}, ${hostingerPlan.ram} RAM, ${hostingerPlan.nvme} NVMe)`,
      "Coolify PaaS / Docker Compose application runtime",
      database !== "none" ? "PostgreSQL on Gen4 NVMe (zero I/O bottlenecks)" : "No database",
      "Kodee AI Server Assistant (Automated troubleshooting & terminal assistant)",
      "Automated weekly backups + 1-click snapshot recovery",
      "Local datacenter in Mumbai (IN), Singapore, or EU/US"
    ],
    excludedComponents: [
      "Turnkey HIPAA/FedRAMP audited enterprise governance",
      "Cross-region multi-datacenter active-active database replication"
    ],
    operationalComplexity: "Low-Medium (Coolify provides turnkey PaaS; Kodee AI handles sysadmin)",
    tradeoffs: {
      availability: "High: 99.9% uptime SLA with weekly snapshots and instant container restarts",
      security: "Robust: Dedicated IPv4/IPv6, UFW firewall rules, isolated Docker bridge networks"
    },
    risks: [
      "Renewal rate applies after promotional period (fully factored into 3-Year TCO)",
      "Managed multi-region failover requires custom DNS configuration"
    ],
    eligible: !compliance,
    eligibilityReason: compliance
      ? "Disqualified: Lacks turnkey SOC 2 / HIPAA compliance"
      : "Eligible (Best NVMe price/performance in Asia & Global)",
    hostingerFeatures: {
      kodeeAi: true,
      coolifySupport: true,
      nvmeStorage: `${hostingerPlan.nvme} Gen4 NVMe SSD`,
      datacenter: region === "india" ? "Mumbai (Asia South)" : region === "europe" ? "Vilnius / Paris (EU)" : "Phoenix (USA)",
      backupCadence: "Automated Weekly Backups + 1-Click Snapshot"
    }
  };

  // 3. Balanced Value Tier (DigitalOcean)
  const balancedEstimate = calculateClientCosts({
    providerId: "digitalocean",
    providerName: "DigitalOcean",
    category: "vps",
    instances: Math.max(1, nodes),
    unitComputeUSD: 12.0,
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
    monthlyEstimateINR: Math.round(balancedEstimate.totalMonthlyUSD * 86.5),
    pricingConfidence: "High (Published droplet and managed DB rates)",
    headline: "Balanced developer velocity, managed DB standby durability, and predictable PaaS",
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
      availability:
        availability === "ha"
          ? "High: Standby replica provides automated failover"
          : "Standard high reliability",
      security: "Robust: Private VPC network, encrypted disks, platform patching"
    },
    risks: [
      "Egress over 2 TB billed at $0.01/GB",
      "Discrete price jumps on managed database compute upgrades"
    ],
    eligible: true,
    eligibilityReason: "Fully eligible across all standard and HA workloads"
  };

  // 4. Enterprise Scalability Tier (AWS)
  const enterpriseEstimate = calculateClientCosts({
    providerId: "aws",
    providerName: "Amazon Web Services",
    category: "hyperscaler",
    instances: Math.max(2, nodes),
    unitComputeUSD: 14.6,
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
    monthlyEstimateINR: Math.round(enterpriseEstimate.totalMonthlyUSD * 86.5),
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
      database !== "none"
        ? "AWS RDS Multi-AZ PostgreSQL with synchronous standby"
        : "No database",
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
  let bestFitTierId: TierId = "hostinger";
  let bestFitReason = "";

  if (compliance) {
    bestFitTierId = "enterprise";
    bestFitReason =
      "Enterprise Scalability selected as Best Fit because regulatory compliance mandates audited multi-AZ infrastructure and governance.";
  } else if (budgetUSD < 10) {
    bestFitTierId = "budget";
    bestFitReason =
      "Ultra-Budget selected as Best Fit to maintain infrastructure costs strictly below $10/mo constraint.";
  } else if (availability === "ha" && users >= 500000) {
    bestFitTierId = "enterprise";
    bestFitReason =
      "Enterprise Scalability selected as Best Fit to handle high concurrent traffic and mission-critical uptime.";
  } else if (ops === "managed" && users >= 50000) {
    bestFitTierId = "balanced";
    bestFitReason =
      "Balanced Value selected as Best Fit for turnkey managed database failover and automated maintenance.";
  } else {
    bestFitTierId = "hostinger";
    bestFitReason =
      "Hostinger Smart NVMe selected as Best Fit offering the ultimate price-to-performance ratio with Gen4 NVMe disk speed, 1-Click Coolify PaaS, Kodee AI assistant, and up to 68% TCO savings.";
  }

  budgetTier.isBestFit = bestFitTierId === "budget";
  hostingerTier.isBestFit = bestFitTierId === "hostinger";
  balancedTier.isBestFit = bestFitTierId === "balanced";
  enterpriseTier.isBestFit = bestFitTierId === "enterprise";

  return {
    bestFitTierId,
    bestFitReason,
    tiers: [budgetTier, hostingerTier, balancedTier, enterpriseTier]
  };
}
