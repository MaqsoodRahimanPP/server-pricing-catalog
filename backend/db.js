"use strict";

const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");

const dbPath =
  process.env.DATABASE_PATH ||
  path.join(__dirname, "data", "cloudblueprint.db");

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Create schema migrations table
db.exec(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version INTEGER NOT NULL UNIQUE,
    name TEXT NOT NULL,
    applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS provider_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    region TEXT NOT NULL DEFAULT 'Global',
    vcpu TEXT,
    ram TEXT,
    storage TEXT,
    bandwidth TEXT,
    monthly_usd REAL,
    pricing_url TEXT NOT NULL,
    pricing_status TEXT NOT NULL DEFAULT 'unverified',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS estimates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_name TEXT NOT NULL,
    inputs_json TEXT NOT NULL,
    result_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS pricing_audit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id INTEGER NOT NULL,
    old_monthly_usd REAL,
    new_monthly_usd REAL,
    changed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES provider_plans(id)
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    mode TEXT NOT NULL DEFAULT 'founder',
    requirements_json TEXT NOT NULL,
    selected_tier TEXT NOT NULL DEFAULT 'balanced',
    architecture_json TEXT NOT NULL,
    cost_estimate_json TEXT NOT NULL,
    components_json TEXT NOT NULL,
    tags TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration 1: Seed enriched provider catalog if not already migrated
const migration1Applied = db
  .prepare("SELECT 1 FROM schema_migrations WHERE version = 1")
  .get();

if (!migration1Applied) {
  const seedPlans = [
    [
      "AWS", "t4g.small / EC2 baseline", "Global / Multi-region",
      "2 vCPU", "2 GiB", "EBS gp3 billed separately",
      "100 GB included, then $0.09/GB", 14.60,
      "https://aws.amazon.com/ec2/pricing/on-demand/",
      "verified"
    ],
    [
      "AWS", "RDS PostgreSQL db.t4g.medium Multi-AZ", "Global / Multi-region",
      "2 vCPU", "4 GiB", "100 GiB gp3 included",
      "VPC network transfer applies", 130.00,
      "https://aws.amazon.com/rds/postgresql/pricing/",
      "verified"
    ],
    [
      "Google Cloud", "e2-medium compute", "Global / Multi-region",
      "2 vCPU", "4 GiB", "Persistent disk billed separately",
      "100 GB included, then $0.12/GB", 24.50,
      "https://cloud.google.com/compute/all-pricing",
      "verified"
    ],
    [
      "Microsoft Azure", "B2s General Purpose", "Global / Multi-region",
      "2 vCPU", "4 GiB", "Standard SSD billed separately",
      "100 GB included, then $0.087/GB", 29.20,
      "https://azure.microsoft.com/pricing/details/virtual-machines/linux/",
      "verified"
    ],
    [
      "Hetzner", "CX22 Cloud Server", "Europe / US East",
      "2 vCPU", "4 GiB", "40 GiB NVMe SSD",
      "20 TB included, then €1.00/TB", 4.50,
      "https://www.hetzner.com/cloud/",
      "verified"
    ],
    [
      "Hetzner", "CPX31 Dedicated vCPU", "Europe / US East",
      "4 vCPU", "8 GiB", "160 GiB NVMe SSD",
      "20 TB included, then €1.00/TB", 14.80,
      "https://www.hetzner.com/cloud/",
      "verified"
    ],
    [
      "Contabo", "Cloud VPS S", "EU, US, UK, India, Asia",
      "4 vCPU", "8 GiB", "50 GiB NVMe (or 200 GiB SSD)",
      "32 TB included", 5.50,
      "https://contabo.com/en/vps/",
      "verified"
    ],
    [
      "DigitalOcean", "Basic Droplet 2GB", "Global (8 regions)",
      "1 vCPU", "2 GiB", "50 GiB NVMe SSD",
      "2 TB included, then $0.01/GB", 12.00,
      "https://www.digitalocean.com/pricing/droplets",
      "verified"
    ],
    [
      "DigitalOcean", "Managed PostgreSQL (1 Node)", "Global (8 regions)",
      "1 vCPU", "2 GiB", "25 GiB Storage",
      "Private VPC transfer free", 30.00,
      "https://www.digitalocean.com/pricing/databases",
      "verified"
    ],
    [
      "Akamai Linode", "Dedicated 4GB Compute", "Global (11 regions)",
      "2 vCPU", "4 GiB", "80 GiB SSD",
      "4 TB included, then $0.005/GB", 30.00,
      "https://www.linode.com/pricing/",
      "verified"
    ],
    [
      "Vultr", "High Frequency 2 vCPU", "Global (32 locations)",
      "2 vCPU", "4 GiB", "128 GiB NVMe SSD",
      "3 TB included, then $0.01/GB", 24.00,
      "https://www.vultr.com/pricing/",
      "verified"
    ],
    [
      "OVHcloud", "VPS Value", "Europe, North America, APAC",
      "1 vCPU", "2 GiB", "40 GiB NVMe SSD",
      "Unmetered (100 Mbps)", 4.20,
      "https://www.ovhcloud.com/en/vps/",
      "verified"
    ],
    [
      "Vercel", "Pro Plan (Serverless / Edge)", "Global Edge",
      "Managed", "Managed", "Managed edge caching",
      "1 TB included, then $0.15/GB", 20.00,
      "https://vercel.com/pricing",
      "verified"
    ],
    [
      "Render", "Team Compute & Managed PG", "US, EU, Singapore",
      "2 vCPU", "4 GiB", "Auto-scaling disk",
      "100 GB included, then $0.10/GB", 35.00,
      "https://render.com/pricing",
      "verified"
    ],
    [
      "Railway", "Pro Tier Application Runtime", "US, Europe",
      "Flexible", "Flexible up to 32 GB", "Persistent volumes available",
      "100 GB included, then $0.05/GB", 20.00,
      "https://railway.com/pricing",
      "verified"
    ],
    [
      "Fly.io", "Performance-1x MicroVM", "Global (35 regions)",
      "1 vCPU", "2 GiB", "Persistent NVMe attached",
      "100 GB included, then $0.02/GB", 25.00,
      "https://fly.io/docs/about/pricing/",
      "verified"
    ],
    [
      "Supabase", "Pro Plan Managed PostgreSQL", "Global AWS regions",
      "Shared compute", "Upgradable compute", "8 GiB disk included",
      "250 GB egress included", 25.00,
      "https://supabase.com/pricing",
      "verified"
    ],
    [
      "Neon", "Launch / Scale Serverless Postgres", "AWS regions",
      "Autoscaling 0.25–8 CU", "Autoscaling", "10 GiB storage included",
      "50 GB egress included", 19.00,
      "https://neon.tech/pricing",
      "verified"
    ],
    [
      "Cloudflare R2", "S3-Compatible Object Storage", "Global Edge",
      "N/A", "N/A", "$0.015/GB-month storage",
      "$0 egress fees to public internet", 0.00,
      "https://developers.cloudflare.com/r2/pricing/",
      "verified"
    ]
  ];

  const insertPlan = db.prepare(`
    INSERT INTO provider_plans
      (provider, plan_name, region, vcpu, ram, storage,
       bandwidth, monthly_usd, pricing_url, pricing_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const runMigration = db.transaction(() => {
    for (const plan of seedPlans) {
      // Check if plan already exists by provider and plan_name
      const existing = db
        .prepare(
          "SELECT id FROM provider_plans WHERE provider = ? AND plan_name = ?"
        )
        .get(plan[0], plan[1]);

      if (!existing) {
        insertPlan.run(...plan);
      }
    }

    db.prepare(`
      INSERT INTO schema_migrations (version, name)
      VALUES (1, 'seed_enriched_provider_catalog')
    `).run();
  });

  runMigration();
}

// Migration 2: Seed Hostinger KVM & Cloud Plans
const migration2Applied = db
  .prepare("SELECT 1 FROM schema_migrations WHERE version = 2")
  .get();

if (!migration2Applied) {
  const hostingerPlans = [
    [
      "Hostinger", "Hostinger KVM 1", "Mumbai, Singapore, EU, US",
      "1 vCPU", "4 GiB", "50 GiB NVMe",
      "4 TB included (300 Mb/s)", 6.49,
      "https://www.hostinger.com/vps-hosting",
      "verified"
    ],
    [
      "Hostinger", "Hostinger KVM 2 (Popular)", "Mumbai, Singapore, EU, US",
      "2 vCPU", "8 GiB", "100 GiB NVMe",
      "8 TB included (300 Mb/s)", 8.99,
      "https://www.hostinger.com/vps-hosting",
      "verified"
    ],
    [
      "Hostinger", "Hostinger KVM 4 (Scale)", "Mumbai, Singapore, EU, US",
      "4 vCPU", "16 GiB", "200 GiB NVMe",
      "16 TB included (300 Mb/s)", 12.99,
      "https://www.hostinger.com/vps-hosting",
      "verified"
    ],
    [
      "Hostinger", "Hostinger KVM 8 (Powerhouse)", "Mumbai, Singapore, EU, US",
      "8 vCPU", "32 GiB", "400 GiB NVMe",
      "32 TB included (300 Mb/s)", 25.99,
      "https://www.hostinger.com/vps-hosting",
      "verified"
    ],
    [
      "Hostinger", "Cloud Startup (Managed hPanel)", "Global / Multi-region",
      "2 vCPU", "3 GiB", "200 GiB NVMe",
      "Unlimited unmetered", 9.99,
      "https://www.hostinger.com/cloud-hosting",
      "verified"
    ],
    [
      "Hostinger", "Cloud Professional", "Global / Multi-region",
      "4 vCPU", "6 GiB", "250 GiB NVMe",
      "Unlimited unmetered", 14.99,
      "https://www.hostinger.com/cloud-hosting",
      "verified"
    ],
    [
      "Hostinger", "Cloud Enterprise", "Global / Multi-region",
      "6 vCPU", "12 GiB", "300 GiB NVMe",
      "Unlimited unmetered", 29.99,
      "https://www.hostinger.com/cloud-hosting",
      "verified"
    ]
  ];

  const insertPlan = db.prepare(`
    INSERT INTO provider_plans
      (provider, plan_name, region, vcpu, ram, storage,
       bandwidth, monthly_usd, pricing_url, pricing_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const runMigration2 = db.transaction(() => {
    for (const plan of hostingerPlans) {
      const existing = db
        .prepare("SELECT id FROM provider_plans WHERE provider = ? AND plan_name = ?")
        .get(plan[0], plan[1]);

      if (!existing) {
        insertPlan.run(...plan);
      }
    }

    db.prepare(`
      INSERT INTO schema_migrations (version, name)
      VALUES (2, 'seed_hostinger_kvm_cloud_catalog')
    `).run();
  });

  runMigration2();
}

module.exports = db;

