"use strict";

/**
 * CloudPilot — Cloud Architecture, Sizing & FinOps Intelligence Engine
 * Client application logic, calculations, offline fallback & API integrations.
 */

const providerData = {
  meta: {
    currency: "USD",
    updatedLabel: "Illustrative 2026 planning baseline",
    sourcesToVerify: [
      "https://aws.amazon.com/ec2/pricing/",
      "https://aws.amazon.com/rds/postgresql/pricing/",
      "https://cloud.google.com/products/calculator",
      "https://azure.microsoft.com/pricing/calculator/",
      "https://www.hetzner.com/cloud/",
      "https://contabo.com/en/vps/",
      "https://www.digitalocean.com/pricing",
      "https://www.linode.com/pricing/",
      "https://www.vultr.com/pricing/",
      "https://www.ovhcloud.com/en/vps/",
      "https://vercel.com/pricing",
      "https://render.com/pricing",
      "https://railway.com/pricing",
      "https://fly.io/docs/about/pricing/",
      "https://supabase.com/pricing",
      "https://neon.tech/pricing",
      "https://developers.cloudflare.com/r2/pricing/"
    ]
  },
  providers: [
    {
      id: "aws",
      name: "Amazon Web Services",
      category: "hyperscaler",
      tier: "Enterprise",
      price: 45,
      desc: "Broad compute, networking, compliance, IAM and managed database primitives.",
      strength: "Compliance certifications, service breadth, granular security controls.",
      risk: "Egress, NAT gateways, observability and managed service surcharges.",
      egressRate: 0.09,
      egressIncluded: 100,
      managed: true,
      compliance: true,
      regionFit: ["india", "europe", "us", "global"],
      url: "https://aws.amazon.com/pricing/"
    },
    {
      id: "gcp",
      name: "Google Cloud",
      category: "hyperscaler",
      tier: "Enterprise",
      price: 48,
      desc: "Strong Kubernetes (GKE), analytics, global networking and managed data services.",
      strength: "Managed Kubernetes, data analytics and high-throughput global backbone.",
      risk: "Egress and inter-zone network transfer require vigilant budgeting.",
      egressRate: 0.12,
      egressIncluded: 100,
      managed: true,
      compliance: true,
      regionFit: ["india", "europe", "us", "global"],
      url: "https://cloud.google.com/pricing"
    },
    {
      id: "azure",
      name: "Microsoft Azure",
      category: "hyperscaler",
      tier: "Enterprise",
      price: 50,
      desc: "Integrated cloud platform tailored to enterprise identity, Entra ID and Windows/Linux stacks.",
      strength: "Enterprise agreements, hybrid cloud connectivity, active directory integration.",
      risk: "Network gateways, support plans and premium storage add material costs.",
      egressRate: 0.087,
      egressIncluded: 100,
      managed: true,
      compliance: true,
      regionFit: ["india", "europe", "us", "global"],
      url: "https://azure.microsoft.com/pricing/"
    },
    {
      id: "hetzner",
      name: "Hetzner Cloud",
      category: "vps",
      tier: "Ultra-Budget",
      price: 6,
      desc: "Cost-effective virtual machines with generous included transfer in eligible data centers.",
      strength: "Exceptional price-to-performance, predictable server baseline, 20 TB included egress.",
      risk: "Limited geographic locations (Europe & select US), self-managed patching, no native India DC.",
      egressRate: 0.01,
      egressIncluded: 20480,
      managed: false,
      compliance: false,
      regionFit: ["europe", "us"],
      url: "https://www.hetzner.com/cloud/"
    },
    {
      id: "contabo",
      name: "Contabo",
      category: "vps",
      tier: "Ultra-Budget",
      price: 9,
      desc: "High-memory VPS plans suited to Docker, staging clusters and consolidated services.",
      strength: "Unrivaled RAM per dollar, helpful for memory-intensive workloads.",
      risk: "Shared CPU contention risk, customer support response times, network peering variations.",
      egressRate: 0.01,
      egressIncluded: 2048,
      managed: false,
      compliance: false,
      regionFit: ["india", "europe", "us"],
      url: "https://contabo.com/en/vps/"
    },
    {
      id: "digitalocean",
      name: "DigitalOcean",
      category: "vps",
      tier: "Balanced Value",
      price: 24,
      desc: "Straightforward Droplets, managed databases, Spaces object storage and App Platform.",
      strength: "Developer experience, predictable flat-rate billing, mature documentation.",
      risk: "Managed databases and bandwidth overages can compound as traffic scales.",
      egressRate: 0.01,
      egressIncluded: 4096,
      managed: true,
      compliance: false,
      regionFit: ["india", "europe", "us"],
      url: "https://www.digitalocean.com/pricing"
    },
    {
      id: "linode",
      name: "Akamai Cloud (Linode)",
      category: "vps",
      tier: "Balanced Value",
      price: 24,
      desc: "Virtual compute instances, object storage, managed Kubernetes and database services.",
      strength: "Transparent billing, reliable edge connectivity via Akamai global backbone.",
      risk: "Fewer higher-level managed PaaS services compared to hyperscalers.",
      egressRate: 0.005,
      egressIncluded: 4000,
      managed: true,
      compliance: false,
      regionFit: ["india", "europe", "us"],
      url: "https://www.linode.com/pricing/"
    },
    {
      id: "vultr",
      name: "Vultr",
      category: "vps",
      tier: "Balanced Value",
      price: 24,
      desc: "Global cloud compute with 30+ locations, bare metal, GPU compute and managed Kubernetes.",
      strength: "Broad international footprint, high-frequency compute instances.",
      risk: "Regional bandwidth pricing and snapshot fees must be calculated carefully.",
      egressRate: 0.01,
      egressIncluded: 3000,
      managed: false,
      compliance: false,
      regionFit: ["india", "europe", "us", "global"],
      url: "https://www.vultr.com/pricing/"
    },
    {
      id: "ovh",
      name: "OVHcloud",
      category: "vps",
      tier: "Balanced Value",
      price: 15,
      desc: "European cloud provider featuring unmetered bandwidth options and dedicated servers.",
      strength: "Strong data privacy alignment, fixed unmetered bandwidth plans in select regions.",
      risk: "UI complexity and regional fit for low-latency Asia traffic.",
      egressRate: 0.01,
      egressIncluded: 5000,
      managed: false,
      compliance: false,
      regionFit: ["europe", "us"],
      url: "https://www.ovhcloud.com/en/vps/"
    },
    {
      id: "vercel",
      name: "Vercel",
      category: "paas",
      tier: "Developer Experience",
      price: 20,
      desc: "Optimized deployment workflows for Next.js, preview URLs, serverless and edge computing.",
      strength: "Zero-config Git deployments, world-class edge caching, fast time-to-market.",
      risk: "Bandwidth overages ($0.15/GB) and serverless execution minutes can spike rapidly.",
      egressRate: 0.15,
      egressIncluded: 100,
      managed: true,
      compliance: false,
      regionFit: ["india", "europe", "us", "global"],
      url: "https://vercel.com/pricing"
    },
    {
      id: "render",
      name: "Render",
      category: "paas",
      tier: "Balanced Value",
      price: 35,
      desc: "Modern cloud platform for web services, background workers, cron jobs and managed PostgreSQL.",
      strength: "Low operational overhead, straightforward auto-deploys from Git with zero DevOps.",
      risk: "Always-on instance tiers and database compute scaling require proactive cost monitoring.",
      egressRate: 0.10,
      egressIncluded: 100,
      managed: true,
      compliance: false,
      regionFit: ["india", "europe", "us"],
      url: "https://render.com/pricing"
    },
    {
      id: "railway",
      name: "Railway",
      category: "paas",
      tier: "Developer Experience",
      price: 20,
      desc: "Developer-centric application infrastructure with instant databases and flexible usage billing.",
      strength: "Rapid multi-container environment bootstrapping, plug-and-play plugins.",
      risk: "Consumption-based pricing requires vigilance to avoid unexpected monthly creep.",
      egressRate: 0.05,
      egressIncluded: 100,
      managed: true,
      compliance: false,
      regionFit: ["india", "europe", "us"],
      url: "https://railway.com/pricing"
    },
    {
      id: "fly",
      name: "Fly.io",
      category: "paas",
      tier: "Developer Experience",
      price: 25,
      desc: "Run Docker containers physically close to end users via lightweight microVMs worldwide.",
      strength: "Low latency edge compute, simple global scaling, multi-region replication.",
      risk: "Network routing, volume snapshots and persistent storage need careful configuration.",
      egressRate: 0.02,
      egressIncluded: 100,
      managed: false,
      compliance: false,
      regionFit: ["india", "europe", "us", "global"],
      url: "https://fly.io/docs/about/pricing/"
    },
    {
      id: "coolify",
      name: "Coolify + VPS",
      category: "paas",
      tier: "Self-hosted PaaS",
      price: 9,
      desc: "Self-hosted, open-source alternative to Heroku/Netlify running directly on your own VPS.",
      strength: "Zero platform license fees, total control over Docker stacks and databases.",
      risk: "You own operating system updates, firewall rules, automated backup verification and recovery.",
      egressRate: 0.01,
      egressIncluded: 2048,
      managed: false,
      compliance: false,
      regionFit: ["india", "europe", "us"],
      url: "https://coolify.io/"
    },
    {
      id: "supabase",
      name: "Supabase",
      category: "database",
      tier: "Managed Database",
      price: 25,
      desc: "Fully managed PostgreSQL backend with Auth, auto-generated REST/GraphQL APIs and Storage.",
      strength: "Fast prototyping, integrated row-level security, realtime subscriptions.",
      risk: "Database compute add-ons, egress and disk IOPS limits on high-load workloads.",
      egressRate: 0.09,
      egressIncluded: 100,
      managed: true,
      compliance: false,
      regionFit: ["india", "europe", "us"],
      url: "https://supabase.com/pricing"
    },
    {
      id: "neon",
      name: "Neon PostgreSQL",
      category: "database",
      tier: "Serverless Database",
      price: 19,
      desc: "Serverless PostgreSQL with instant database branching, autoscaling and scale-to-zero compute.",
      strength: "Instant preview database branches for PRs, cost-effective for bursty workloads.",
      risk: "Cold start latencies on inactive branches; compute units accumulate on constant traffic.",
      egressRate: 0.09,
      egressIncluded: 100,
      managed: true,
      compliance: false,
      regionFit: ["india", "europe", "us"],
      url: "https://neon.tech/pricing"
    },
    {
      id: "rds",
      name: "AWS RDS PostgreSQL",
      category: "database",
      tier: "Managed Database",
      price: 130,
      desc: "Enterprise managed relational database with automated Multi-AZ failover and snapshots.",
      strength: "Rock-solid High Availability, automated maintenance, deep AWS ecosystem security.",
      risk: "Instance hours, Multi-AZ redundancy, provisioned IOPS and backup storage dominate TCO.",
      egressRate: 0.09,
      egressIncluded: 100,
      managed: true,
      compliance: true,
      regionFit: ["india", "europe", "us", "global"],
      url: "https://aws.amazon.com/rds/postgresql/pricing/"
    },
    {
      id: "selfdb",
      name: "Self-hosted PostgreSQL",
      category: "database",
      tier: "Self-managed",
      price: 0,
      desc: "PostgreSQL engine deployed directly on an existing application VPS or dedicated instance.",
      strength: "Zero recurring managed service markup on an existing server.",
      risk: "Requires manual backup scripts, point-in-time recovery setups, replica replication and disk alerts.",
      egressRate: 0.01,
      egressIncluded: 2048,
      managed: false,
      compliance: false,
      regionFit: ["india", "europe", "us"],
      url: "https://www.postgresql.org/docs/"
    }
  ],
  baseline: {
    egress: {
      awsRate: 0.09,
      awsFreeGB: 100,
      hetznerIncludedGB: 20480,
      digitalOceanIncludedGB: 4096,
      note: "Transfer allowances and rates vary by service, location and contractual tier."
    },
    nat: { monthly: 32.40, perGB: 0.045 },
    storage: { blockPerGB: 0.10, objectPerGB: 0.023, backupPerGB: 0.05 },
    database: {
      selfHosted: 0,
      serverless: 19,
      managed: 40,
      rdsSingleAZ: 130,
      rdsMultiAZ: 260
    }
  }
};

const $ = id => document.getElementById(id);

let currentMode = "founder";
let lastReport = null;
let savedEstimatesCache = [];

const formatUSD = n => "$" + Math.round(Math.max(0, n)).toLocaleString("en-US");
const formatExact = n => "$" + Math.max(0, n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, c => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[c]));

const safeExternalUrl = value => {
  try {
    const url = new URL(String(value || ""), window.location.href);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "#";
  } catch {
    return "#";
  }
};

function switchMode(mode) {
  currentMode = mode;
  const founderForm = $("founder-form");
  const developerForm = $("developer-form");
  const tabFounder = $("tab-founder");
  const tabDeveloper = $("tab-developer");

  if (founderForm) founderForm.classList.toggle("hidden", mode !== "founder");
  if (developerForm) developerForm.classList.toggle("hidden", mode !== "developer");

  if (tabFounder) {
    tabFounder.classList.toggle("active", mode === "founder");
    tabFounder.setAttribute("aria-selected", String(mode === "founder"));
  }
  if (tabDeveloper) {
    tabDeveloper.classList.toggle("active", mode === "developer");
    tabDeveloper.setAttribute("aria-selected", String(mode === "developer"));
  }

  generateArchitecture();
}

function mapStackToType(stack) {
  if (stack === "static") return "portfolio";
  if (stack === "nextjs") return "saas";
  if (stack === "docker") return "api";
  if (stack === "php") return "ecommerce";
  return "saas";
}

function defaultDB(type) {
  if (type === "portfolio") return "none";
  if (type === "food" || type === "pos" || type === "media") return "postgres";
  return "postgres";
}

function getInputs() {
  const developer = currentMode === "developer";
  const users = developer ? 10000 : Number($("users")?.value || 10000);
  const resource = developer ? ($("resources")?.value || "medium") : "";
  const traffic = developer ? Math.max(100, users * 0.02) : Number($("traffic")?.value || 1000);
  const type = developer ? mapStackToType($("stack")?.value || "node") : ($("project-type")?.value || "saas");
  const db = developer ? ($("database")?.value || "postgres") : defaultDB(type);
  const nodes = developer
    ? Number($("nodes")?.value || 2)
    : (users >= 500000 ? 4 : users >= 100000 ? 3 : users >= 10000 ? 2 : 1);

  const availability = $("availability")?.value || "standard";
  const compliance = Boolean($("compliance")?.checked);
  const backup = Boolean($("backup")?.checked);
  const ops = $("ops")?.value || "managed";
  const budget = Number($("budget")?.value || 75);
  const stack = developer ? ($("stack")?.value || "node") : "";
  const resources = developer ? resource : (users >= 500000 ? "xlarge" : users >= 100000 ? "large" : users >= 10000 ? "medium" : "small");
  const region = developer ? ($("region")?.value || "india") : "india";

  return {
    developer,
    users,
    traffic,
    type,
    db,
    nodes,
    availability,
    compliance,
    backup,
    ops,
    budget,
    stack,
    resources,
    region
  };
}

function estimateCosts(input) {
  const enterprise = input.users >= 500000 || input.availability === "ha" || input.compliance;
  const db = input.db;
  const traffic = input.traffic;
  const nodes = input.nodes;

  const resourceFactor = { small: 1, medium: 1.65, large: 2.8, xlarge: 4.8 }[input.resources] || 1.65;
  const baseBudget = { portfolio: 5, ecommerce: 12, saas: 12, food: 15, pos: 12, media: 20, api: 10 }[input.type] || 12;

  const computeBudget = Math.max(5, baseBudget * resourceFactor * Math.max(1, nodes * 0.72));
  const databaseBudget = db === "none" ? 0 : db === "redis" ? 8 : db === "mongo" ? 25 : (db === "postgres" || db === "mysql") ? providerData.baseline.database.selfHosted : 0;
  const dbServerless = db === "none" ? 0 : db === "redis" ? 12 : db === "mongo" ? 30 : providerData.baseline.database.serverless;
  const dbManaged = db === "none" ? 0 : db === "redis" ? 25 : db === "mongo" ? 55 : providerData.baseline.database.managed;
  const dbEnterprise = db === "none" ? 0 : db === "redis" ? 45 : db === "mongo" ? 90 : (input.availability === "ha" || enterprise ? providerData.baseline.database.rdsMultiAZ : providerData.baseline.database.rdsSingleAZ);

  const storage = Math.max(3, Math.round(input.users / 10000) * 2 + 8);
  const backup = input.backup ? Math.max(3, Math.round(input.users / 10000) * 2) : 0;
  const awsEgress = Math.max(0, traffic - providerData.baseline.egress.awsFreeGB) * providerData.baseline.egress.awsRate;
  const nat = input.ops === "self" ? 0 : providerData.baseline.nat.monthly;
  const awsNat = nat + traffic * providerData.baseline.nat.perGB;
  const overhead = 8 + (input.availability === "ha" ? 20 : 0) + (input.compliance ? 35 : 0);

  const budgetCost = computeBudget + databaseBudget + storage + backup;
  const budgetTraffic = traffic > 2048 ? Math.max(0, traffic - 2048) * 0.01 : 0;
  const budgetTotal = budgetCost + budgetTraffic;

  const valueCompute = Math.max(24, computeBudget * 1.4);
  const valueTotal = valueCompute + dbManaged + storage + backup + Math.max(0, traffic - 4096) * 0.01 + 12;

  const serverlessCompute = input.type === "portfolio" ? 0 : Math.max(15, baseBudget * resourceFactor * 1.3);
  const serverlessTotal = serverlessCompute + dbServerless + storage + backup + Math.max(0, traffic - 100) * 0.05 + 10;

  const enterpriseCompute = Math.max(60, computeBudget * 3.5 + nodes * 15);
  const enterpriseTotal = enterpriseCompute + dbEnterprise + storage * 1.5 + backup + awsEgress + awsNat + overhead;

  const actualBudgetTotal = input.ops === "serverless" ? serverlessTotal : budgetTotal;
  const budgetProvider = (input.region === "europe" || input.region === "us") ? "Hetzner + Coolify" : "Contabo + Coolify";

  const budgetRec = {
    id: "budget",
    tier: "Ultra-Budget",
    provider: budgetProvider,
    monthly: Math.round(Math.max(8, actualBudgetTotal)),
    description: "Self-managed VPS and Docker-based deployment. Best for cost-conscious projects with DevOps ownership.",
    features: [
      "VPS compute + Coolify deployment platform",
      db === "none" ? "No persistent database required" : "Self-hosted database allowance included",
      input.backup ? "Backup allowance included" : "Backups not included in estimate",
      "Cloudflare CDN / DNS baseline"
    ],
    fit: !input.compliance && input.ops === "self" && input.users < 100000,
    components: {
      compute: Math.round(Math.max(5, computeBudget)),
      database: Math.round(databaseBudget),
      storage,
      backup,
      network: Math.round(budgetTraffic)
    }
  };

  const valueProvider = input.ops === "serverless" ? "Render / Railway" : input.type === "portfolio" ? "Vercel" : "DigitalOcean";

  const valueRec = {
    id: "value",
    tier: "Balanced Value",
    provider: valueProvider,
    monthly: Math.round(Math.max(20, input.ops === "serverless" ? serverlessTotal : valueTotal)),
    description: "Managed services and simpler operations with a predictable planning baseline.",
    features: [
      "Managed deployment or VPS services",
      "Managed database allowance",
      "Included bandwidth allowances",
      "Reduced routine infrastructure maintenance"
    ],
    fit: !input.compliance && (input.ops === "managed" || input.ops === "serverless") && input.users < 500000,
    components: {
      compute: Math.round(valueCompute),
      database: Math.round(dbManaged),
      storage,
      backup,
      network: Math.round(Math.max(0, traffic - 4096) * 0.01)
    }
  };

  const enterpriseRec = {
    id: "enterprise",
    tier: "Enterprise",
    provider: input.compliance ? "AWS / Azure" : "AWS ECS + RDS",
    monthly: Math.round(Math.max(180, enterpriseTotal)),
    description: "Cloud-native compute, managed database options, network controls and scaling primitives.",
    features: [
      "Load balancing and scalable compute",
      "Managed database / HA allowance",
      "Network, logs and monitoring allowance",
      "Compliance-oriented architecture options"
    ],
    fit: input.compliance || input.availability === "ha" || input.users >= 500000,
    components: {
      compute: Math.round(enterpriseCompute),
      database: Math.round(dbEnterprise),
      storage: Math.round(storage * 1.5),
      backup,
      network: Math.round(awsEgress + awsNat)
    }
  };

  if (input.compliance) {
    budgetRec.monthly += 35;
    valueRec.monthly += 35;
    budgetRec.fit = false;
    valueRec.fit = false;
    enterpriseRec.fit = true;
  }

  if (input.availability === "ha") {
    budgetRec.monthly += 25;
    valueRec.monthly += 20;
    budgetRec.features.push("Single VPS does not guarantee high availability");
  }

  if (input.users >= 100000) {
    budgetRec.monthly += Math.round(computeBudget * 0.5);
    valueRec.monthly += Math.round(valueCompute * 0.25);
  }

  if (input.ops === "serverless") {
    budgetRec.description = "Self-hosting remains possible, but a managed PaaS reduces operational effort.";
    budgetRec.fit = false;
    valueRec.fit = true;
  }

  if (input.region === "india") {
    budgetRec.description += " Confirm your chosen provider has an India/Asia region; some budget options require deployment abroad.";
    valueRec.features.push("Verify regional latency and data-residency requirements");
  }

  if (input.db === "none") {
    for (const rec of [budgetRec, valueRec, enterpriseRec]) {
      rec.components.database = 0;
      rec.monthly = Math.max(0, rec.monthly);
    }
  }

  const recs = [budgetRec, valueRec, enterpriseRec];

  if (input.budget < 50 && !input.compliance) {
    recs[0].fit = true;
    recs[1].fit = false;
  } else if (input.users >= 100000 || input.compliance || input.availability === "ha") {
    recs[2].fit = true;
  } else if (input.ops === "managed" || input.ops === "serverless") {
    recs[1].fit = true;
  } else {
    recs[0].fit = true;
  }

  recs.forEach(r => { r.fitScore = r.fit ? 1 : 0; });
  if (!recs.some(r => r.fit)) recs[1].fit = true;

  return { recs, traffic, awsEgress, awsNat, storage, backup, resourceFactor };
}

function architectureNodes(input) {
  const nodes = [
    { icon: "👤", title: "Users", sub: "Web / Mobile", type: "" },
    { icon: "🌐", title: "Cloudflare CDN", sub: "DNS · TLS · Cache", type: "edge" },
    { icon: "🛡️", title: "WAF / Access", sub: "Rules · Rate limits", type: "security" }
  ];

  if (input.type !== "portfolio") {
    nodes.push({
      icon: "⚖️",
      title: "Load balancer",
      sub: input.nodes > 1 ? "Distribute requests" : "Optional for single node",
      type: "edge"
    });
  }

  nodes.push({
    icon: "⚙️",
    title: input.ops === "serverless" ? "Managed runtime" : "App servers",
    sub: `${input.nodes} node(s) · ${input.stackLabel}`,
    type: "compute"
  });

  if (input.db === "postgres" || input.db === "mysql") {
    nodes.push({
      icon: "🔄",
      title: "PgBouncer / Pool",
      sub: "Connection pooling",
      type: "security"
    });
  }

  if (input.db !== "none") {
    nodes.push({
      icon: "🗄️",
      title: input.db === "postgres" ? "Private PostgreSQL" : input.db === "mysql" ? "Private MySQL" : input.db === "mongo" ? "Private MongoDB" : "Redis",
      sub: input.availability === "ha" ? "HA / failover planned" : "Private network only",
      type: "data"
    });
  }

  if (input.type === "food" || input.type === "pos" || input.type === "saas") {
    nodes.push({
      icon: "⚡",
      title: "Redis / Queue",
      sub: "Cache · Sessions · Jobs",
      type: "data"
    });
  }

  return nodes;
}

function renderArchitecture(input) {
  const mapElement = $("architecture-map");
  const captionElement = $("architecture-caption");
  const branchesElement = $("architecture-branches");
  if (!mapElement) return;

  const nodes = architectureNodes(input);

  mapElement.innerHTML = nodes.map((node, i) => `
    ${i ? '<div class="arch-arrow" aria-hidden="true"><span class="arrow-glyph">→</span></div>' : ""}
    <div class="arch-node ${escapeHTML(node.type)}">
      <span class="node-icon" aria-hidden="true">${node.icon}</span>
      <span class="node-title">${escapeHTML(node.title)}</span>
      <small class="node-sub">${escapeHTML(node.sub)}</small>
    </div>
  `).join("");

  if (captionElement) {
    captionElement.textContent = input.availability === "ha"
      ? "High-availability topology with multi-zone redundancy, connection pooling and isolated persistence."
      : "Proposed request path and private network segmentation based on the chosen workload.";
  }

  const branches = [
    {
      title: "Private data network",
      text: input.availability === "ha"
        ? "Deploy database in multiple failure domains with automated failover, private subnets and strict security group ingress."
        : "Database and cache have no public ingress. Permit connections only from authenticated application nodes."
    },
    {
      title: "Operations & recovery",
      text: input.compliance
        ? "Add identity governance, end-to-end encryption at rest/in transit, immutable audit logging and region compliance sign-off."
        : "Centralize logs and metrics, store secrets outside Git, schedule encrypted snapshots and test restore procedures quarterly."
    }
  ];

  if (branchesElement) {
    branchesElement.innerHTML = branches.map(b => `
      <div class="branch">
        <strong>${escapeHTML(b.title)}</strong>
        <span>${escapeHTML(b.text)}</span>
      </div>
    `).join("");
  }
}

function insightsFor(input) {
  const cost = [
    "<strong>CDN first:</strong> Cache static assets and cacheable responses at the edge. Measure cache-hit ratio before estimating origin bandwidth savings.",
    "<strong>Model outbound traffic:</strong> At an illustrative AWS rate of $0.09/GB after a 100 GB allowance, 1 TB of billable transfer would be about $92.70. Actual rates vary by region and service.",
    "<strong>Avoid unnecessary NAT charges:</strong> On AWS, use appropriate VPC gateway endpoints for S3 and DynamoDB traffic when eligible to bypass NAT processing fees.",
    "<strong>Consider Cloudflare R2:</strong> Object-storage egress to the public internet has zero per-GB egress fees under R2's pricing model; only operations and storage apply.",
    "<strong>Co-locate services:</strong> Keep compute and databases within the same cloud availability zone/region to eliminate cross-region latency and data transfer fees."
  ];

  if (input.traffic > 4096) {
    cost.unshift("<strong>High-egress workload:</strong> Compare included transfer allowances, object storage delivery and CDN economics. Do not assume an unmetered label guarantees line-rate throughput.");
  }

  if (input.ops === "self") {
    cost.push("<strong>Self-hosting trade-off:</strong> Coolify and Docker eliminate platform subscription markups, but compute, backups, monitoring and engineering labor remain operational costs.");
  }

  const security = [
    "<strong>Never expose database ports:</strong> Do not make PostgreSQL 5432, MySQL 3306 or MongoDB 27017 publicly accessible. Restrict ingress via VPC security groups.",
    "<strong>Zero Trust access:</strong> Consider Cloudflare Tunnel or Tailscale for private server admin access. Keep SSH and administrative portals behind MFA.",
    "<strong>Secrets management:</strong> Keep credentials, API tokens and encryption keys out of Git repositories. Inject secrets as protected environment variables.",
    "<strong>Recovery verification:</strong> Encrypt automated snapshots, store one copy in a separated account/provider, and conduct periodic bare-metal restore drills.",
    "<strong>Identity and patching:</strong> Enforce MFA on provider consoles, apply least privilege to IAM roles, automate OS security patches, and monitor centralized audit trails."
  ];

  if (input.compliance) {
    security.unshift("<strong>Compliance gate:</strong> Validate applicable standards (SOC 2, ISO 27001, HIPAA), data-residency requirements, audit logs, and contractual SLAs.");
  }

  const db = [];

  if (input.db === "postgres") {
    db.push("<strong>Use PgBouncer:</strong> Transaction-mode connection pooling dramatically reduces PostgreSQL backend memory overhead and prevents connection exhaustion under spikes.");
  }

  if (input.db === "postgres" || input.db === "mysql" || input.db === "mongo") {
    db.push("<strong>Protect the database:</strong> Establish query timeouts, slow query logging, essential compound indexes, and automated disk storage autoscaling alerts.");
  }

  if (input.db === "none") {
    db.push("<strong>No database selected:</strong> Introduce durable persistence only when the workload requires stateful user sessions, transactions or persistent data.");
  }

  if (input.db === "redis") {
    db.push("<strong>Redis configuration:</strong> Clearly decide between volatile caching (allkeys-lru) vs durable state. Set explicit maxmemory limits to avert OOM crashes.");
  }

  db.push("<strong>Managed vs self-hosted:</strong> Managed databases cost 2–3x raw compute but offload automated backups, minor version patches, point-in-time recovery and failover.");
  db.push("<strong>HA is not a checkbox:</strong> High availability requires active health checks, replication lag monitoring, automated DNS failover and tested client retry logic.");

  const connect = [
    "<strong>1. DNS and TLS:</strong> Point domain DNS records to Cloudflare or provider edge, enabling automatic TLS termination with HTTP/2 and modern ciphers.",
    "<strong>2. Deploy the app:</strong> Connect your Git repository to the deployment platform for automated zero-downtime rolling builds and health-checked rollbacks.",
    "<strong>3. Configure private network:</strong> Place the database and cache on a private VPC subnet. Disallow all public inbound traffic except from trusted application security groups.",
    "<strong>4. Inject configuration:</strong> Provide database connection strings, pooling limits, and secrets via platform environment variables rather than source code.",
    "<strong>5. Continuous monitoring:</strong> Install APM metrics, uptime pings, structured log shipping, error tracking, and disk capacity threshold alerts."
  ];

  if (input.ops === "serverless") {
    connect[1] = "<strong>2. Deploy the app:</strong> Connect Git to the PaaS platform. Review cold start performance, build timeout limits, instance memory and concurrency ceilings.";
  }

  return { cost, security, db, connect };
}

function renderList(id, items) {
  const element = $(id);
  if (!element || !Array.isArray(items)) return;
  element.innerHTML = items.map(item => `<li>${item}</li>`).join("");
}

function renderRecommendations(input, estimate) {
  const container = $("recommendations");
  if (!container || !estimate || !Array.isArray(estimate.recs)) return;

  const recs = estimate.recs;

  container.innerHTML = recs.map(rec => {
    const isFit = Boolean(rec.fit);
    return `
      <article class="panel rec-card ${isFit ? "best" : ""}">
        <div class="rec-card-header">
          <div class="rec-card-meta">
            <span class="tier">${escapeHTML(rec.tier)}</span>
            ${isFit ? '<span class="rec-badge" aria-label="Best fit recommendation">✦ BEST FIT</span>' : ""}
          </div>
          <h3 class="provider-title">${escapeHTML(rec.provider)}</h3>
          <p class="rec-desc">${escapeHTML(rec.description)}</p>
        </div>

        <div class="price-box">
          <div class="price">${formatUSD(rec.monthly)}<small> /month</small></div>
          <div class="price-note">Illustrative planning estimate · USD</div>
        </div>

        <div class="card-divider"></div>

        <ul class="feature-list">
          ${rec.features.map(f => `<li>${escapeHTML(f)}</li>`).join("")}
        </ul>

        <div class="card-foot">
          <button
            type="button"
            class="btn ${isFit ? "btn-accent" : "btn-outline"}"
            onclick="selectRecommendation('${escapeHTML(rec.id)}')"
            aria-label="${isFit ? "Selected recommendation: " : "View details for "}${escapeHTML(rec.provider)}"
          >
            ${isFit ? "✓ Selected recommendation" : "Select & view cost breakdown"}
          </button>
        </div>
      </article>
    `;
  }).join("");
}

function renderCosts(input, estimate) {
  const tableBody = $("cost-table-body");
  const lowestEl = $("lowest-cost");
  const recommendedEl = $("recommended-cost");
  const highestEl = $("highest-cost");
  const disclaimerEl = $("cost-disclaimer");

  if (!tableBody || !estimate || !Array.isArray(estimate.recs)) return;

  const recs = estimate.recs;
  const rows = [
    ["Application compute", r => r.components.compute],
    ["Database persistence", r => r.components.database],
    ["Storage allowance", r => r.components.storage],
    ["Backup allowance", r => r.components.backup],
    ["Estimated network charges", r => r.components.network],
    ["Estimated monthly total", r => r.monthly]
  ];

  tableBody.innerHTML = rows.map((row, i) => {
    const isTotal = i === rows.length - 1;
    return `
      <tr class="${isTotal ? "total-row" : ""}">
        <th scope="row">${escapeHTML(row[0])}</th>
        ${recs.map(r => `<td>${formatUSD(row[1](r))}</td>`).join("")}
      </tr>
    `;
  }).join("");

  const prices = recs.map(r => r.monthly);
  if (lowestEl) lowestEl.textContent = `${formatUSD(Math.min(...prices))}/mo`;
  if (recommendedEl) recommendedEl.textContent = `${formatUSD((recs.find(r => r.fit) || recs[1]).monthly)}/mo`;
  if (highestEl) highestEl.textContent = `${formatUSD(Math.max(...prices))}/mo`;

  if (disclaimerEl) {
    disclaimerEl.textContent = `Baseline options: Budget (${formatUSD(recs[0].monthly)}), Balanced (${formatUSD(recs[1].monthly)}), Enterprise (${formatUSD(recs[2].monthly)}). Estimates exclude taxes, regional variance, variable disk IOPS, extended support contracts and engineering labor.`;
  }
}

function selectRecommendation(id) {
  if (!lastReport) return;
  const rec = lastReport.estimate.recs.find(r => r.id === id);
  if (!rec) return;

  const heading = $("result-heading");
  const summary = $("result-summary");
  const disclaimer = $("cost-disclaimer");

  if (heading) heading.textContent = `${rec.provider} — Architecture & Cost Plan`;
  if (summary) summary.textContent = `Estimated ${formatUSD(rec.monthly)}/month (${rec.tier}). ${rec.description}`;
  if (disclaimer) disclaimer.textContent = `Selected option: ${rec.provider}. All figures are planning estimates and require provider quote verification.`;

  // Update button visual selections
  document.querySelectorAll(".rec-card").forEach(card => {
    card.classList.remove("selected");
  });
  const matchingBtn = document.querySelector(`.rec-card button[onclick*="${id}"]`);
  if (matchingBtn) {
    const parentCard = matchingBtn.closest(".rec-card");
    if (parentCard) parentCard.classList.add("selected");
  }

  if (heading) {
    heading.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

async function renderCatalog() {
  const catalog = $("provider-catalog");
  const filter = $("catalog-filter");
  const searchInput = $("catalog-search");
  if (!catalog || !filter || !providerData || !Array.isArray(providerData.providers)) return;

  const selectedCategory = filter.value || "all";
  const searchQuery = (searchInput?.value || "").trim().toLowerCase();

  const categoryNames = {
    hyperscaler: "Hyperscalers",
    vps: "VPS / Bare metal",
    paas: "PaaS / Serverless",
    database: "Managed databases"
  };

  let apiPlans = [];
  let apiAvailable = false;

  try {
    if (typeof loadProviderPlans === "function") {
      const response = await loadProviderPlans();
      apiPlans = Array.isArray(response?.plans) ? response.plans : [];
      apiAvailable = true;
    }
  } catch (error) {
    console.warn("Backend provider plans API unreachable; catalog is operating in local offline mode.", error);
  }

  const normalize = value => String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/cloud$/, "");

  const aliases = {
    aws: ["aws", "amazon web services", "amazon"],
    azure: ["azure", "microsoft azure", "microsoft"],
    digitalocean: ["digitalocean", "digital ocean", "do"],
    hetzner: ["hetzner", "hetzner cloud"]
  };

  const apiByProvider = new Map();
  for (const plan of apiPlans) {
    if (!plan || !plan.provider) continue;
    const key = normalize(plan.provider);
    apiByProvider.set(key, plan);
    for (const [canonical, names] of Object.entries(aliases)) {
      if (names.some(name => normalize(name) === key)) {
        apiByProvider.set(canonical, plan);
      }
    }
  }

  const filteredProviders = providerData.providers.filter(provider => {
    const matchesCategory = selectedCategory === "all" || provider.category === selectedCategory;
    if (!matchesCategory) return false;

    if (!searchQuery) return true;

    const searchable = [
      provider.name,
      provider.desc,
      provider.strength,
      provider.risk,
      provider.tier,
      provider.category
    ].join(" ").toLowerCase();

    return searchable.includes(searchQuery);
  });

  if (!filteredProviders.length) {
    catalog.innerHTML = `
      <div class="empty-state catalog-empty">
        <p class="empty-title">No matching providers found</p>
        <p class="empty-sub">Try adjusting your search terms or selecting another category.</p>
      </div>
    `;
    return;
  }

  catalog.innerHTML = filteredProviders.map(provider => {
    const apiKeys = [provider.id, provider.name, ...(aliases[provider.id] || [])].map(normalize);
    const apiPlan = apiKeys.map(key => apiByProvider.get(key)).find(Boolean);
    const planName = apiPlan?.plan_name || "Verified reference";
    const status = String(apiPlan?.pricing_status || "verified-catalog").replace(/-/g, " ");
    const apiBadge = apiPlan
      ? `<span class="api-badge online" title="Active DB reference">✓ API: ${escapeHTML(planName)} (${escapeHTML(status)})</span>`
      : "";

    const monthly = Number(provider.price);
    const baseline = Number.isFinite(monthly) ? `${formatUSD(monthly)}/mo` : "Custom quote";

    return `
      <article class="catalog-item">
        <div class="catalog-item-header">
          <div class="catalog-item-meta">
            <span class="category-pill">${escapeHTML(String(provider.category || "provider").toUpperCase())}</span>
            <span class="tier-badge">${escapeHTML(provider.tier || "Reference")}</span>
          </div>
          <h3 class="catalog-provider-name">${escapeHTML(provider.name)}</h3>
        </div>

        <p class="catalog-desc">${escapeHTML(provider.desc)}</p>

        <div class="catalog-pricing">
          <span class="catalog-price-label">Baseline estimate:</span>
          <strong class="catalog-price-val">${baseline}</strong>
        </div>

        <div class="catalog-details">
          <div class="catalog-detail-row">
            <span class="detail-label">Strengths:</span>
            <span class="detail-val strength">${escapeHTML(provider.strength)}</span>
          </div>
          <div class="catalog-detail-row">
            <span class="detail-label">Watch out for:</span>
            <span class="detail-val risk">${escapeHTML(provider.risk)}</span>
          </div>
        </div>

        ${apiBadge ? `<div class="catalog-api-note">${apiBadge}</div>` : ""}

        <div class="catalog-footer">
          <a
            href="${escapeHTML(safeExternalUrl(provider.url))}"
            class="catalog-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View official pricing for ${escapeHTML(provider.name)} (opens in a new tab)"
          >
            Official pricing & docs ↗
          </a>
        </div>
      </article>
    `;
  }).join("");

  catalog.dataset.apiStatus = apiAvailable ? "connected" : "offline";
}

async function renderSavedEstimates() {
  const container = $("saved-estimates-container");
  const countBadge = $("saved-estimates-count");
  if (!container) return;

  let estimates = [];
  try {
    if (typeof loadSavedEstimates === "function") {
      const response = await loadSavedEstimates();
      estimates = Array.isArray(response?.estimates) ? response.estimates : [];
      savedEstimatesCache = estimates;
    }
  } catch (error) {
    console.warn("Could not retrieve saved estimates from backend:", error);
    container.innerHTML = `
      <div class="saved-estimates-offline">
        <p><strong>Database offline:</strong> Saved estimates are stored locally in SQLite when the backend container is running.</p>
      </div>
    `;
    if (countBadge) countBadge.textContent = "0";
    return;
  }

  if (countBadge) countBadge.textContent = String(estimates.length);

  if (!estimates.length) {
    container.innerHTML = `
      <div class="saved-estimates-empty">
        <p>No saved architecture estimates found in SQLite database.</p>
        <small class="muted">Generate an architecture and click "Save estimate to database" to store it permanently.</small>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="table-wrap">
      <table class="saved-estimates-table" aria-label="Saved infrastructure estimates">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Project Name</th>
            <th scope="col">Monthly Total</th>
            <th scope="col">Annual Total</th>
            <th scope="col">Compute / DB</th>
            <th scope="col">Storage</th>
            <th scope="col">Network</th>
            <th scope="col">Saved Date</th>
          </tr>
        </thead>
        <tbody>
          ${estimates.map(item => {
            const res = item.result || {};
            const created = item.createdAt ? new Date(item.createdAt).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            }) : "N/A";

            return `
              <tr>
                <td>#${escapeHTML(item.id)}</td>
                <td><strong>${escapeHTML(item.projectName || "Unnamed project")}</strong></td>
                <td><strong class="text-accent">${formatUSD(res.monthlyTotal ?? 0)}</strong></td>
                <td>${formatUSD(res.annualTotal ?? (res.monthlyTotal ? res.monthlyTotal * 12 : 0))}</td>
                <td>${formatUSD(res.compute ?? 0)}</td>
                <td>${formatUSD(res.storage ?? 0)}</td>
                <td>${formatUSD(res.network ?? 0)}</td>
                <td><small class="muted">${escapeHTML(created)}</small></td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

async function saveCurrentEstimate() {
  if (!lastReport) generateArchitecture();

  if (typeof saveEstimate !== "function") {
    alert("The API client is not loaded. Ensure api.js is loaded in index.html.");
    return;
  }

  const rec = lastReport.estimate.recs.find(item => item.fit) || lastReport.estimate.recs[0];
  const components = rec.components || {};
  const projectNameByType = {
    portfolio: "Portfolio / Static Website",
    ecommerce: "E-commerce & Marketplace Stack",
    saas: "B2B SaaS Cloud Infrastructure",
    food: "Real-time Food Delivery Platform",
    pos: "Cloud Point of Sale Architecture",
    media: "Media Streaming Architecture",
    api: "Backend Microservices Architecture"
  };

  const button = $("save-estimate-button");
  const status = $("save-estimate-status");

  if (button) {
    button.disabled = true;
    button.innerHTML = '<span class="spinner"></span> Saving…';
  }

  try {
    const monthlyCompute = Number(components.compute || 0) + Number(components.database || 0);
    const monthlyStorage = Number(components.storage || 0) + Number(components.backup || 0);
    const monthlyNetwork = Number(components.network || 0);

    const result = await saveEstimate({
      projectName: projectNameByType[lastReport.input.type] || "Cloud Infrastructure Plan",
      monthlyCompute,
      monthlyStorage,
      monthlyNetwork
    });

    const saved = result.result || result.estimate || result;
    const total = saved.monthlyTotal ?? saved.monthly_total ?? rec.monthly;

    if (status) {
      status.className = "save-status success";
      status.textContent = `✓ Saved to SQLite database (#${result.id || "OK"}). Estimated total: ${formatUSD(Number(total))}/month.`;
    }

    // Refresh saved estimates table
    await renderSavedEstimates();
  } catch (error) {
    console.error("Save estimate failed:", error);
    if (status) {
      status.className = "save-status error";
      status.textContent = `Could not save to database: ${error.message}. Check that the backend container is running.`;
    }
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "Save estimate to database";
    }
  }
}

function generateArchitecture() {
  const input = getInputs();
  input.stackLabel = input.developer ? input.stack : "business workload";

  const estimate = estimateCosts(input);
  lastReport = { input, estimate, generatedAt: new Date().toISOString() };

  const projectNames = {
    portfolio: "Portfolio / Static Website Architecture",
    ecommerce: "E-Commerce Cloud Architecture",
    saas: "SaaS Application Architecture",
    food: "Food Delivery & Real-Time Logistics Architecture",
    pos: "Cloud POS Infrastructure Architecture",
    media: "Media Platform & Streaming Architecture",
    api: "Backend API & Microservices Architecture"
  };

  const heading = $("result-heading");
  const summary = $("result-summary");

  if (heading) {
    heading.textContent = projectNames[input.type] || "Cloud Infrastructure Blueprint";
  }

  if (summary) {
    const regionLabel = input.region === "india" ? "India / South Asia" : input.region === "europe" ? "Europe" : input.region === "us" ? "North America" : "Global Multi-region";
    const opsLabel = input.compliance
      ? "Compliance review required"
      : input.availability === "ha"
        ? "High availability target"
        : input.ops === "self"
          ? "Self-managed preference"
          : "Managed operations preference";

    summary.textContent = `${input.users.toLocaleString("en-US")} monthly active users · ${input.nodes} app node(s) · ${regionLabel} · ${opsLabel}`;
  }

  renderRecommendations(input, estimate);
  renderArchitecture(input);

  const insights = insightsFor(input, estimate);
  renderList("cost-insights", insights.cost);
  renderList("security-insights", insights.security);
  renderList("db-insights", insights.db);
  renderList("connect-insights", insights.connect);

  renderCosts(input, estimate);
}

function resetForm() {
  if ($("project-type")) $("project-type").value = "saas";
  if ($("users")) $("users").value = "10000";
  if ($("traffic")) $("traffic").value = "1000";
  if ($("stack")) $("stack").value = "node";
  if ($("database")) $("database").value = "postgres";
  if ($("resources")) $("resources").value = "medium";
  if ($("nodes")) $("nodes").value = "2";
  if ($("region")) $("region").value = "india";
  if ($("budget")) $("budget").value = "75";
  if ($("ops")) $("ops").value = "managed";
  if ($("availability")) $("availability").value = "standard";
  if ($("compliance")) $("compliance").checked = false;
  if ($("backup")) $("backup").checked = true;
  if ($("catalog-filter")) $("catalog-filter").value = "all";
  if ($("catalog-search")) $("catalog-search").value = "";

  const status = $("save-estimate-status");
  if (status) {
    status.textContent = "";
    status.className = "help";
  }

  switchMode("founder");
}

function loadExample() {
  if ($("project-type")) $("project-type").value = "food";
  if ($("users")) $("users").value = "100000";
  if ($("traffic")) $("traffic").value = "5000";
  if ($("budget")) $("budget").value = "200";
  if ($("ops")) $("ops").value = "managed";
  if ($("availability")) $("availability").value = "ha";
  if ($("compliance")) $("compliance").checked = false;
  if ($("backup")) $("backup").checked = true;

  switchMode("founder");
}

function exportJSON() {
  if (!lastReport) generateArchitecture();

  const data = {
    product: "CloudPilot",
    version: "2.0.0",
    estimateType: "Illustrative infrastructure sizing and cost plan; not a live quote",
    providerDataVersion: providerData.meta.updatedLabel,
    generatedAt: lastReport.generatedAt,
    inputs: lastReport.input,
    recommendations: lastReport.estimate.recs,
    assumptions: {
      currency: "USD",
      livePricing: false,
      awsIllustrativeEgressPerGB: providerData.baseline.egress.awsRate,
      awsIllustrativeFreeEgressGB: providerData.baseline.egress.awsFreeGB,
      awsIllustrativeNATMonthly: providerData.baseline.nat.monthly,
      awsIllustrativeNATProcessingPerGB: providerData.baseline.nat.perGB,
      databaseBaselines: providerData.baseline.database,
      storageBaselines: providerData.baseline.storage,
      exclusions: [
        "Regional taxes and regulatory surcharges",
        "DevOps and engineering labor",
        "Exact cloud contract discounts",
        "Variable disk I/O and snapshot frequency",
        "Premium support agreements"
      ]
    },
    officialPricingReferences: providerData.meta.sourcesToVerify
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cloudpilot-${lastReport.input.type || "plan"}-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function checkBackendStatus() {
  const pill = $("status-pill");
  if (!pill) return;

  try {
    if (typeof checkApiHealth === "function") {
      const res = await checkApiHealth();
      if (res && res.status === "ok") {
        pill.className = "status-pill online";
        pill.innerHTML = '<span class="status-dot online"></span> API CONNECTED';
        return;
      }
    }
  } catch {
    // Backend offline is normal in static / local usage
  }

  pill.className = "status-pill offline";
  pill.innerHTML = '<span class="status-dot offline"></span> OFFLINE READY';
}

function setupEventListeners() {
  const inputs = [
    "project-type", "users", "traffic", "stack", "database",
    "resources", "nodes", "region", "budget", "ops",
    "availability", "compliance", "backup"
  ];

  inputs.forEach(id => {
    const el = $(id);
    if (el) {
      el.addEventListener("change", () => generateArchitecture());
      if (el.tagName === "INPUT" && el.type === "number") {
        el.addEventListener("input", () => generateArchitecture());
      }
    }
  });

  const catalogFilter = $("catalog-filter");
  if (catalogFilter) {
    catalogFilter.addEventListener("change", () => renderCatalog());
  }

  const catalogSearch = $("catalog-search");
  if (catalogSearch) {
    catalogSearch.addEventListener("input", () => renderCatalog());
  }

  const refreshSavedBtn = $("refresh-saved-btn");
  if (refreshSavedBtn) {
    refreshSavedBtn.addEventListener("click", () => renderSavedEstimates());
  }
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  generateArchitecture();
  renderCatalog();
  renderSavedEstimates();
  checkBackendStatus();
});
