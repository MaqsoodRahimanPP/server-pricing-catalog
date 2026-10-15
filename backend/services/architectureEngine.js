"use strict";

/**
 * Architecture generation engine: builds nodes, connections, and security boundaries
 * compatible with React Flow and production architectural topologies.
 */
function generateArchitecture(requirements, selectedTier = "balanced") {
  const {
    projectType = "saas",
    users = 10000,
    nodes = 2,
    db = "postgres",
    availability = "standard",
    compliance = false,
    ops = "managed",
    stack = "node"
  } = requirements;

  const isHA = availability === "ha" || selectedTier === "enterprise";
  const isServerless = ops === "serverless";

  // Tier labels & providers
  const tierConfig = {
    budget: {
      provider: "Hetzner / Contabo",
      computeLabel: "Docker App Container",
      dbLabel: db === "postgres" ? "Self-hosted PostgreSQL" : db === "mysql" ? "Self-hosted MySQL" : "No Database",
      lbLabel: nodes > 1 ? "Traefik / Nginx Reverse Proxy" : "Direct Port Binding",
      storageLabel: "Cloudflare R2 Object Storage"
    },
    balanced: {
      provider: "DigitalOcean / Linode",
      computeLabel: "App Droplet Cluster",
      dbLabel: db === "postgres" ? "Managed PostgreSQL (VPC)" : db === "mysql" ? "Managed MySQL (VPC)" : "No Database",
      lbLabel: "Cloud Load Balancer",
      storageLabel: "DO Spaces (S3-Compatible)"
    },
    enterprise: {
      provider: "Amazon Web Services (AWS)",
      computeLabel: "EC2 / ECS Auto-Scaling Cluster",
      dbLabel: db === "postgres" ? "AWS RDS Multi-AZ PostgreSQL" : db === "mysql" ? "AWS Aurora MySQL" : "No Database",
      lbLabel: "AWS Application Load Balancer (ALB)",
      storageLabel: "Amazon S3 Standard Bucket"
    }
  }[selectedTier] || {
    provider: "Cloud Infrastructure",
    computeLabel: "Application Server",
    dbLabel: "Database",
    lbLabel: "Load Balancer",
    storageLabel: "Object Storage"
  };

  // Node placement coordinates
  // Horizontal layout: Client (x=50) -> Edge (x=250) -> Gateway (x=450) -> Compute (x=680) -> Persistence (x=940)
  const nodesList = [];
  const edgesList = [];
  const boundariesList = [];

  // Boundaries / Trust Zones
  boundariesList.push({
    id: "boundary-public",
    title: "Public Internet & Edge Zone",
    description: "Publicly accessible edge layer with DDoS mitigation, TLS termination, and caching",
    zone: "public",
    color: "#3b82f6"
  });

  boundariesList.push({
    id: "boundary-vpc-app",
    title: "VPC Application Subnet (Private Ingress)",
    description: "Accepts traffic solely from the Load Balancer; no direct public ingress",
    zone: "app-subnet",
    color: "#10b981"
  });

  if (db !== "none") {
    boundariesList.push({
      id: "boundary-vpc-data",
      title: "VPC Isolated Data Subnet (Strict Private)",
      description: "Zero internet access; accessible only from authorized application security groups",
      zone: "data-subnet",
      color: "#8b5cf6"
    });
  }

  // 1. Users / Clients Node
  nodesList.push({
    id: "node-users",
    type: "client",
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

  // 2. CDN & DNS Edge Node
  nodesList.push({
    id: "node-cdn",
    type: "edge",
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
    id: "edge-users-cdn",
    source: "node-users",
    target: "node-cdn",
    label: "HTTPS (Port 443)",
    animated: true
  });

  // 3. WAF / Security Gateway
  nodesList.push({
    id: "node-waf",
    type: "security",
    category: "security",
    position: { x: 420, y: 160 },
    data: {
      title: selectedTier === "enterprise" ? "AWS WAF" : "Edge WAF & Rate Limiting",
      subtitle: "OWASP Top 10 · Bot & DDoS Filter",
      zone: "public",
      status: "active",
      provider: tierConfig.provider,
      icon: "ShieldCheck"
    }
  });

  edgesList.push({
    id: "edge-cdn-waf",
    source: "node-cdn",
    target: "node-waf",
    label: "Inspected Traffic",
    animated: true
  });

  // 4. Load Balancer Node
  nodesList.push({
    id: "node-lb",
    type: "loadbalancer",
    category: "networking",
    position: { x: 610, y: 160 },
    data: {
      title: tierConfig.lbLabel,
      subtitle: nodes > 1 ? `Distributes to ${nodes} instances` : "SSL termination gateway",
      zone: "app-subnet",
      status: "active",
      provider: tierConfig.provider,
      icon: "Scale"
    }
  });

  edgesList.push({
    id: "edge-waf-lb",
    source: "node-waf",
    target: "node-lb",
    label: "Clean HTTPS",
    animated: true
  });

  // 5. Compute Application Nodes
  nodesList.push({
    id: "node-compute",
    type: "compute",
    category: "compute",
    position: { x: 810, y: 160 },
    data: {
      title: tierConfig.computeLabel,
      subtitle: `${nodes} node(s) · ${stack} runtime`,
      zone: "app-subnet",
      status: "active",
      provider: tierConfig.provider,
      icon: "Server",
      instances: nodes,
      isHA
    }
  });

  edgesList.push({
    id: "edge-lb-compute",
    source: "node-lb",
    target: "node-compute",
    label: "VPC Internal HTTP",
    animated: true
  });

  // 6. PgBouncer Connection Pooler (if Postgres and high traffic or enterprise)
  let dbTargetNodeId = "node-compute";
  if (db === "postgres") {
    nodesList.push({
      id: "node-pooler",
      type: "proxy",
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
      id: "edge-compute-pooler",
      source: "node-compute",
      target: "node-pooler",
      label: "TCP 6432 (Pool)",
      animated: true
    });

    dbTargetNodeId = "node-pooler";
  }

  // 7. Database Node (Private Data Subnet)
  if (db !== "none") {
    nodesList.push({
      id: "node-db",
      type: "database",
      category: "database",
      position: { x: 1200, y: 160 },
      data: {
        title: tierConfig.dbLabel,
        subtitle: isHA ? "Multi-AZ Synchronous Standby" : "Single Instance (Automated Backups)",
        zone: "data-subnet",
        status: "active",
        provider: tierConfig.provider,
        icon: "Database",
        isHA
      }
    });

    edgesList.push({
      id: "edge-pooler-db",
      source: dbTargetNodeId,
      target: "node-db",
      label: "TLS 5432 (Private Subnet)",
      animated: true
    });
  }

  // 8. Redis Cache / Queue (if ecommerce, saas, or food delivery)
  if (["saas", "ecommerce", "food", "pos"].includes(projectType)) {
    nodesList.push({
      id: "node-cache",
      type: "cache",
      category: "cache",
      position: { x: 1000, y: 280 },
      data: {
        title: "Redis In-Memory Cache",
        subtitle: "Session Store & Background Queues",
        zone: "data-subnet",
        status: "active",
        provider: tierConfig.provider,
        icon: "Zap"
      }
    });

    edgesList.push({
      id: "edge-compute-cache",
      source: "node-compute",
      target: "node-cache",
      label: "TCP 6379",
      animated: true
    });
  }

  // 9. Object Storage Node (S3 / R2)
  nodesList.push({
    id: "node-storage",
    type: "storage",
    category: "storage",
    position: { x: 810, y: 280 },
    data: {
      title: tierConfig.storageLabel,
      subtitle: "Encrypted User Uploads & Backups",
      zone: "app-subnet",
      status: "active",
      provider: tierConfig.provider,
      icon: "HardDrive"
    }
  });

  edgesList.push({
    id: "edge-compute-storage",
    source: "node-compute",
    target: "node-storage",
    label: "S3 API (HTTPS)",
    animated: false
  });

  // Architectural Validation
  const validationWarnings = [];
  if (db !== "none") {
    validationWarnings.push({
      type: "security",
      severity: "info",
      message: "Database is placed in the Isolated Data Subnet with zero public ingress."
    });
  }
  if (nodes > 1) {
    validationWarnings.push({
      type: "reliability",
      severity: "success",
      message: `Load balancer distributes requests across ${nodes} application instances.`
    });
  }
  if (isHA) {
    validationWarnings.push({
      type: "availability",
      severity: "success",
      message: "High Availability topology active: synchronous multi-AZ standby failover configured."
    });
  }

  return {
    template: projectType,
    selectedTier,
    provider: tierConfig.provider,
    nodes: nodesList,
    edges: edgesList,
    boundaries: boundariesList,
    validationWarnings,
    summary: `${tierConfig.provider} topology featuring ${nodesList.length} architecture components across 3 security zones.`
  };
}

module.exports = { generateArchitecture };
