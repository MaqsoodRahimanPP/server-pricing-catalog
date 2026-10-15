"use strict";

const DATABASE_ADVISOR_OPTIONS = [
  {
    id: "rds-multi-az",
    name: "AWS RDS PostgreSQL (Multi-AZ)",
    category: "Enterprise Managed",
    targetAudience: "Mission-critical, audited enterprise systems requiring guaranteed SLAs",
    operationalResponsibility: "AWS manages hardware, OS, security patching, storage autoscaling, and synchronous failover. You manage schema, queries, indexes, and connection counts.",
    costStructure: "$130–$280+/month baseline for standard production db.t4g.medium / db.m6g.large Multi-AZ instance plus provisioned gp3 storage ($0.115/GB-mo) and backup storage.",
    availability: "99.95% SLA. Synchronous standby replica in a secondary availability zone with automatic DNS failover in < 60 seconds without data loss.",
    backups: "Automated daily system snapshots and continuous transaction logs for Point-in-Time Recovery (PITR) up to 35 days with one-click restore.",
    connectionManagement: "Max connections limited by instance memory. Requires RDS Proxy or application-side pooling to prevent connection exhaustion spikes.",
    scalingConsiderations: "Vertical compute resize requires a brief planned failover outage. Read scaling supported via up to 15 cross-AZ read replicas.",
    regionalLatency: "Sub-millisecond when queried from same AWS AZ; 1–2ms across availability zones due to synchronous commit replication.",
    securityBoundaries: "Strictly isolated inside private VPC subnets with AWS KMS encryption at rest, TLS 1.3 in transit, and IAM database credential authentication."
  },
  {
    id: "neon",
    name: "Neon Serverless Postgres",
    category: "Serverless Database",
    targetAudience: "Bursty web traffic, developer preview branches, microservices, and dynamic workloads",
    operationalResponsibility: "Neon manages serverless compute, storage autoscaling, and WAL replication. You manage database schema and queries.",
    costStructure: "Scale-to-zero when inactive ($0 idle compute). $0.16/Compute-Unit-hour when active, $0.000164/GB-hour storage, and $0.09/GB egress. Free tier available.",
    availability: "Multi-AZ distributed storage with Raft consensus across 3 availability zones. Decoupled compute instances resume in under 1.5 seconds.",
    backups: "Continuous storage checkpointing with instant zero-copy database branching for every Pull Request and git branch.",
    connectionManagement: "Built-in PgBouncer pooling endpoint included by default; handles 10,000+ simultaneous connections over HTTP, WebSocket, and TCP.",
    scalingConsiderations: "Autoscales compute instantly from 0.25 vCPU to 8 vCPU based on active CPU/RAM load without dropping connections.",
    regionalLatency: "Co-located in major AWS regions (US East, Frankfurt, Singapore). Regional latency is standard cloud ping (1–5ms).",
    securityBoundaries: "IP allowlisting, automated TLS enforcement, encrypted storage volumes, and isolated multi-tenant architecture."
  },
  {
    id: "supabase",
    name: "Supabase Managed Postgres",
    category: "Full-Stack BaaS / Managed",
    targetAudience: "Rapid application prototyping, startups, mobile backends, and full-stack Next.js applications",
    operationalResponsibility: "Supabase provides the managed PostgreSQL engine plus built-in Auth, Realtime, Auto-generated APIs, and Storage.",
    costStructure: "$25/month base Pro tier (includes 8 GB storage and shared compute). Dedicated compute instances available from $10 to $85+/month.",
    availability: "Single-zone dedicated Postgres on Pro. High Availability multi-AZ replication available on Enterprise plans.",
    backups: "Daily automated database backups on Pro with Point-in-Time Recovery (PITR) available as an add-on.",
    connectionManagement: "Integrated Supavisor connection pooler handles high concurrency and thousands of serverless connections seamlessly.",
    scalingConsiderations: "Compute and disk storage upgrade seamlessly from dashboard. Upgradable to dedicated instances.",
    regionalLatency: "Available across 16 global AWS regions for co-location with compute.",
    securityBoundaries: "Native Postgres Row Level Security (RLS), JWT authentication at the database layer, encrypted storage and backups."
  },
  {
    id: "self-hosted-pg",
    name: "Self-Hosted PostgreSQL on VPS",
    category: "Self-Managed",
    targetAudience: "Cost-sensitive startups, single-server applications, and engineering teams with Linux sysadmin expertise",
    operationalResponsibility: "You manage everything: Linux OS kernel updates, PostgreSQL minor upgrades, WAL archiving, backup rotation, memory tuning, and recovery.",
    costStructure: "$0 software markup. Runs directly on your existing VPS ($5–$20/month) alongside application containers.",
    availability: "Single Point of Failure (SPOF) on a single VPS. Downtime during host reboot or server failure unless clustered with Patroni.",
    backups: "Manual configuration required: cron jobs with `pg_dump` or `pgBackRest` syncing encrypted snapshots to Cloudflare R2 or S3.",
    connectionManagement: "Must configure PgBouncer manually in Docker or host to avoid memory bloat from thousands of Postgres worker processes.",
    scalingConsiderations: "Limited to host VPS vertical RAM/vCPU. Horizontal read replicas require manual streaming replication configuration.",
    regionalLatency: "Fastest possible latency (< 0.1ms) when co-located on the same local host as the application.",
    securityBoundaries: "Depends entirely on your firewall configuration: must bind PostgreSQL to 127.0.0.1 or private interface; never open port 5432 publicly."
  },
  {
    id: "pgbouncer",
    name: "PgBouncer Connection Pooler",
    category: "Connection Management",
    targetAudience: "Any PostgreSQL deployment serving more than 50 concurrent client connections",
    operationalResponsibility: "Configure pool modes (transaction, session, statement) and max connection caps. Lightweight proxy requiring minimal upkeep.",
    costStructure: "Near zero: consumes only ~20–50MB RAM. Runs as a lightweight sidecar container or integrated cloud service.",
    availability: "Stateless proxy. Can be deployed as a local sidecar on each app container or as an HA proxy cluster.",
    backups: "Stateless: no persistent data. Configuration files committed to version control.",
    connectionManagement: "Translates thousands of bursty client connections down to 10–30 persistent backend Postgres connections, eliminating memory exhaustion.",
    scalingConsiderations: "Handles tens of thousands of client sockets on a single CPU core.",
    regionalLatency: "Sub-millisecond when co-located with app servers or database.",
    securityBoundaries: "Enforces TLS between client and pooler, and between pooler and database server."
  },
  {
    id: "cloudnative-pg",
    name: "CloudNativePG (Kubernetes Operator)",
    category: "Cloud-Native HA Operator",
    targetAudience: "Organizations running Kubernetes (EKS, GKE, AKS, or self-hosted k3s/Kubeadm)",
    operationalResponsibility: "Operator automates primary election, Raft-based failover, rolling updates, and continuous Barman WAL streaming. You manage the K8s cluster.",
    costStructure: "No database software license fees. Consumes standard Kubernetes cluster node compute and persistent volumes.",
    availability: "Multi-pod high availability across Kubernetes worker nodes with automatic zero-data-loss failover.",
    backups: "Native Barman object store integration: continuous streaming WAL to S3/GCS/R2 with automated PITR restore testing.",
    connectionManagement: "Includes native declarative PgBouncer service resource management.",
    scalingConsiderations: "Scale read replicas and resize PVC disk volumes declaratively via Kubernetes YAML manifests.",
    regionalLatency: "Fast pod-to-pod networking across worker nodes in the same cloud region.",
    securityBoundaries: "Kubernetes NetworkPolicies restrict pod ingress; automatic internal mutual TLS (mTLS) between all Postgres cluster instances."
  }
];

/**
 * Generates 13 comprehensive FinOps and Security recommendations based on architecture.
 */
function generateFinOpsInsights(requirements, estimate) {
  const {
    traffic = 1000,
    db = "postgres",
    availability = "standard",
    compliance = false,
    ops = "managed",
    nodes = 2
  } = requirements;

  const totalCost = estimate.totalMonthlyUSD || 75;
  const isHyperscaler = estimate.provider && estimate.provider.category === "hyperscaler";

  return [
    {
      id: "finops-egress-cdn",
      category: "Egress & CDN Optimization",
      type: "cost",
      problem: `Billable outbound egress of ${traffic.toLocaleString()} GB can compound costs rapidly on cloud hyperscalers ($0.09–$0.12/GB).`,
      action: "Deploy Cloudflare Edge CDN in front of your application and offload static assets, media, and cacheable API responses.",
      reason: "Cloudflare provides unmetered edge egress caching. Caching 60–80% of assets at the edge prevents origin egress from registering as billable transfer.",
      tradeoffs: "Requires configuring cache headers (Cache-Control) and managing cache purge workflows during new deployments.",
      expectedImpact: traffic > 1000
        ? `Quantified savings: Est. $${Math.round(traffic * 0.07)}/month saved on origin bandwidth`
        : "Unquantified (Baseline traffic within included quota; ensures immunity against traffic spikes)"
    },
    {
      id: "finops-nat-gateway",
      category: "NAT Gateway & Private Endpoints",
      type: "cost",
      problem: "Managed NAT Gateways on hyperscalers charge ~$32/month per AZ plus $0.045/GB data processing fees for all outbound internet traffic.",
      action: isHyperscaler
        ? "Provision AWS VPC Gateway Endpoints for S3 and DynamoDB to route traffic internally, bypassing the NAT Gateway."
        : "For VPS environments, use native Linux iptables masquerading or Cloudflare Tunnel to eliminate separate NAT devices.",
      reason: "VPC Gateway Endpoints are completely free of charge and keep high-bandwidth backup and asset transfers off the billable NAT data path.",
      tradeoffs: "Requires updating VPC route tables to direct S3 prefix lists to the endpoint gateway.",
      expectedImpact: isHyperscaler
        ? "Quantified savings: $32.85/month fixed device fee + $15–$45/month in data processing savings"
        : "Unquantified (Architecture avoids managed NAT overhead)"
    },
    {
      id: "finops-object-storage",
      category: "Object Storage Cost Trade-offs",
      type: "cost",
      problem: "AWS S3 charges $0.09/GB egress when users download images, videos, or documents directly from your bucket.",
      action: "Use Cloudflare R2 for user file uploads and public downloads while utilizing S3 API compatibility.",
      reason: "Cloudflare R2 has $0 per-GB egress fees, charging only $0.015/GB-month for storage, compared to S3's dual storage + egress billing.",
      tradeoffs: "R2 does not support automated lifecycle transitions to deep cold archival tape storage like AWS S3 Glacier.",
      expectedImpact: traffic > 500
        ? `Quantified savings: Est. $${Math.round((traffic * 0.5) * 0.08)}/month on asset egress`
        : "Unquantified (Zero egress lock-in for future scale)"
    },
    {
      id: "finops-compute-rightsizing",
      category: "Compute Rightsizing",
      type: "cost",
      problem: "Over-provisioning compute instances during initial launch leads to 50–70% idle CPU and wasted monthly budget.",
      action: "Start with modern ARM-based instances (e.g. AWS Graviton t4g/m6g or Hetzner CPX) and configure CPU-utilization alert thresholds at 65%.",
      reason: "ARM-based instances deliver 20% better price-to-performance over legacy x86 architectures with lower thermal and power costs.",
      tradeoffs: "Docker images must be compiled for linux/arm64 or multi-arch.",
      expectedImpact: "Quantified savings: ~20% lower compute unit cost compared to equivalent x86 instances"
    },
    {
      id: "finops-db-pooling",
      category: "Database Connection Pooling",
      type: "cost",
      problem: "Each direct PostgreSQL client connection consumes ~10MB backend RAM; traffic spikes cause Out-Of-Memory (OOM) crashes or force expensive instance upgrades.",
      action: "Deploy PgBouncer in transaction pooling mode between the application nodes and the database.",
      reason: "PgBouncer multiplexes hundreds of client connections into a compact pool of 10–20 database connections, keeping RAM consumption steady under load.",
      tradeoffs: "Transaction pooling disables prepared statements unless named prepared statements or protocol-level handling is configured.",
      expectedImpact: "Quantified savings: Allows running a smaller database instance tier, saving $40–$120/month in compute overhead"
    },
    {
      id: "finops-backup-retention",
      category: "Backup Cost Management",
      type: "cost",
      problem: "Unpruned database snapshots and full VM backups accumulate indefinitely, silently multiplying storage bills month-over-month.",
      action: "Establish a lifecycle retention policy: 7 daily snapshots, 4 weekly snapshots, and 3 monthly snapshots with automated pruning.",
      reason: "Automated retention rules purge outdated backup objects and compress differential WAL archives.",
      tradeoffs: "Point-in-time recovery is bounded by the active WAL retention window (typically 7–14 days).",
      expectedImpact: "Unquantified (Prevents uncapped compounding storage costs over time)"
    },
    {
      id: "finops-monitoring-logging",
      category: "Monitoring & Logging Costs",
      type: "cost",
      problem: "Unfiltered debug logs shipped to Datadog or CloudWatch Logs can rapidly exceed the cost of the underlying compute infrastructure.",
      action: "Set log retention to 14 days for standard logs, filter health check ping logs at the edge, and alert only on warning/error levels.",
      reason: "Log ingestion rates ($0.50/GB ingested) and index retention ($0.10/GB-month) add significant non-compute surcharges.",
      tradeoffs: "Historical debug logs beyond 14 days are stored in cheap compressed cold storage (S3/R2) rather than live query indexes.",
      expectedImpact: "Quantified savings: Prevents unexpected $50–$200/month observability ingestion overages"
    },
    {
      id: "sec-secrets-management",
      category: "Secrets Management",
      type: "security",
      problem: "Hardcoding database credentials, JWT secrets, and API tokens in Git repositories or Docker images causes critical credential leaks.",
      action: "Inject all database passwords and API keys via runtime environment variables or a dedicated secret manager; never commit `.env` to Git.",
      reason: "Automated Git repository scrapers index leaked credentials within seconds of a public or compromised commit.",
      tradeoffs: "Requires a secure CI/CD pipeline and runtime injection mechanism.",
      expectedImpact: "Unquantified (Critical security baseline; eliminates catastrophic breach risk)"
    },
    {
      id: "sec-network-isolation",
      category: "Network Isolation",
      type: "security",
      problem: "Placing database and cache servers in the same public subnet as the web tier allows direct external port scanning and brute-force attacks.",
      action: "Enforce strict VPC subnet segmentation: place database and cache exclusively in the Private Isolated Data Subnet.",
      reason: "Internal network boundaries ensure that even if an edge server is compromised, lateral movement to the database is blocked by firewall rules.",
      tradeoffs: "Database administration requires a secure bastion host, VPN, or Cloudflare Tunnel.",
      expectedImpact: "Unquantified (Fundamental defense-in-depth architecture requirement)"
    },
    {
      id: "sec-public-port-exposure",
      category: "Public Port Exposure",
      type: "security",
      problem: "Exposing PostgreSQL port 5432, MySQL 3306, or Redis 6379 to 0.0.0.0/0 invites continuous automated credential attacks.",
      action: "Configure security group rules to restrict ingress on database ports strictly to the Application Subnet security group ID.",
      reason: "Eliminates all public internet routability to the persistence layer.",
      tradeoffs: "Developers cannot connect directly without SSH tunneling or secure proxy.",
      expectedImpact: "Unquantified (Immediate elimination of internet-facing database vulnerability)"
    },
    {
      id: "sec-https-tls",
      category: "HTTPS & TLS Termination",
      type: "security",
      problem: "Unencrypted HTTP connections expose session tokens, passwords, and sensitive user data to eavesdropping.",
      action: "Enforce HTTPS with TLS 1.3, HSTS (HTTP Strict Transport Security), and automatic certificate renewal via Let's Encrypt or Cloudflare.",
      reason: "Protects user data in transit and satisfies modern browser security and SEO requirements.",
      tradeoffs: "Requires automated certificate renewal hooks to prevent downtime from expired TLS certificates.",
      expectedImpact: "Unquantified (Mandatory security standard)"
    },
    {
      id: "sec-iam-least-privilege",
      category: "IAM Least Privilege",
      type: "security",
      problem: "Using root cloud credentials or overly permissive `AdministratorAccess` policies across all services creates catastrophic blast radiuses.",
      action: "Create dedicated IAM roles with granular read/write policies strictly scoped to the exact S3 bucket, RDS instance, or queue needed.",
      reason: "If a single microservice is compromised, least-privilege scoping prevents attackers from accessing unrelated resources.",
      tradeoffs: "Initial configuration requires writing and testing granular JSON IAM policy documents.",
      expectedImpact: "Unquantified (Enterprise security compliance requirement)"
    },
    {
      id: "sec-recovery-rollback",
      category: "Recovery & Rollback Strategy",
      type: "security",
      problem: "Deployments without health-checked automated rollback can leave production broken for hours during failed migrations or syntax errors.",
      action: "Implement blue-green or rolling container updates with automatic rollback if HTTP health check endpoints fail within 60 seconds.",
      reason: "Ensures zero-downtime deployments and rapid recovery without requiring emergency manual rollbacks.",
      tradeoffs: "Requires application to support backward-compatible database schema migrations.",
      expectedImpact: "Unquantified (Maintains continuous 99.9% uptime SLA during release cycles)"
    }
  ];
}

module.exports = {
  DATABASE_ADVISOR_OPTIONS,
  generateFinOpsInsights
};
