import { ArchitectureGraph, ArchitectureNode, ArchitectureEdge, Requirements, TierId } from "../types";

export function generateClientArchitecture(
  requirements: Requirements,
  selectedTier: TierId = "hostinger"
): ArchitectureGraph {
  const {
    users = 10000,
    nodes = 2,
    database = "postgres",
    availability = "standard",
    stack = "node",
    projectType = "saas",
    region = "india",
    peakRps = 500
  } = requirements;

  const isHA = availability === "ha" || selectedTier === "enterprise";

  const tierMetaMap: Record<TierId, {
    provider: string;
    compute: string;
    db: string;
    lb: string;
    storage: string;
    waf: string;
    regionBadge: string;
  }> = {
    budget: {
      provider: "Contabo / Hetzner",
      compute: "Docker Container (VPS S / CX22)",
      db: database === "postgres" ? "Self-hosted PostgreSQL (WAL on disk)" : "No Database",
      lb: nodes > 1 ? "Traefik Reverse Proxy" : "Direct Port 443 Binding",
      storage: "Cloudflare R2 Object Storage",
      waf: "Cloudflare Free WAF & SSL",
      regionBadge: region === "europe" ? "Nuremberg / Falkenstein" : "Frankfurt / US Central"
    },
    hostinger: {
      provider: "Hostinger KVM + Coolify",
      compute: `Hostinger KVM (${nodes}x) + Coolify PaaS`,
      db: database === "postgres" ? "PostgreSQL on Gen4 NVMe (Containerized)" : "No Database",
      lb: "Traefik / Coolify Automated Reverse Proxy",
      storage: "Cloudflare R2 + Hostinger Automated Snapshots",
      waf: "Edge WAF + Kodee AI Security Monitor",
      regionBadge: region === "india" ? "Mumbai, IN (Asia South)" : region === "europe" ? "Vilnius, LT (EU)" : "Phoenix, AZ (US)"
    },
    balanced: {
      provider: "DigitalOcean / Linode",
      compute: "App Droplet Cluster (2-4 vCPU)",
      db: database === "postgres" ? "Managed PostgreSQL (Private VPC Standby)" : "No Database",
      lb: "DO Cloud Load Balancer (Health Checked)",
      storage: "DO Spaces (S3-Compatible)",
      waf: "Cloudflare Pro WAF & DDoS Shield",
      regionBadge: region === "india" ? "Bangalore (BLR1)" : region === "europe" ? "Frankfurt (FRA1)" : "New York (NYC3)"
    },
    enterprise: {
      provider: "Amazon Web Services (AWS)",
      compute: "AWS EC2 / ECS Auto-Scaling Cluster",
      db: database === "postgres" ? "AWS RDS Multi-AZ PostgreSQL (Sync Standby)" : "No Database",
      lb: "AWS Application Load Balancer (ALB)",
      storage: "Amazon S3 Standard (SSE-KMS Encrypted)",
      waf: "AWS WAF Managed Rule Groups",
      regionBadge: region === "india" ? "ap-south-1 (Mumbai)" : region === "europe" ? "eu-central-1 (Frankfurt)" : "us-east-1 (N. Virginia)"
    }
  };

  const tierMeta = tierMetaMap[selectedTier] || tierMetaMap.hostinger;

  // Real-time calculated traffic metrics based on users & peakRps
  const calcRps = peakRps || Math.max(50, Math.round(users * 0.05));
  const cdnCachedRps = Math.round(calcRps * 0.88); // 88% cached at edge
  const originRps = Math.max(10, calcRps - cdnCachedRps);
  const dbRps = Math.round(originRps * 0.65);

  const nodesList: ArchitectureNode[] = [];
  const edgesList: ArchitectureEdge[] = [];

  // Boundaries
  const boundaries = [
    {
      id: "boundary-public",
      title: "Public Internet & Edge Zone",
      description: "Anycast routing, DDoS mitigation, TLS termination, and Edge caching",
      zone: "public",
      color: "#3b82f6"
    },
    {
      id: "boundary-vpc-app",
      title: "VPC Application Subnet",
      description: "Accepts traffic solely from the Load Balancer; no direct public ingress",
      zone: "app-subnet",
      color: "#10b981"
    },
    {
      id: "boundary-vpc-data",
      title: "VPC Isolated Data Subnet",
      description: "Zero direct public ingress; restricted to application security group",
      zone: "data-subnet",
      color: "#8b5cf6"
    }
  ];

  // 1. Users Node
  nodesList.push({
    id: "node-users",
    type: "default",
    category: "client",
    position: { x: 30, y: 160 },
    data: {
      title: "Global End Users",
      subtitle: `${users.toLocaleString()} MAU · ${tierMeta.regionBadge}`,
      zone: "public",
      status: "active",
      provider: "Internet Users",
      icon: "Users",
      nodeType: "cdn",
      liveRps: calcRps,
      liveLatencyMs: 14
    }
  });

  // 2. CDN Edge
  nodesList.push({
    id: "node-cdn",
    type: "default",
    category: "edge",
    position: { x: 220, y: 160 },
    data: {
      title: "Cloudflare Edge CDN",
      subtitle: "Anycast DNS · 88% Edge Cache Hit",
      zone: "public",
      status: "active",
      provider: "Cloudflare Edge",
      icon: "Globe",
      nodeType: "cdn",
      liveRps: calcRps,
      liveLatencyMs: 12
    }
  });

  edgesList.push({
    id: "e-users-cdn",
    source: "node-users",
    target: "node-cdn",
    label: `${calcRps} RPS · 14ms`,
    animated: true,
    liveMetrics: { rps: calcRps, latencyMs: 14, protocol: "HTTPS / HTTP3" }
  });

  // 3. WAF
  nodesList.push({
    id: "node-waf",
    type: "default",
    category: "security",
    position: { x: 410, y: 160 },
    data: {
      title: tierMeta.waf,
      subtitle: "Token Bucket Rate Limiting · OWASP Top 10",
      zone: "public",
      status: "active",
      provider: tierMeta.provider,
      icon: "ShieldCheck",
      nodeType: "waf",
      liveRps: calcRps,
      liveLatencyMs: 2
    }
  });

  edgesList.push({
    id: "e-cdn-waf",
    source: "node-cdn",
    target: "node-waf",
    label: "Filtered TLS",
    animated: true,
    liveMetrics: { rps: calcRps, latencyMs: 2, protocol: "mTLS" }
  });

  // 4. Load Balancer
  nodesList.push({
    id: "node-lb",
    type: "default",
    category: "networking",
    position: { x: 600, y: 160 },
    data: {
      title: tierMeta.lb,
      subtitle: nodes > 1 ? `Weighted Round Robin to ${nodes} nodes` : "SSL Termination Reverse Proxy",
      zone: "app-subnet",
      status: "active",
      provider: tierMeta.provider,
      icon: "Scale",
      nodeType: "lb",
      liveRps: originRps,
      liveLatencyMs: 5
    }
  });

  edgesList.push({
    id: "e-waf-lb",
    source: "node-waf",
    target: "node-lb",
    label: `${originRps} Origin RPS`,
    animated: true,
    liveMetrics: { rps: originRps, latencyMs: 5, protocol: "TCP 443" }
  });

  // 5. Compute Application Nodes
  nodesList.push({
    id: "node-compute",
    type: "default",
    category: "compute",
    position: { x: 790, y: 160 },
    data: {
      title: tierMeta.compute,
      subtitle: `${nodes} instance(s) · ${stack} runtime ${selectedTier === "hostinger" ? "· Kodee AI Assistant" : ""}`,
      zone: "app-subnet",
      status: "active",
      provider: tierMeta.provider,
      icon: "Server",
      instances: nodes,
      isHA,
      nodeType: "app",
      liveRps: originRps,
      liveLatencyMs: 24
    }
  });

  edgesList.push({
    id: "e-lb-compute",
    source: "node-lb",
    target: "node-compute",
    label: `${originRps} RPS · 24ms`,
    animated: true,
    liveMetrics: { rps: originRps, latencyMs: 24, protocol: "HTTP/1.1 (Keep-Alive)" }
  });

  // 6. PgBouncer Connection Pooler
  let dbTargetId = "node-compute";
  if (database === "postgres") {
    nodesList.push({
      id: "node-pooler",
      type: "default",
      category: "database",
      position: { x: 980, y: 160 },
      data: {
        title: "PgBouncer Connection Pooler",
        subtitle: "Transaction Pooling (Limits backend to 15 conns)",
        zone: "data-subnet",
        status: "active",
        provider: selectedTier === "hostinger" ? "Containerized PgBouncer (Coolify)" : "PgBouncer / Managed Proxy",
        icon: "Layers",
        nodeType: "pgbouncer",
        liveRps: dbRps,
        liveLatencyMs: 3
      }
    });

    edgesList.push({
      id: "e-compute-pooler",
      source: "node-compute",
      target: "node-pooler",
      label: "TCP 6432 (Pool)",
      animated: true,
      liveMetrics: { rps: dbRps, latencyMs: 3, protocol: "Postgres Protocol" }
    });

    dbTargetId = "node-pooler";
  }

  // 7. Database
  if (database !== "none") {
    nodesList.push({
      id: "node-db",
      type: "default",
      category: "database",
      position: { x: 1180, y: 160 },
      data: {
        title: tierMeta.db,
        subtitle: selectedTier === "hostinger"
          ? "Gen4 NVMe (3,500 MB/s IOPS) · Weekly Backups"
          : isHA
          ? "Multi-AZ Synchronous Standby Failover"
          : "Single Node Instance · Daily Backups",
        zone: "data-subnet",
        status: "active",
        provider: tierMeta.provider,
        icon: "Database",
        isHA,
        nodeType: "postgres",
        liveRps: dbRps,
        liveLatencyMs: 6
      }
    });

    edgesList.push({
      id: "e-pooler-db",
      source: dbTargetId,
      target: "node-db",
      label: `${dbRps} QPS · 6ms`,
      animated: true,
      liveMetrics: { rps: dbRps, latencyMs: 6, protocol: "TCP 5432 (TLS)" }
    });
  }

  // 8. Redis Cache
  if (["saas", "ecommerce", "food", "pos"].includes(projectType)) {
    nodesList.push({
      id: "node-cache",
      type: "default",
      category: "cache",
      position: { x: 980, y: 280 },
      data: {
        title: "Redis In-Memory Cache",
        subtitle: "Session Store · SkipList ZSET Rate Limiting",
        zone: "data-subnet",
        status: "active",
        provider: tierMeta.provider,
        icon: "Zap",
        nodeType: "redis",
        liveRps: Math.round(originRps * 1.2),
        liveLatencyMs: 1
      }
    });

    edgesList.push({
      id: "e-compute-cache",
      source: "node-compute",
      target: "node-cache",
      label: `${Math.round(originRps * 1.2)} QPS · 1ms`,
      animated: true,
      liveMetrics: { rps: Math.round(originRps * 1.2), latencyMs: 1, protocol: "TCP 6379 (RESP)" }
    });
  }

  // 9. Object Storage
  nodesList.push({
    id: "node-storage",
    type: "default",
    category: "storage",
    position: { x: 790, y: 280 },
    data: {
      title: tierMeta.storage,
      subtitle: "Encrypted User Uploads · S3 Presigned URLs",
      zone: "app-subnet",
      status: "active",
      provider: tierMeta.provider,
      icon: "HardDrive",
      nodeType: "s3",
      liveRps: Math.max(5, Math.round(calcRps * 0.08)),
      liveLatencyMs: 18
    }
  });

  edgesList.push({
    id: "e-compute-storage",
    source: "node-compute",
    target: "node-storage",
    label: "S3 API (HTTPS)",
    animated: false,
    liveMetrics: { rps: Math.max(5, Math.round(calcRps * 0.08)), latencyMs: 18, protocol: "REST / HTTPS" }
  });

  // 10. Background Message Queue (if e-commerce, food, pos, saas)
  if (["ecommerce", "food", "pos", "saas"].includes(projectType)) {
    nodesList.push({
      id: "node-queue",
      type: "default",
      category: "queue",
      position: { x: 600, y: 280 },
      data: {
        title: "Async Task Queue (BullMQ)",
        subtitle: "Ring Buffer Dispatches · DLQ Poison Pill Protection",
        zone: "app-subnet",
        status: "active",
        provider: tierMeta.provider,
        icon: "Network",
        nodeType: "queue",
        liveRps: Math.max(10, Math.round(originRps * 0.3)),
        liveLatencyMs: 4
      }
    });

    edgesList.push({
      id: "e-compute-queue",
      source: "node-compute",
      target: "node-queue",
      label: "Enqueue Task",
      animated: true,
      liveMetrics: { rps: Math.max(10, Math.round(originRps * 0.3)), latencyMs: 4, protocol: "Async Worker" }
    });
  }

  return {
    template: projectType,
    selectedTier,
    provider: tierMeta.provider,
    nodes: nodesList,
    edges: edgesList,
    boundaries,
    validationWarnings: [
      {
        type: "security",
        severity: "info",
        message: "Database is placed in the Isolated Data Subnet with zero direct public internet ingress."
      },
      {
        type: "performance",
        severity: "success",
        message: selectedTier === "hostinger"
          ? "Hostinger Gen4 NVMe disk delivers up to 3,500 MB/s sequential IOPS, preventing database I/O bottlenecks."
          : `Load Balancer dynamically health-checks and balances across ${nodes} instances.`
      }
    ],
    summary: `${tierMeta.provider} topology featuring ${nodesList.length} architecture components across 3 security zones in ${tierMeta.regionBadge}.`
  };
}
