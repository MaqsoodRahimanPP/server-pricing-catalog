import { ProviderItem, Currency } from "../types";

export const CURRENCY_CONVERSION: Record<Currency, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.78,
  INR: 86.5
};

export interface TCOCalculation {
  introTotal: number;
  renewalTotal: number;
  total3Year: number;
  avgMonthly3Year: number;
  savingsVsAwsPct: number;
}

export function calculateHostingerTCO(
  introMonthlyUSD: number,
  renewalMonthlyUSD: number
): TCOCalculation {
  const introTotal = introMonthlyUSD * 12; // 1st year promo
  const renewalTotal = renewalMonthlyUSD * 24; // next 2 years renewal
  const total3Year = introTotal + renewalTotal;
  const avgMonthly3Year = total3Year / 36;
  const awsEquiv3Year = 58.4 * 36; // Equivalent m6g.large compute
  const savingsVsAwsPct = Math.round(((awsEquiv3Year - total3Year) / awsEquiv3Year) * 100);

  return {
    introTotal: Number(introTotal.toFixed(2)),
    renewalTotal: Number(renewalTotal.toFixed(2)),
    total3Year: Number(total3Year.toFixed(2)),
    avgMonthly3Year: Number(avgMonthly3Year.toFixed(2)),
    savingsVsAwsPct
  };
}

export const PROVIDER_CATALOG: ProviderItem[] = [
  // 1. HOSTINGER (SMART NVMe VALUE)
  {
    id: "hostinger",
    name: "Hostinger Cloud & KVM",
    category: "vps",
    tier: "Smart NVMe Value",
    startingPrice: 6.49,
    pricingModel: "Introductory Discount + Transparent Renewal TCO (1-Yr / 3-Yr)",
    description: "Ultra-fast KVM virtual servers with Gen4 NVMe storage, unthrottled 300Mb/s network ports, Kodee AI sysadmin assistant, and 1-click Docker/Coolify templates.",
    strengths: [
      "Pure NVMe SSD storage delivering up to 3,500 MB/s sequential read/write IOPS",
      "Kodee AI Server Assistant for automated log inspection, Nginx config, and troubleshooting",
      "1-Click OS templates: Docker, Coolify PaaS, CyberPanel, Ubuntu 24.04, Debian 12",
      "Tier-3 Datacenters in Mumbai (India), Singapore, USA, UK, Lithuania, and France",
      "Automated weekly backups included + instant snapshot rollbacks"
    ],
    risks: [
      "Renewal prices kick in after initial billing contract period",
      "Self-managed OS requires Docker/Coolify for automated PaaS application deployments",
      "No native managed PostgreSQL cluster (mitigated by 1-click Coolify / Docker Compose)"
    ],
    computeOptions: [
      {
        name: "Hostinger KVM 1",
        vcpu: "1 vCPU",
        ram: "4 GiB",
        storage: "50 GB NVMe",
        bandwidth: "4 TB Transfer (300 Mb/s port)",
        monthlyUSD: 6.49,
        renewalUSD: 11.99,
        monthlyINR: 599,
        renewalINR: 999,
        features: ["1-Click Docker", "Kodee AI Assistant", "Weekly Automated Backups", "Dedicated IPv4 + IPv6"]
      },
      {
        name: "Hostinger KVM 2 (Popular)",
        vcpu: "2 vCPU",
        ram: "8 GiB",
        storage: "100 GB NVMe",
        bandwidth: "8 TB Transfer (300 Mb/s port)",
        monthlyUSD: 8.99,
        renewalUSD: 14.99,
        monthlyINR: 799,
        renewalINR: 1299,
        features: ["1-Click Coolify PaaS", "Kodee AI Assistant", "Weekly Backups + 1 Snapshot", "Full Root Access"]
      },
      {
        name: "Hostinger KVM 4 (Scale)",
        vcpu: "4 vCPU",
        ram: "16 GiB",
        storage: "200 GB NVMe",
        bandwidth: "16 TB Transfer (300 Mb/s port)",
        monthlyUSD: 12.99,
        renewalUSD: 28.99,
        monthlyINR: 1099,
        renewalINR: 2499,
        features: ["Production Microservices", "PostgreSQL in-memory buffer pool", "Multi-site Docker runtime"]
      },
      {
        name: "Hostinger KVM 8 (Powerhouse)",
        vcpu: "8 vCPU",
        ram: "32 GiB",
        storage: "400 GB NVMe",
        bandwidth: "32 TB Transfer (300 Mb/s port)",
        monthlyUSD: 25.99,
        renewalUSD: 49.99,
        monthlyINR: 2199,
        renewalINR: 4199,
        features: ["High-traffic E-commerce & SaaS", "32TB Unmetered Bandwidth", "Zero IOPS throttling"]
      },
      {
        name: "Cloud Startup (Managed hPanel)",
        vcpu: "2 vCPU",
        ram: "3 GiB",
        storage: "200 GB NVMe",
        bandwidth: "Unlimited Traffic",
        monthlyUSD: 9.99,
        renewalUSD: 19.99,
        monthlyINR: 799,
        renewalINR: 1599,
        features: ["Managed hPanel", "Built-in CDN", "Dedicated IP", "Free Domain & SSL"]
      },
      {
        name: "Cloud Professional",
        vcpu: "4 vCPU",
        ram: "6 GiB",
        storage: "250 GB NVMe",
        bandwidth: "Unlimited Traffic",
        monthlyUSD: 14.99,
        renewalUSD: 32.99,
        monthlyINR: 1199,
        renewalINR: 2699,
        features: ["Accelerated Cache", "Speed boost", "Priority Support 24/7"]
      },
      {
        name: "Cloud Enterprise",
        vcpu: "6 vCPU",
        ram: "12 GiB",
        storage: "300 GB NVMe",
        bandwidth: "Unlimited Traffic",
        monthlyUSD: 29.99,
        renewalUSD: 54.99,
        monthlyINR: 2299,
        renewalINR: 4599,
        features: ["Dedicated Resources", "Enterprise Cloud Infrastructure", "Global Anycast CDN"]
      }
    ],
    databaseOptions: [
      { name: "Containerized PostgreSQL on NVMe (Docker/Coolify)", monthlyUSD: 0.00, renewalUSD: 0.00 },
      { name: "Managed MariaDB/MySQL (via hPanel Cloud)", monthlyUSD: 0.00, renewalUSD: 0.00 }
    ],
    storageOptions: [
      { name: "Attached NVMe Storage", storageCostPerGB: 0.03, egressCostPerGB: 0.00 }
    ],
    egressRate: 0.0001,
    egressIncludedGB: 8192,
    managed: false,
    compliance: false,
    regions: ["india", "us", "europe", "global"],
    officialUrl: "https://www.hostinger.com/vps-hosting",
    pricingStatus: "verified",
    lastVerifiedDate: "2026-10-15",
    assumptions: "Introductory pricing based on 12/24/48-month terms; renewal rates published openly. Includes Mumbai and Singapore datacenters.",
    specialPrimitives: {
      aiAssistant: "Kodee AI Server Assistant (terminal prompts, issue diagnostics, Nginx tuning)",
      osTemplates: ["Docker on Ubuntu 24.04", "Coolify PaaS", "CyberPanel", "Debian 12", "AlmaLinux 9"],
      backupInfo: "Automated weekly backups included at zero charge; manual snapshots $1.99/mo",
      datacenters: ["Mumbai (India - Asia South)", "Singapore (Asia East)", "Paris (France)", "Vilnius (Lithuania)", "Phoenix (USA)", "São Paulo (Brazil)"],
      tcoDiscountNote: "Save up to 68% over 3-year TCO compared to AWS EC2 t4g/m6g with equivalent RAM."
    }
  },

  // 2. CONTABO (ULTRA-BUDGET)
  {
    id: "contabo",
    name: "Contabo Cloud VPS",
    category: "vps",
    tier: "Ultra-Budget Value",
    startingPrice: 5.50,
    pricingModel: "Monthly Flat Rate VPS",
    description: "Industry-leading raw compute and RAM allocation per dollar, ideal for staging, internal tools, and bootstrapper MVPs.",
    strengths: [
      "Massive memory allocation (8GB RAM on $5.50 entry plan)",
      "32 TB included monthly outbound traffic with unmetered inbound",
      "Worldwide locations including Germany, US, UK, India, and Singapore"
    ],
    risks: [
      "Shared noisy-neighbor disk I/O under heavy noisy write spikes",
      "Setup fee applied on monthly billing terms",
      "Unmanaged virtualization requiring manual patching and security tuning"
    ],
    computeOptions: [
      { name: "Cloud VPS S", vcpu: "4 vCPU", ram: "8 GiB", storage: "50 GB NVMe", bandwidth: "32 TB", monthlyUSD: 5.50, renewalUSD: 5.50 },
      { name: "Cloud VPS M", vcpu: "6 vCPU", ram: "16 GiB", storage: "100 GB NVMe", bandwidth: "32 TB", monthlyUSD: 11.00, renewalUSD: 11.00 },
      { name: "Cloud VPS L", vcpu: "8 vCPU", ram: "30 GiB", storage: "200 GB NVMe", bandwidth: "32 TB", monthlyUSD: 20.50, renewalUSD: 20.50 },
      { name: "Cloud VPS XL", vcpu: "10 vCPU", ram: "60 GiB", storage: "400 GB NVMe", bandwidth: "32 TB", monthlyUSD: 41.00, renewalUSD: 41.00 }
    ],
    databaseOptions: [
      { name: "Self-hosted PostgreSQL Container", monthlyUSD: 0.00 }
    ],
    egressRate: 0.001,
    egressIncludedGB: 32768,
    managed: false,
    compliance: false,
    regions: ["europe", "us", "india", "global"],
    officialUrl: "https://contabo.com/en/vps/",
    pricingStatus: "verified",
    lastVerifiedDate: "2026-10-15",
    assumptions: "Flat monthly pricing without sudden renewal jumps. Region location fees may apply for India/Singapore."
  },

  // 3. HETZNER (DEVELOPER PERFORMANCE)
  {
    id: "hetzner",
    name: "Hetzner Cloud",
    category: "vps",
    tier: "Developer Benchmark",
    startingPrice: 4.50,
    pricingModel: "Hourly / Monthly flat rate",
    description: "Exceptional single-core CPU speed, low hypervisor overhead, and 20 TB unmetered bandwidth in European and US datacenters.",
    strengths: [
      "Top-tier Geekbench CPU scores per dollar with AMD EPYC and Ampere Altra ARM",
      "20 TB included monthly bandwidth with transparent €1/TB overage",
      "Modern API, Cloud CLI, and official Terraform provider"
    ],
    risks: [
      "No native datacenters in India, Southeast Asia, or South America",
      "Self-managed OS, networking, and snapshot storage"
    ],
    computeOptions: [
      { name: "CX22", vcpu: "2 vCPU", ram: "4 GiB", storage: "40 GB NVMe", bandwidth: "20 TB", monthlyUSD: 4.50 },
      { name: "CPX31", vcpu: "4 vCPU", ram: "8 GiB", storage: "160 GB NVMe", bandwidth: "20 TB", monthlyUSD: 14.80 },
      { name: "CAX21 (ARM)", vcpu: "4 vCPU", ram: "8 GiB", storage: "80 GB NVMe", bandwidth: "20 TB", monthlyUSD: 7.90 }
    ],
    databaseOptions: [
      { name: "Self-managed PostgreSQL on CX22", monthlyUSD: 4.50 }
    ],
    egressRate: 0.001,
    egressIncludedGB: 20480,
    managed: false,
    compliance: false,
    regions: ["europe", "us"],
    officialUrl: "https://www.hetzner.com/cloud/",
    pricingStatus: "verified",
    lastVerifiedDate: "2026-10-15",
    assumptions: "Billed in EUR, converted to USD at 1 EUR = 1.08 USD."
  },

  // 4. DIGITALOCEAN (BALANCED VALUE PAAS)
  {
    id: "digitalocean",
    name: "DigitalOcean",
    category: "paas",
    tier: "Balanced Developer PaaS",
    startingPrice: 12.00,
    pricingModel: "Hourly / Monthly flat droplet & managed service pricing",
    description: "Developer-first cloud with turnkey managed PostgreSQL, Redis, DOKS (Kubernetes), and Spaces object storage.",
    strengths: [
      "Turnkey managed PostgreSQL with automated daily backups, standby nodes, and point-in-time recovery",
      "Datacenter in Bangalore (BLR1), Singapore (SGP1), Frankfurt, New York, London",
      "Simple predictable VPC private networking with zero internal transfer fees"
    ],
    risks: [
      "Egress over pool charged at $0.01/GB",
      "Managed databases have discrete compute jumps when scaling RAM"
    ],
    computeOptions: [
      { name: "Basic Droplet 2GB", vcpu: "1 vCPU", ram: "2 GiB", storage: "50 GB SSD", bandwidth: "2 TB", monthlyUSD: 12.00 },
      { name: "Premium AMD 4GB", vcpu: "2 vCPU", ram: "4 GiB", storage: "80 GB NVMe", bandwidth: "4 TB", monthlyUSD: 28.00 },
      { name: "DOKS Managed Kubernetes Node", vcpu: "2 vCPU", ram: "4 GiB", storage: "80 GB NVMe", bandwidth: "4 TB", monthlyUSD: 28.00 }
    ],
    databaseOptions: [
      { name: "Managed PostgreSQL 1-Node (2GB RAM)", monthlyUSD: 30.00 },
      { name: "Managed PostgreSQL Multi-Node HA (4GB RAM)", monthlyUSD: 90.00 },
      { name: "Managed Redis Cache (1GB RAM)", monthlyUSD: 15.00 }
    ],
    storageOptions: [
      { name: "Spaces Object Storage (250GB included)", storageCostPerGB: 0.02, egressCostPerGB: 0.01 }
    ],
    egressRate: 0.01,
    egressIncludedGB: 2048,
    managed: true,
    compliance: true,
    regions: ["india", "us", "europe", "global"],
    officialUrl: "https://www.digitalocean.com/pricing",
    pricingStatus: "verified",
    lastVerifiedDate: "2026-10-15",
    assumptions: "Bangalore (BLR1) and US regions pricing aligned."
  },

  // 5. AKAMAI LINODE
  {
    id: "linode",
    name: "Akamai Linode",
    category: "paas",
    tier: "Balanced Cloud",
    startingPrice: 12.00,
    pricingModel: "Hourly / Monthly flat rates",
    description: "Global compute, LKE (Linode Kubernetes Engine with free control plane), and integrated Akamai CDN edge.",
    strengths: [
      "Free Kubernetes control plane on LKE",
      "Global network backed by Akamai edge backbone",
      "Mumbai and Chennai datacenter presence"
    ],
    risks: [
      "Managed databases have higher starting price than self-hosted",
      "Egress overage billed at $0.005–$0.01/GB"
    ],
    computeOptions: [
      { name: "Linode 2GB", vcpu: "1 vCPU", ram: "2 GiB", storage: "50 GB SSD", bandwidth: "2 TB", monthlyUSD: 12.00 },
      { name: "Linode 4GB", vcpu: "2 vCPU", ram: "4 GiB", storage: "80 GB SSD", bandwidth: "4 TB", monthlyUSD: 24.00 },
      { name: "Dedicated 4GB CPU", vcpu: "2 vCPU", ram: "4 GiB", storage: "80 GB SSD", bandwidth: "4 TB", monthlyUSD: 30.00 }
    ],
    databaseOptions: [
      { name: "Managed MySQL/Postgres 1-Node", monthlyUSD: 15.00 },
      { name: "Managed HA Database Cluster", monthlyUSD: 45.00 }
    ],
    egressRate: 0.005,
    egressIncludedGB: 2048,
    managed: true,
    compliance: true,
    regions: ["india", "us", "europe", "global"],
    officialUrl: "https://www.linode.com/pricing/",
    pricingStatus: "verified",
    lastVerifiedDate: "2026-10-15",
    assumptions: "Flat monthly pricing across all 11 global regions."
  },

  // 6. AWS (ENTERPRISE SCALABILITY)
  {
    id: "aws",
    name: "Amazon Web Services (AWS)",
    category: "hyperscaler",
    tier: "Enterprise Scalability",
    startingPrice: 45.00,
    pricingModel: "Pay-as-you-go & Reserved Instances",
    description: "Industry benchmark for compliance, multi-AZ synchronous replication, granular IAM governance, and hundreds of modular cloud services.",
    strengths: [
      "SOC 2 Type II, ISO 27001, HIPAA, FedRAMP, and PCI-DSS compliance certifications",
      "AWS RDS Multi-AZ synchronous replication with sub-60s automated failover",
      "PrivateLink, AWS WAF, KMS hardware encryption, and AWS Secrets Manager"
    ],
    risks: [
      "Egress network transfer billed at $0.09/GB after first 100 GB",
      "NAT Gateways cost ~$32.85/month per AZ + $0.045/GB data processing fees",
      "CloudWatch logs and telemetry bills compound on high-throughput microservices"
    ],
    computeOptions: [
      { name: "EC2 t4g.small (Graviton2)", vcpu: "2 vCPU", ram: "2 GiB", storage: "EBS gp3 separate", bandwidth: "100 GB incl.", monthlyUSD: 14.60 },
      { name: "EC2 t4g.medium (Graviton2)", vcpu: "2 vCPU", ram: "4 GiB", storage: "EBS gp3 separate", bandwidth: "100 GB incl.", monthlyUSD: 29.20 },
      { name: "EC2 m6g.large (Graviton2)", vcpu: "2 vCPU", ram: "8 GiB", storage: "EBS gp3 separate", bandwidth: "100 GB incl.", monthlyUSD: 58.40 },
      { name: "EKS Managed Cluster Control Plane", vcpu: "Managed", ram: "Managed", storage: "N/A", bandwidth: "VPC", monthlyUSD: 73.00 }
    ],
    databaseOptions: [
      { name: "RDS PostgreSQL db.t4g.medium Multi-AZ", monthlyUSD: 130.00 },
      { name: "RDS PostgreSQL db.m6g.large Multi-AZ", monthlyUSD: 260.00 },
      { name: "ElastiCache Redis cache.t4g.medium (Multi-AZ)", monthlyUSD: 48.00 }
    ],
    storageOptions: [
      { name: "Amazon S3 Standard", storageCostPerGB: 0.023, egressCostPerGB: 0.09 }
    ],
    egressRate: 0.09,
    egressIncludedGB: 100,
    managed: true,
    compliance: true,
    regions: ["us", "europe", "india", "global"],
    officialUrl: "https://aws.amazon.com/pricing/",
    pricingStatus: "verified",
    lastVerifiedDate: "2026-10-15",
    assumptions: "On-demand pricing based on US East / EU Central / Mumbai benchmarks. Excludes enterprise EDP commitments."
  },

  // 7. GOOGLE CLOUD PLATFORM
  {
    id: "gcp",
    name: "Google Cloud Platform",
    category: "hyperscaler",
    tier: "Enterprise Scalability",
    startingPrice: 48.00,
    pricingModel: "Pay-as-you-go + Sustained Use Discounts",
    description: "Industry-leading managed Kubernetes (GKE Autopilot), BigQuery data intelligence, and high-performance global network backbone.",
    strengths: [
      "GKE Autopilot managed control plane with per-pod pricing",
      "Google Global Fiber Network routing traffic directly to edge PoPs",
      "Cloud SQL with automatic storage increases and zero-downtime maintenance"
    ],
    risks: [
      "Premium Tier internet egress transfer at $0.12/GB",
      "Inter-zone cross-traffic fees inside Kubernetes clusters"
    ],
    computeOptions: [
      { name: "e2-medium", vcpu: "2 vCPU", ram: "4 GiB", storage: "Persistent Disk separate", bandwidth: "100 GB incl.", monthlyUSD: 24.50 },
      { name: "e2-standard-2", vcpu: "2 vCPU", ram: "8 GiB", storage: "Persistent Disk separate", bandwidth: "100 GB incl.", monthlyUSD: 49.00 },
      { name: "GKE Autopilot Cluster Management", vcpu: "Managed", ram: "Managed", storage: "N/A", bandwidth: "VPC", monthlyUSD: 74.40 }
    ],
    databaseOptions: [
      { name: "Cloud SQL PostgreSQL 2 vCPU 8GB RAM HA", monthlyUSD: 145.00 },
      { name: "Cloud Memorystore for Redis 2GB", monthlyUSD: 35.00 }
    ],
    storageOptions: [
      { name: "Google Cloud Storage Standard", storageCostPerGB: 0.020, egressCostPerGB: 0.12 }
    ],
    egressRate: 0.12,
    egressIncludedGB: 100,
    managed: true,
    compliance: true,
    regions: ["us", "europe", "india", "global"],
    officialUrl: "https://cloud.google.com/pricing",
    pricingStatus: "verified",
    lastVerifiedDate: "2026-10-15",
    assumptions: "Standard e2 instance types with persistent SSD disks in us-central1 and asia-south1."
  },

  // 8. MICROSOFT AZURE
  {
    id: "azure",
    name: "Microsoft Azure",
    category: "hyperscaler",
    tier: "Enterprise Scalability",
    startingPrice: 50.00,
    pricingModel: "Pay-as-you-go & Azure Hybrid Benefit",
    description: "Enterprise integration with Microsoft Entra ID (Active Directory), AKS (Azure Kubernetes Service), and Azure PostgreSQL Flexible Server.",
    strengths: [
      "Seamless integration with enterprise Active Directory and Microsoft 365",
      "Azure Hybrid Benefit discounts for existing Windows Server/SQL Server licenses",
      "Datacenters in 60+ global regions including Central India (Pune) and South India (Chennai)"
    ],
    risks: [
      "Virtual network gateway and firewall costs accumulate quickly",
      "Outbound data transfer billed at ~$0.087/GB"
    ],
    computeOptions: [
      { name: "B2s", vcpu: "2 vCPU", ram: "4 GiB", storage: "Standard SSD separate", bandwidth: "100 GB incl.", monthlyUSD: 29.20 },
      { name: "D2s_v5", vcpu: "2 vCPU", ram: "8 GiB", storage: "Premium SSD separate", bandwidth: "100 GB incl.", monthlyUSD: 70.00 }
    ],
    databaseOptions: [
      { name: "Azure PostgreSQL Flexible Server HA", monthlyUSD: 138.00 },
      { name: "Azure Cache for Redis Standard (1GB)", monthlyUSD: 38.00 }
    ],
    storageOptions: [
      { name: "Azure Blob Storage Hot Tier", storageCostPerGB: 0.018, egressCostPerGB: 0.087 }
    ],
    egressRate: 0.087,
    egressIncludedGB: 100,
    managed: true,
    compliance: true,
    regions: ["us", "europe", "india", "global"],
    officialUrl: "https://azure.microsoft.com/pricing/",
    pricingStatus: "verified",
    lastVerifiedDate: "2026-10-15",
    assumptions: "Linux VM pricing in East US and Central India."
  },

  // 9. SPECIALIZED PERSISTENCE & STORAGE: SUPABASE, NEON, PLANETSCALE, CLOUDFLARE
  {
    id: "supabase",
    name: "Supabase",
    category: "database",
    tier: "Serverless Database",
    startingPrice: 25.00,
    pricingModel: "Tiered Platform Subscription",
    description: "Open source Firebase alternative: Managed Postgres, Auth, Instant Realtime WebSockets, and pgvector for AI applications.",
    strengths: [
      "PostgreSQL with turnkey Auth, Row Level Security, and Realtime CDC",
      "Built-in pgvector extension for LLM embeddings and similarity search",
      "Automated daily backups and point-in-time recovery"
    ],
    risks: [
      "Pro plan includes 8GB database space; disk overage billed at $0.125/GB",
      "Compute upgrades have fixed price tiers"
    ],
    databaseOptions: [
      { name: "Supabase Pro (8GB DB, 250GB Egress)", monthlyUSD: 25.00 },
      { name: "Supabase Pro + Compute Add-on (Small)", monthlyUSD: 35.00 }
    ],
    egressRate: 0.09,
    egressIncludedGB: 250,
    managed: true,
    compliance: true,
    regions: ["us", "europe", "india", "global"],
    officialUrl: "https://supabase.com/pricing",
    pricingStatus: "verified",
    lastVerifiedDate: "2026-10-15",
    assumptions: "Pro tier flat monthly platform fee."
  },
  {
    id: "neon",
    name: "Neon Serverless Postgres",
    category: "database",
    tier: "Serverless Autoscaling",
    startingPrice: 19.00,
    pricingModel: "Autoscaling Compute Units (CU)",
    description: "Serverless Postgres with separated compute and storage, instant database branching, and scale-to-zero capability.",
    strengths: [
      "Instant copy-on-write database branches for PR preview environments",
      "Autoscales compute from 0.25 to 8 CU dynamically with incoming traffic",
      "High storage durability on multi-tenant AWS NVMe storage"
    ],
    risks: [
      "Cold-start latency if database scales to zero (mitigated by setting min CU = 0.5)",
      "High sustained QPS workloads can exceed fixed-size VPS database costs"
    ],
    databaseOptions: [
      { name: "Neon Launch Plan (10GB storage, autoscaling CU)", monthlyUSD: 19.00 },
      { name: "Neon Scale Plan (50GB storage, 750 CU-hrs)", monthlyUSD: 69.00 }
    ],
    egressRate: 0.09,
    egressIncludedGB: 50,
    managed: true,
    compliance: true,
    regions: ["us", "europe", "global"],
    officialUrl: "https://neon.tech/pricing",
    pricingStatus: "verified",
    lastVerifiedDate: "2026-10-15",
    assumptions: "Autoscaling compute unit pricing with 10GB included storage."
  },
  {
    id: "cloudflare",
    name: "Cloudflare (CDN, WAF & R2)",
    category: "edge",
    tier: "Edge Optimization",
    startingPrice: 0.00,
    pricingModel: "Freemium Edge + $0 Egress Object Storage",
    description: "Global Anycast edge network with unmetered DDoS mitigation, Edge WAF, and Cloudflare R2 object storage with zero billable egress fees.",
    strengths: [
      "Zero dollar per GB outbound bandwidth egress on Cloudflare R2",
      "Anycast routing in 300+ cities globally, terminating TLS close to end users",
      "Free SSL, unmetered L3/L4 DDoS mitigation, and HTTP/3 support"
    ],
    risks: [
      "Pro plan required for advanced Web Application Firewall managed rule groups ($20/mo)",
      "R2 Class A operations ($4.50/million) and Class B operations ($0.36/million)"
    ],
    storageOptions: [
      { name: "Cloudflare R2 Object Storage", storageCostPerGB: 0.015, egressCostPerGB: 0.00 }
    ],
    egressRate: 0.00,
    egressIncludedGB: 1000000,
    managed: true,
    compliance: true,
    regions: ["global"],
    officialUrl: "https://www.cloudflare.com/plans/",
    pricingStatus: "verified",
    lastVerifiedDate: "2026-10-15",
    assumptions: "Free tier for CDN/DNS; R2 billed at $0.015/GB storage with 100% free egress."
  }
];
