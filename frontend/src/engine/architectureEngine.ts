import { ArchitectureGraph, ArchitectureNode, ArchitectureEdge, Requirements } from "../types";

export function generateClientArchitecture(
  requirements: Requirements,
  selectedTier: "budget" | "balanced" | "enterprise" = "balanced"
): ArchitectureGraph {
  const {
    users = 10000,
    nodes = 2,
    database = "postgres",
    availability = "standard",
    stack = "node",
    projectType = "saas"
  } = requirements;

  const isHA = availability === "ha" || selectedTier === "enterprise";

  const tierMeta = {
    budget: {
      provider: "Hetzner / Contabo",
      compute: "Docker App Container",
      db: database === "postgres" ? "Self-hosted PostgreSQL" : "No Database",
      lb: nodes > 1 ? "Traefik Reverse Proxy" : "Direct Port Binding",
      storage: "Cloudflare R2 Object Storage"
    },
    balanced: {
      provider: "DigitalOcean / Linode",
      compute: "App Droplet Cluster",
      db: database === "postgres" ? "Managed PostgreSQL (VPC)" : "No Database",
      lb: "Cloud Load Balancer",
      storage: "DO Spaces (S3-Compatible)"
    },
    enterprise: {
      provider: "Amazon Web Services (AWS)",
      compute: "EC2 / ECS Auto-Scaling Cluster",
      db: database === "postgres" ? "AWS RDS Multi-AZ PostgreSQL" : "No Database",
      lb: "AWS Application Load Balancer (ALB)",
      storage: "Amazon S3 Standard Bucket"
    }
  }[selectedTier];

  const nodesList: ArchitectureNode[] = [];
  const edgesList: ArchitectureEdge[] = [];

  // Boundaries
  const boundaries = [
    {
      id: "boundary-public",
      title: "Public Internet & Edge Zone",
      description: "Public edge with Anycast routing, DDoS mitigation, and TLS termination",
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

  // 1. Users
  nodesList.push({
    id: "node-users",
    type: "default",
    category: "client",
    position: { x: 40, y: 160 },
    data: {
      title: "End Users",
      subtitle: `${users.toLocaleString()} MAU · Web & Mobile`,
      zone: "public",
      status: "active",
      provider: "Global Internet",
      icon: "Users"
    }
  });

  // 2. Cloudflare CDN
  nodesList.push({
    id: "node-cdn",
    type: "default",
    category: "edge",
    position: { x: 230, y: 160 },
    data: {
      title: "Cloudflare Edge",
      subtitle: "Global Anycast DNS & Edge Caching",
      zone: "public",
      status: "active",
      provider: "Cloudflare",
      icon: "Globe"
    }
  });

  edgesList.push({
    id: "e-users-cdn",
    source: "node-users",
    target: "node-cdn",
    label: "HTTPS (443)",
    animated: true
  });

  // 3. WAF
  nodesList.push({
    id: "node-waf",
    type: "default",
    category: "security",
    position: { x: 420, y: 160 },
    data: {
      title: selectedTier === "enterprise" ? "AWS WAF" : "Edge WAF & Rate Limiting",
      subtitle: "OWASP Top 10 · Bot & DDoS Mitigation",
      zone: "public",
      status: "active",
      provider: tierMeta.provider,
      icon: "ShieldCheck"
    }
  });

  edgesList.push({
    id: "e-cdn-waf",
    source: "node-cdn",
    target: "node-waf",
    label: "Filtered Traffic",
    animated: true
  });

  // 4. Load Balancer
  nodesList.push({
    id: "node-lb",
    type: "default",
    category: "networking",
    position: { x: 610, y: 160 },
    data: {
      title: tierMeta.lb,
      subtitle: nodes > 1 ? `Distributes to ${nodes} instances` : "SSL termination gateway",
      zone: "app-subnet",
      status: "active",
      provider: tierMeta.provider,
      icon: "Scale"
    }
  });

  edgesList.push({
    id: "e-waf-lb",
    source: "node-waf",
    target: "node-lb",
    label: "Clean HTTPS",
    animated: true
  });

  // 5. Compute Application Nodes
  nodesList.push({
    id: "node-compute",
    type: "default",
    category: "compute",
    position: { x: 810, y: 160 },
    data: {
      title: tierMeta.compute,
      subtitle: `${nodes} node(s) · ${stack} runtime`,
      zone: "app-subnet",
      status: "active",
      provider: tierMeta.provider,
      icon: "Server",
      instances: nodes,
      isHA
    }
  });

  edgesList.push({
    id: "e-lb-compute",
    source: "node-lb",
    target: "node-compute",
    label: "Internal HTTP",
    animated: true
  });

  // 6. PgBouncer Connection Pooler
  let dbTargetId = "node-compute";
  if (database === "postgres") {
    nodesList.push({
      id: "node-pooler",
      type: "default",
      category: "database",
      position: { x: 1000, y: 160 },
      data: {
        title: "PgBouncer Connection Pool",
        subtitle: "Transaction Pooling (Limits backend conns)",
        zone: "data-subnet",
        status: "active",
        provider: "Open Source / Managed",
        icon: "Layers"
      }
    });

    edgesList.push({
      id: "e-compute-pooler",
      source: "node-compute",
      target: "node-pooler",
      label: "TCP 6432 (Pool)",
      animated: true
    });

    dbTargetId = "node-pooler";
  }

  // 7. Database
  if (database !== "none") {
    nodesList.push({
      id: "node-db",
      type: "default",
      category: "database",
      position: { x: 1200, y: 160 },
      data: {
        title: tierMeta.db,
        subtitle: isHA ? "Multi-AZ Synchronous Standby" : "Single Instance (Automated Backups)",
        zone: "data-subnet",
        status: "active",
        provider: tierMeta.provider,
        icon: "Database",
        isHA
      }
    });

    edgesList.push({
      id: "e-pooler-db",
      source: dbTargetId,
      target: "node-db",
      label: "TLS 5432 (Private)",
      animated: true
    });
  }

  // 8. Redis Cache
  if (["saas", "ecommerce", "food", "pos"].includes(projectType)) {
    nodesList.push({
      id: "node-cache",
      type: "default",
      category: "cache",
      position: { x: 1000, y: 280 },
      data: {
        title: "Redis In-Memory Cache",
        subtitle: "Session Store & Background Queues",
        zone: "data-subnet",
        status: "active",
        provider: tierMeta.provider,
        icon: "Zap"
      }
    });

    edgesList.push({
      id: "e-compute-cache",
      source: "node-compute",
      target: "node-cache",
      label: "TCP 6379",
      animated: true
    });
  }

  // 9. Object Storage
  nodesList.push({
    id: "node-storage",
    type: "default",
    category: "storage",
    position: { x: 810, y: 280 },
    data: {
      title: tierMeta.storage,
      subtitle: "Encrypted User Uploads & Backups",
      zone: "app-subnet",
      status: "active",
      provider: tierMeta.provider,
      icon: "HardDrive"
    }
  });

  edgesList.push({
    id: "e-compute-storage",
    source: "node-compute",
    target: "node-storage",
    label: "S3 API (HTTPS)",
    animated: false
  });

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
        message: "Database is placed in the Isolated Data Subnet with zero direct public ingress."
      },
      {
        type: "reliability",
        severity: "success",
        message: `Application Load Balancer health-checks and balances across ${nodes} instances.`
      }
    ],
    summary: `${tierMeta.provider} topology featuring ${nodesList.length} architecture components across 3 security zones.`
  };
}
