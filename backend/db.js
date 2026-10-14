
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

db.exec(`
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
`);

const count = db.prepare(
  "SELECT COUNT(*) AS total FROM provider_plans"
).get().total;

if (count === 0) {
  const insert = db.prepare(`
    INSERT INTO provider_plans
      (provider, plan_name, region, vcpu, ram, storage,
       bandwidth, monthly_usd, pricing_url, pricing_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const plans = [
    [
      "DigitalOcean", "Basic Droplet example", "Global",
      "1 vCPU", "1 GiB", "25 GiB SSD", "Plan allowance",
      6, "https://www.digitalocean.com/pricing/droplets",
      "verify-before-use"
    ],
    [
      "AWS", "EC2 example", "Region dependent",
      "Check instance", "Check instance", "EBS billed separately",
      "Usage dependent", null,
      "https://aws.amazon.com/ec2/pricing/on-demand/",
      "requires-calculator"
    ],
    [
      "Hetzner", "Cloud server example", "Region dependent",
      "Plan dependent", "Plan dependent", "Plan dependent",
      "Plan dependent", null,
      "https://www.hetzner.com/cloud/",
      "verify-before-use"
    ],
    [
      "Azure", "Virtual Machines example", "Region dependent",
      "Plan dependent", "Plan dependent", "Disks billed separately",
      "Usage dependent", null,
      "https://azure.microsoft.com/pricing/",
      "requires-calculator"
    ]
  ];

  const seed = db.transaction((items) => {
    for (const plan of items) insert.run(...plan);
  });

  seed(plans);
}

module.exports = db;
