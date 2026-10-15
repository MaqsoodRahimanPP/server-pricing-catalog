"use strict";

const PROVIDER_CATALOG = [
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
      { name: "RDS PostgreSQL db.t4g.medium Multi-AZ", monthlyUSD: 130.00 },
      { name: "RDS PostgreSQL db.m6g.large Multi-AZ", monthlyUSD: 260.00 }
    ],
    egressRate: 0.09,
    egressIncludedGB: 100,
    natGatewayMonthlyUSD: 32.85,
    managed: true,
    compliance: true,
    regions: ["us", "europe", "india", "global"],
    officialUrl: "https://aws.amazon.com/pricing/",
    pricingStatus: "verified",
    lastVerifiedDate: "2026-10-15",
    assumptions: "On-demand pricing based on US East / EU Central / Mumbai benchmarks. Excludes enterprise discounts."
  },
  {
    id: "gcp",
    name: "Google Cloud Platform",
    category: "hyperscaler",
    tier: "Enterprise Scalability",
    startingPrice: 48,
    pricingModel: "Sustained use discounts & committed use contracts",
    description: "Industry-leading managed Kubernetes (GKE), Google global fiber backbone, Cloud SQL, and big data intelligence.",
    strengths: [
      "GKE Autopilot managed control plane and node auto-provisioning",
      "High-throughput global private network backbone",
      "Robust data analytics and BigQuery integration"
    ],
    risks: [
      "Premium tier egress transfer at ~$0.12/GB",
      "Inter-zone and inter-region data transfer fees"
    ],
    computeOptions: [
      { name: "e2-medium", vcpu: "2 vCPU", ram: "4 GiB", monthlyUSD: 24.50 },
      { name: "e2-standard-2", vcpu: "2 vCPU", ram: "8 GiB", monthlyUSD: 49.00 }
    ],
    databaseOptions: [
      { name: "Cloud SQL PostgreSQL 2 vCPU 8 GiB HA", monthlyUSD: 145.00 }
    ],
    egressRate: 0.12,
    egressIncludedGB: 100,
    natGatewayMonthlyUSD: 32.00,
    managed: true,
    compliance: true,
    regions: ["us", "europe", "india", "global"],
    officialUrl: "https://cloud.google.com/pricing",
    pricingStatus: "verified",
    lastVerifiedDate: "2026-10-15",
    assumptions: "Standard e2 instance types with persistent SSD disks."
  },
  {
    id: "azure",
    name: "Microsoft Azure",
    category: "hyperscaler",
    tier: "Enterprise Scalability",
    startingPrice: 50,
    pricingModel: "Pay-as-you-go & Azure Hybrid Benefit",
    description: "Enterprise cloud deeply integrated with Microsoft Entra ID, Azure Kubernetes Service (AKS), and Azure Database for PostgreSQL.",
    strengths: [
      "Native Entra ID (Azure AD) enterprise single sign-on",
      "Enterprise agreements and hybrid Windows/Linux server benefits",
      "Global datacenter availability in 60+ regions"
    ],
    risks: [
      "Virtual network gateways and firewall charges",
      "Egress bandwidth costs (~$0.087/GB)"
    ],
    computeOptions: [
      { name: "B2s", vcpu: "2 vCPU", ram: "4 GiB", monthlyUSD: 29.20 },
      { name: "D2s_v5", vcpu: "2 vCPU", ram: "8 GiB", monthlyUSD: 70.00 }
    ],
    databaseOptions: [
      { name: "Azure Flexible Server PostgreSQL HA", monthlyUSD: 138.00 }
    ],
    egressRate: 0.087,
    egressIncludedGB: 100,
    natGatewayMonthlyUSD: 32.85,
    managed: true,
    compliance: true,
    regions: ["us", "europe", "india", "global"],
    officialUrl: "https://azure.microsoft.com/pricing/",
    pricingStatus: "verified",
    lastVerifiedDate: "2026-10-15",
    assumptions: "Linux VM pricing in Central US / North Europe / Central India."
  },
  {
    id: "hetzner",
    name: "Hetzner Cloud",
    category: "vps",
    tier: "Ultra-Budget",
    startingPrice: 4.50,
    pricingModel: "Hourly / Monthly flat rate",
    description: "High price-to-performance virtual cloud servers, dedicated root servers, and generous 20 TB included bandwidth per machine.",
    strengths: [
      "Exceptional CPU and NVMe performance per dollar",
      "20 TB monthly outbound transfer included on every server",
      "Predictable monthly invoices with no surprise egress spikes"
    ],
    risks: [
      "Locations concentrated in Germany, Finland, and US (Ashburn/Hillsboro)",
      "No native India or Asia Pacific datacenters",
      "Self-managed OS, firewalls, and database maintenance"
    ],
    computeOptions: [
      { name: "CX22", vcpu: "2 vCPU", ram: "4 GiB", monthlyUSD: 4.50 },
      { name: "CPX31", vcpu: "4 vCPU", ram: "8 GiB", monthlyUSD: 14.80 },
      { name: "CCX23 Dedicated", vcpu: "4 vCPU", ram: "16 GiB", monthlyUSD: 42.00 }
    ],
    databaseOptions: [
      { name: "Self-hosted PostgreSQL on CX22", monthlyUSD: 4.50 }
    ],
    egressRate: 0.001,
    egressIncludedGB: 20480,
    natGatewayMonthlyUSD: 0,
    managed: false,
    compliance: false,
    regions: ["europe", "us"],
    officialUrl: "https://www.hetzner.com/cloud/",
    pricingStatus: "verified",
    lastVerifiedDate: "2026-10-15",
    assumptions: "Converted from EUR (€3.79/mo) at standard 1.18 USD rate."
  },
  {
    id: "contabo",
    name: "Contabo",
    category: "vps",
    tier: "Ultra-Budget",
    startingPrice: 5.50,
    pricingModel: "Monthly subscription with fixed disk/RAM packages",
    description: "Industry-leading RAM allocations per dollar for Docker hosts, self-hosted applications, and staging environments.",
    strengths: [
      "Massive memory allocation (8GB–32GB RAM at baseline prices)",
      "Datacenters available in EU, US, UK, and Mumbai, India",
      "32 TB included bandwidth on baseline VPS"
    ],
    risks: [
      "Shared CPU contention under peak multi-tenant load",
      "Support response SLAs geared for budget tier",
      "Unmanaged infrastructure requiring sysadmin expertise"
    ],
    computeOptions: [
      { name: "Cloud VPS S", vcpu: "4 vCPU", ram: "8 GiB", monthlyUSD: 5.50 },
      { name: "Cloud VPS M", vcpu: "6 vCPU", ram: "16 GiB", monthlyUSD: 11.50 }
    ],
    databaseOptions: [
      { name: "Self-hosted PostgreSQL on Cloud VPS S", monthlyUSD: 5.50 }
    ],
    egressRate: 0.001,
    egressIncludedGB: 32768,
    natGatewayMonthlyUSD: 0,
    managed: false,
    compliance: false,
    regions: ["india", "europe", "us"],
    officialUrl: "https://contabo.com/en/vps/",
    pricingStatus: "verified",
    lastVerifiedDate: "2026-10-15",
    assumptions: "Standard monthly billing, Mumbai datacenter location fee may add small regional surcharge."
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
      { name: "Premium AMD 4GB", vcpu: "2 vCPU", ram: "4 GiB", monthlyUSD: 28.00 },
      { name: "General Purpose 8GB", vcpu: "2 vCPU", ram: "8 GiB", monthlyUSD: 63.00 }
    ],
    databaseOptions: [
      { name: "Managed PostgreSQL (1 Node)", monthlyUSD: 30.00 },
      { name: "Managed PostgreSQL HA (2 Nodes)", monthlyUSD: 60.00 }
    ],
    egressRate: 0.01,
    egressIncludedGB: 2048,
    natGatewayMonthlyUSD: 0,
    managed: true,
    compliance: false,
    regions: ["india", "europe", "us", "global"],
    officialUrl: "https://www.digitalocean.com/pricing",
    pricingStatus: "verified",
    lastVerifiedDate: "2026-10-15",
    assumptions: "Pricing reflects regular droplets and standard managed DB tier."
  },
  {
    id: "linode",
    name: "Akamai Cloud (Linode)",
    category: "vps",
    tier: "Balanced Value",
    startingPrice: 15,
    pricingModel: "Straightforward monthly compute plans",
    description: "Reliable virtual machines with dedicated CPU options, backed by Akamai's global edge network and DDoS mitigation.",
    strengths: [
      "Transparent flat-rate pricing with generous transfer allowances",
      "Global backbone connected directly to Akamai edge network",
      "Datacenter presence in Mumbai, Frankfurt, Singapore, Dallas, Newark"
    ],
    risks: [
      "Smaller catalog of high-level managed serverless PaaS primitives",
      "Managed database options are single-region focused"
    ],
    computeOptions: [
      { name: "Shared 2GB", vcpu: "1 vCPU", ram: "2 GiB", monthlyUSD: 12.00 },
      { name: "Dedicated 4GB", vcpu: "2 vCPU", ram: "4 GiB", monthlyUSD: 30.00 },
      { name: "Dedicated 8GB", vcpu: "4 vCPU", ram: "8 GiB", monthlyUSD: 60.00 }
    ],
    databaseOptions: [
      { name: "Managed PostgreSQL Cluster", monthlyUSD: 40.00 }
    ],
    egressRate: 0.005,
    egressIncludedGB: 4000,
    natGatewayMonthlyUSD: 0,
    managed: true,
    compliance: false,
    regions: ["india", "europe", "us", "global"],
    officialUrl: "https://www.linode.com/pricing/",
    pricingStatus: "verified",
    lastVerifiedDate: "2026-10-15",
    assumptions: "Standard pricing across global datacenters."
  },
  {
    id: "vultr",
    name: "Vultr",
    category: "vps",
    tier: "Balanced Value",
    startingPrice: 12,
    pricingModel: "Hourly / Monthly cloud compute",
    description: "High-frequency compute instances, managed Kubernetes, bare metal, and 32 global cloud regions including Mumbai and Delhi.",
    strengths: [
      "Extensive global datacenter presence in 32 locations worldwide",
      "High frequency NVMe compute instances with high single-thread clock speed",
      "Managed databases and Kubernetes available"
    ],
    risks: [
      "Bandwidth pricing varies in specific emerging regions",
      "Automatic backups add 20% surcharge to compute cost"
    ],
    computeOptions: [
      { name: "Cloud Compute 2GB", vcpu: "1 vCPU", ram: "2 GiB", monthlyUSD: 10.00 },
      { name: "High Frequency 4GB", vcpu: "2 vCPU", ram: "4 GiB", monthlyUSD: 24.00 }
    ],
    databaseOptions: [
      { name: "Managed PostgreSQL 1 vCPU 2GB", monthlyUSD: 25.00 }
    ],
    egressRate: 0.01,
    egressIncludedGB: 3000,
    natGatewayMonthlyUSD: 0,
    managed: true,
    compliance: false,
    regions: ["india", "europe", "us", "global"],
    officialUrl: "https://www.vultr.com/pricing/",
    pricingStatus: "verified",
    lastVerifiedDate: "2026-10-15",
    assumptions: "High-frequency instance rates with standard bandwidth."
  },
  {
    id: "ovh",
    name: "OVHcloud",
    category: "vps",
    tier: "Balanced Value",
    startingPrice: 4.20,
    pricingModel: "Monthly unmetered bandwidth plans",
    description: "European sovereign cloud provider featuring unmetered bandwidth options, anti-DDoS protection, and strict data privacy.",
    strengths: [
      "European GDPR sovereignty alignment",
      "Unmetered traffic on 100 Mbps or 250 Mbps ports",
      "Very low compute base cost"
    ],
    risks: [
      "Management console has higher operational complexity",
      "Limited direct low-latency infrastructure in South Asia"
    ],
    computeOptions: [
      { name: "VPS Value", vcpu: "1 vCPU", ram: "2 GiB", monthlyUSD: 4.20 },
      { name: "VPS Essential", vcpu: "2 vCPU", ram: "4 GiB", monthlyUSD: 8.50 }
    ],
    databaseOptions: [
      { name: "Managed PostgreSQL 1 Node", monthlyUSD: 20.00 }
    ],
    egressRate: 0.00,
    egressIncludedGB: 100000,
    natGatewayMonthlyUSD: 0,
    managed: false,
    compliance: false,
    regions: ["europe", "us"],
    officialUrl: "https://www.ovhcloud.com/en/vps/",
    pricingStatus: "verified",
    lastVerifiedDate: "2026-10-15",
    assumptions: "Unmetered bandwidth port rate with fair-use terms."
  },
  {
    id: "vercel",
    name: "Vercel",
    category: "paas",
    tier: "Balanced Value",
    startingPrice: 20,
    pricingModel: "Per-seat plus usage add-ons",
    description: "Leading frontend cloud for Next.js, React, serverless edge functions, preview deployments, and global CDN delivery.",
    strengths: [
      "Zero-config Git deployments with instant preview URLs",
      "Global Edge Network caching with sub-second asset invalidation",
      "Ideal for static sites, Next.js App Router, and Jamstack architectures"
    ],
    risks: [
      "Egress over 1 TB billed at $0.15/GB",
      "Serverless execution minutes and function invocations can escalate quickly on background processing workloads"
    ],
    computeOptions: [
      { name: "Pro Plan Base", vcpu: "Serverless", ram: "Dynamic", monthlyUSD: 20.00 }
    ],
    databaseOptions: [
      { name: "Vercel Postgres (Powered by Neon)", monthlyUSD: 20.00 }
    ],
    egressRate: 0.15,
    egressIncludedGB: 1000,
    natGatewayMonthlyUSD: 0,
    managed: true,
    compliance: false,
    regions: ["global", "us", "europe", "india"],
    officialUrl: "https://vercel.com/pricing",
    pricingStatus: "verified",
    lastVerifiedDate: "2026-10-15",
    assumptions: "Pro plan ($20/seat/month) with standard team allocations."
  },
  {
    id: "render",
    name: "Render",
    category: "paas",
    tier: "Balanced Value",
    startingPrice: 25,
    pricingModel: "Per-instance and per-service monthly flat rate",
    description: "Fully managed cloud platform for web services, background workers, cron jobs, and managed PostgreSQL databases.",
    strengths: [
      "Clean zero-DevOps deployment experience directly from Git",
      "Native support for Docker, Node, Python, Go, Rust",
      "Included automatic SSL, custom domains, and managed DB backups"
    ],
    risks: [
      "Always-on instances don't scale to zero on paid plans",
      "Bandwidth over 100 GB charged at $0.10/GB"
    ],
    computeOptions: [
      { name: "Starter Service", vcpu: "0.5 vCPU", ram: "512 MiB", monthlyUSD: 7.00 },
      { name: "Standard Service", vcpu: "1 vCPU", ram: "2 GiB", monthlyUSD: 25.00 },
      { name: "Pro Service", vcpu: "2 vCPU", ram: "4 GiB", monthlyUSD: 50.00 }
    ],
    databaseOptions: [
      { name: "Managed PostgreSQL Starter", monthlyUSD: 7.00 },
      { name: "Managed PostgreSQL Standard", monthlyUSD: 35.00 }
    ],
    egressRate: 0.10,
    egressIncludedGB: 100,
    natGatewayMonthlyUSD: 0,
    managed: true,
    compliance: false,
    regions: ["us", "europe", "india", "global"],
    officialUrl: "https://render.com/pricing",
    pricingStatus: "verified",
    lastVerifiedDate: "2026-10-15",
    assumptions: "Render Oregon, Frankfurt, Singapore locations."
  },
  {
    id: "railway",
    name: "Railway",
    category: "paas",
    tier: "Balanced Value",
    startingPrice: 20,
    pricingModel: "Subscription fee + per-vCPU/RAM consumption usage",
    description: "Modern developer platform for multi-container services, instant databases, environment variables, and PR previews.",
    strengths: [
      "Rapid bootstrapping of Docker stacks, microservices, and databases",
      "Generous resource limits per container on Pro plan",
      "Built-in private networking between services"
    ],
    risks: [
      "Usage-based vCPU and RAM billing can creep upward with runaway processes",
      "Bandwidth over 100 GB charged at $0.05/GB"
    ],
    computeOptions: [
      { name: "Pro Plan Baseline", vcpu: "Dynamic", ram: "Dynamic", monthlyUSD: 20.00 }
    ],
    databaseOptions: [
      { name: "Railway Managed PostgreSQL", monthlyUSD: 10.00 }
    ],
    egressRate: 0.05,
    egressIncludedGB: 100,
    natGatewayMonthlyUSD: 0,
    managed: true,
    compliance: false,
    regions: ["us", "europe", "india"],
    officialUrl: "https://railway.com/pricing",
    pricingStatus: "verified",
    lastVerifiedDate: "2026-10-15",
    assumptions: "Pro plan base $20/month including $10 usage credit."
  },
  {
    id: "fly",
    name: "Fly.io",
    category: "paas",
    tier: "Balanced Value",
    startingPrice: 25,
    pricingModel: "Per-microVM second billing with persistent volumes",
    description: "Run Docker containers physically close to end users via lightweight Firecracker microVMs across 35 regions worldwide.",
    strengths: [
      "Ultra-low latency edge compute close to global users",
      "Anycast routing and automatic multi-region database read replicas",
      "Supports arbitrary Docker containers and background workers"
    ],
    risks: [
      "Network routing and persistent volume snapshots require operational care",
      "Shared IPv4 addresses require SNI or $2/month dedicated IPv4"
    ],
    computeOptions: [
      { name: "shared-cpu-2x (1GB RAM)", vcpu: "2 vCPU", ram: "1 GiB", monthlyUSD: 11.00 },
      { name: "performance-1x (2GB RAM)", vcpu: "1 vCPU", ram: "2 GiB", monthlyUSD: 25.00 }
    ],
    databaseOptions: [
      { name: "Fly Postgres (LiteFS / Multi-region)", monthlyUSD: 25.00 }
    ],
    egressRate: 0.02,
    egressIncludedGB: 100,
    natGatewayMonthlyUSD: 0,
    managed: false,
    compliance: false,
    regions: ["us", "europe", "india", "global"],
    officialUrl: "https://fly.io/docs/about/pricing/",
    pricingStatus: "verified",
    lastVerifiedDate: "2026-10-15",
    assumptions: "MicroVM hourly rates calculated over 730 monthly hours."
  },
  {
    id: "supabase",
    name: "Supabase",
    category: "database",
    tier: "Balanced Value",
    startingPrice: 25,
    pricingModel: "Tiered platform plan with compute add-ons",
    description: "Open-source Firebase alternative: dedicated PostgreSQL backend, Supavisor connection pooler, Row Level Security, Auth, Storage, and Realtime.",
    strengths: [
      "Integrated Row Level Security (RLS) protects APIs without backend boilerplate",
      "Supavisor connection pooler handles 10,000+ client connections without memory leaks",
      "Automated backups, migrations, and database web studio included"
    ],
    risks: [
      "Disk storage over 8 GB and compute upgrades (Micro/Small/Medium) incur charges",
      "Egress over 250 GB billed at $0.09/GB"
    ],
    computeOptions: [],
    databaseOptions: [
      { name: "Supabase Pro (Shared Compute)", monthlyUSD: 25.00 },
      { name: "Supabase Pro + Small Compute (2 vCPU, 2GB)", monthlyUSD: 50.00 },
      { name: "Supabase Pro + Medium Compute (2 vCPU, 4GB)", monthlyUSD: 85.00 }
    ],
    egressRate: 0.09,
    egressIncludedGB: 250,
    natGatewayMonthlyUSD: 0,
    managed: true,
    compliance: false,
    regions: ["us", "europe", "india", "global"],
    officialUrl: "https://supabase.com/pricing",
    pricingStatus: "verified",
    lastVerifiedDate: "2026-10-15",
    assumptions: "Pro tier ($25/mo) with standard included allowances."
  },
  {
    id: "neon",
    name: "Neon",
    category: "database",
    tier: "Balanced Value",
    startingPrice: 19,
    pricingModel: "Serverless compute units (CU) & active storage hours",
    description: "Serverless PostgreSQL with instant database branching for CI/CD, point-in-time recovery, autoscaling compute, and scale-to-zero.",
    strengths: [
      "Instant database branch creation for preview deployments and staging",
      "Scales compute to zero during idle periods to eliminate wasted spend",
      "Built-in connection pooler via PgBouncer with WebSocket support"
    ],
    risks: [
      "Cold-start latency (~500ms–1.5s) when waking an idle branch",
      "Continuous steady traffic requires monitoring compute unit consumption"
    ],
    computeOptions: [],
    databaseOptions: [
      { name: "Neon Launch Plan (0.25–2 CU Autoscaling)", monthlyUSD: 19.00 },
      { name: "Neon Scale Plan (Up to 8 CU Autoscaling)", monthlyUSD: 69.00 }
    ],
    egressRate: 0.09,
    egressIncludedGB: 50,
    natGatewayMonthlyUSD: 0,
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
      "Native S3 API compatibility for drops-in replacement of AWS S3",
      "First 10 GB storage free each month"
    ],
    risks: [
      "Class A write/list operations billed at $4.50 per million operations",
      "No lifecycle transitions to cold tape storage like AWS Glacier"
    ],
    computeOptions: [],
    databaseOptions: [],
    egressRate: 0.00,
    egressIncludedGB: 1000000,
    natGatewayMonthlyUSD: 0,
    managed: true,
    compliance: true,
    regions: ["global"],
    officialUrl: "https://developers.cloudflare.com/r2/pricing/",
    pricingStatus: "verified",
    lastVerifiedDate: "2026-10-15",
    assumptions: "Storage at $0.015/GB; zero bandwidth fees."
  }
];

module.exports = { PROVIDER_CATALOG };
