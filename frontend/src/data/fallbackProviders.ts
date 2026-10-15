import { ProviderItem } from "../types";

export const FALLBACK_PROVIDERS: ProviderItem[] = [
  {
    id: "aws",
    name: "Amazon Web Services",
    category: "hyperscaler",
    tier: "Enterprise Scalability",
    startingPrice: 45,
    pricingModel: "Pay-as-you-go & Reserved Instances",
    description: "Broad compute (EC2), managed databases (RDS Multi-AZ), global VPC networking, IAM governance, and enterprise compliance.",
    strengths: [
      "SOC 2, ISO 27001, HIPAA, PCI-DSS compliance certifications",
      "Multi-AZ synchronous replication with automated failover",
      "Granular IAM policies, KMS encryption, VPC PrivateLink"
    ],
    risks: [
      "Egress network transfer billed at ~$0.09/GB after first 100 GB",
      "NAT Gateways cost ~$32/month per AZ plus $0.045/GB data processing fee",
      "CloudWatch logs and managed database metrics can compound costs"
    ],
    computeOptions: [
      { name: "t4g.small", vcpu: "2 vCPU", ram: "2 GiB", monthlyUSD: 14.60 },
      { name: "t4g.medium", vcpu: "2 vCPU", ram: "4 GiB", monthlyUSD: 29.20 },
      { name: "m6g.large", vcpu: "2 vCPU", ram: "8 GiB", monthlyUSD: 58.40 }
    ],
    databaseOptions: [
      { name: "RDS PostgreSQL db.t4g.medium Multi-AZ", monthlyUSD: 130.00 }
    ],
    egressRate: 0.09,
    egressIncludedGB: 100,
    managed: true,
    compliance: true,
    regions: ["us", "europe", "india", "global"],
    officialUrl: "https://aws.amazon.com/pricing/",
    pricingStatus: "verified",
    lastVerifiedDate: "2026-10-15",
    assumptions: "On-demand pricing based on US East / EU Central / Mumbai benchmarks."
  },
  {
    id: "hetzner",
    name: "Hetzner Cloud",
    category: "vps",
    tier: "Ultra-Budget",
    startingPrice: 4.50,
    pricingModel: "Hourly / Monthly flat rate",
    description: "High price-to-performance virtual cloud servers with 20 TB included bandwidth per machine.",
    strengths: [
      "Exceptional CPU and NVMe performance per dollar",
      "20 TB monthly outbound transfer included on every server",
      "Predictable monthly invoices with no surprise egress spikes"
    ],
    risks: [
      "Locations concentrated in Germany, Finland, and US",
      "No native India or Asia Pacific datacenters",
      "Self-managed OS, firewalls, and database maintenance"
    ],
    computeOptions: [
      { name: "CX22", vcpu: "2 vCPU", ram: "4 GiB", monthlyUSD: 4.50 },
      { name: "CPX31", vcpu: "4 vCPU", ram: "8 GiB", monthlyUSD: 14.80 }
    ],
    databaseOptions: [
      { name: "Self-hosted PostgreSQL on CX22", monthlyUSD: 4.50 }
    ],
    egressRate: 0.001,
    egressIncludedGB: 20480,
    managed: false,
    compliance: false,
    regions: ["europe", "us"],
    officialUrl: "https://www.hetzner.com/cloud/",
    pricingStatus: "verified",
    lastVerifiedDate: "2026-10-15",
    assumptions: "Standard EUR conversion."
  },
  {
    id: "digitalocean",
    name: "DigitalOcean",
    category: "vps",
    tier: "Balanced Value",
    startingPrice: 12,
    pricingModel: "Hourly / Monthly flat droplet & managed service pricing",
    description: "Simple cloud infrastructure for developers: Droplets, managed PostgreSQL/Redis, Spaces S3-compatible storage, and App Platform.",
    strengths: [
      "Intuitive developer experience and clean management console",
      "Managed databases with automatic daily backups and standby failover",
      "Datacenters in Bangalore (BLR1), Frankfurt, New York, San Francisco, London"
    ],
    risks: [
      "Bandwidth pool overage charged at $0.01/GB",
      "Managed databases cost significantly more than equivalent raw droplets"
    ],
    computeOptions: [
      { name: "Basic Droplet 2GB", vcpu: "1 vCPU", ram: "2 GiB", monthlyUSD: 12.00 },
      { name: "Premium AMD 4GB", vcpu: "2 vCPU", ram: "4 GiB", monthlyUSD: 28.00 }
    ],
    databaseOptions: [
      { name: "Managed PostgreSQL (1 Node)", monthlyUSD: 30.00 }
    ],
    egressRate: 0.01,
    egressIncludedGB: 2048,
    managed: true,
    compliance: false,
    regions: ["india", "europe", "us", "global"],
    officialUrl: "https://www.digitalocean.com/pricing",
    pricingStatus: "verified",
    lastVerifiedDate: "2026-10-15",
    assumptions: "Pricing reflects regular droplets and standard managed DB tier."
  },
  {
    id: "contabo",
    name: "Contabo",
    category: "vps",
    tier: "Ultra-Budget",
    startingPrice: 5.50,
    pricingModel: "Monthly subscription with fixed disk/RAM packages",
    description: "High-memory VPS plans suited to Docker, staging clusters, and consolidated services with 32 TB bandwidth.",
    strengths: [
      "Massive memory allocation (8GB–32GB RAM at baseline prices)",
      "Datacenters in EU, US, UK, and Mumbai, India",
      "32 TB included bandwidth on baseline VPS"
    ],
    risks: [
      "Shared CPU contention under peak multi-tenant load",
      "Support response SLAs geared for budget tier"
    ],
    computeOptions: [
      { name: "Cloud VPS S", vcpu: "4 vCPU", ram: "8 GiB", monthlyUSD: 5.50 }
    ],
    databaseOptions: [],
    egressRate: 0.001,
    egressIncludedGB: 32768,
    managed: false,
    compliance: false,
    regions: ["india", "europe", "us"],
    officialUrl: "https://contabo.com/en/vps/",
    pricingStatus: "verified",
    lastVerifiedDate: "2026-10-15",
    assumptions: "Standard monthly billing."
  },
  {
    id: "supabase",
    name: "Supabase",
    category: "database",
    tier: "Balanced Value",
    startingPrice: 25,
    pricingModel: "Tiered platform plan with compute add-ons",
    description: "Open-source Firebase alternative: dedicated PostgreSQL backend, Supavisor connection pooler, Row Level Security, Auth, and Storage.",
    strengths: [
      "Integrated Row Level Security (RLS) protects APIs without backend boilerplate",
      "Supavisor connection pooler handles 10,000+ client connections without memory leaks"
    ],
    risks: [
      "Disk storage over 8 GB and compute upgrades incur charges",
      "Egress over 250 GB billed at $0.09/GB"
    ],
    computeOptions: [],
    databaseOptions: [
      { name: "Supabase Pro (Shared Compute)", monthlyUSD: 25.00 }
    ],
    egressRate: 0.09,
    egressIncludedGB: 250,
    managed: true,
    compliance: false,
    regions: ["us", "europe", "india", "global"],
    officialUrl: "https://supabase.com/pricing",
    pricingStatus: "verified",
    lastVerifiedDate: "2026-10-15",
    assumptions: "Pro tier ($25/mo) baseline."
  },
  {
    id: "neon",
    name: "Neon",
    category: "database",
    tier: "Balanced Value",
    startingPrice: 19,
    pricingModel: "Serverless compute units & active storage hours",
    description: "Serverless PostgreSQL with instant database branching for CI/CD, point-in-time recovery, autoscaling compute, and scale-to-zero.",
    strengths: [
      "Instant database branch creation for preview deployments and staging",
      "Scales compute to zero during idle periods to eliminate wasted spend"
    ],
    risks: [
      "Cold-start latency (~500ms–1.5s) when waking an idle branch"
    ],
    computeOptions: [],
    databaseOptions: [
      { name: "Neon Launch Plan", monthlyUSD: 19.00 }
    ],
    egressRate: 0.09,
    egressIncludedGB: 50,
    managed: true,
    compliance: false,
    regions: ["us", "europe", "india", "global"],
    officialUrl: "https://neon.tech/pricing",
    pricingStatus: "verified",
    lastVerifiedDate: "2026-10-15",
    assumptions: "Launch plan includes 10 GB storage and 300 compute hours."
  },
  {
    id: "cloudflare-r2",
    name: "Cloudflare R2",
    category: "storage",
    tier: "Ultra-Budget",
    startingPrice: 0,
    pricingModel: "$0.015/GB-month storage; ZERO egress bandwidth fees",
    description: "S3-compatible object storage designed to eliminate cloud egress lock-in, integrated with Cloudflare global CDN edge network.",
    strengths: [
      "Zero dollar per-GB egress fee to the public internet",
      "Native S3 API compatibility for drops-in replacement of AWS S3"
    ],
    risks: [
      "Class A write operations billed at $4.50 per million operations"
    ],
    computeOptions: [],
    databaseOptions: [],
    egressRate: 0.00,
    egressIncludedGB: 1000000,
    managed: true,
    compliance: true,
    regions: ["global"],
    officialUrl: "https://developers.cloudflare.com/r2/pricing/",
    pricingStatus: "verified",
    lastVerifiedDate: "2026-10-15",
    assumptions: "Storage at $0.015/GB; zero bandwidth fees."
  }
];
