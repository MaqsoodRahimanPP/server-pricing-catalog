import React, { useState } from "react";
import { Database, Shield, Zap, Sparkles, Check, Server, Layers } from "lucide-react";
import { DatabaseAdvisorOption } from "../../types";

const DB_OPTIONS: DatabaseAdvisorOption[] = [
  {
    id: "rds-multi-az",
    name: "AWS RDS PostgreSQL (Multi-AZ)",
    category: "Enterprise Managed",
    targetAudience: "Mission-critical, audited enterprise systems requiring guaranteed SLAs",
    operationalResponsibility:
      "AWS manages hardware, OS, security patching, storage autoscaling, and synchronous failover. You manage schema, queries, indexes, and connection counts.",
    costStructure:
      "$130–$280+/month baseline for standard production db.t4g.medium / db.m6g.large Multi-AZ instance plus provisioned gp3 storage ($0.115/GB-mo) and backup storage.",
    availability:
      "99.95% SLA. Synchronous standby replica in a secondary availability zone with automatic DNS failover in < 60 seconds without data loss.",
    backups:
      "Automated daily system snapshots and continuous transaction logs for Point-in-Time Recovery (PITR) up to 35 days with one-click restore.",
    connectionManagement:
      "Max connections limited by instance memory. Requires RDS Proxy or application-side pooling to prevent connection exhaustion spikes.",
    scalingConsiderations:
      "Vertical compute resize requires a brief planned failover outage. Read scaling supported via up to 15 cross-AZ read replicas.",
    regionalLatency:
      "Sub-millisecond when queried from same AWS AZ; 1–2ms across availability zones due to synchronous commit replication.",
    securityBoundaries:
      "Strictly isolated inside private VPC subnets with AWS KMS encryption at rest, TLS 1.3 in transit, and IAM database credential authentication."
  },
  {
    id: "neon",
    name: "Neon Serverless Postgres",
    category: "Serverless Database",
    targetAudience: "Bursty web traffic, developer preview branches, microservices, and dynamic workloads",
    operationalResponsibility:
      "Neon manages serverless compute, storage autoscaling, and WAL replication. You manage database schema and queries.",
    costStructure:
      "Scale-to-zero when inactive ($0 idle compute). $0.16/Compute-Unit-hour when active, $0.000164/GB-hour storage, and $0.09/GB egress. Free tier available.",
    availability:
      "Multi-AZ distributed storage with Raft consensus across 3 availability zones. Decoupled compute instances resume in under 1.5 seconds.",
    backups:
      "Continuous storage checkpointing with instant zero-copy database branching for every Pull Request and git branch.",
    connectionManagement:
      "Built-in PgBouncer pooling endpoint included by default; handles 10,000+ simultaneous connections over HTTP, WebSocket, and TCP.",
    scalingConsiderations:
      "Autoscales compute instantly from 0.25 vCPU to 8 vCPU based on active CPU/RAM load without dropping connections.",
    regionalLatency:
      "Co-located in major AWS regions (US East, Frankfurt, Singapore). Regional latency is standard cloud ping (1–5ms).",
    securityBoundaries:
      "IP allowlisting, automated TLS enforcement, encrypted storage volumes, and isolated multi-tenant architecture."
  },
  {
    id: "supabase",
    name: "Supabase Managed Postgres",
    category: "Full-Stack BaaS / Managed",
    targetAudience: "Rapid application prototyping, startups, mobile backends, and full-stack Next.js applications",
    operationalResponsibility:
      "Supabase provides the managed PostgreSQL engine plus built-in Auth, Realtime, Auto-generated APIs, and Storage.",
    costStructure:
      "$25/month base Pro tier (includes 8 GB storage and shared compute). Dedicated compute instances available from $10 to $85+/month.",
    availability:
      "Single-zone dedicated Postgres on Pro. High Availability multi-AZ replication available on Enterprise plans.",
    backups:
      "Daily automated database backups on Pro with Point-in-Time Recovery (PITR) available as an add-on.",
    connectionManagement:
      "Integrated Supavisor connection pooler handles high concurrency and thousands of serverless connections seamlessly.",
    scalingConsiderations:
      "Compute and disk storage upgrade seamlessly from dashboard. Upgradable to dedicated instances.",
    regionalLatency: "Available across 16 global AWS regions for co-location with compute.",
    securityBoundaries:
      "Native Postgres Row Level Security (RLS), JWT authentication at the database layer, encrypted storage and backups."
  },
  {
    id: "self-hosted-pg",
    name: "Self-Hosted PostgreSQL on VPS",
    category: "Self-Managed",
    targetAudience: "Cost-sensitive startups, single-server applications, and engineering teams with Linux sysadmin expertise",
    operationalResponsibility:
      "You manage everything: Linux OS kernel updates, PostgreSQL minor upgrades, WAL archiving, backup rotation, memory tuning, and recovery.",
    costStructure:
      "$0 software markup. Runs directly on your existing VPS ($5–$20/month) alongside application containers.",
    availability:
      "Single Point of Failure (SPOF) on a single VPS. Downtime during host reboot or server failure unless clustered with Patroni.",
    backups:
      "Manual configuration required: cron jobs with `pg_dump` or `pgBackRest` syncing encrypted snapshots to Cloudflare R2 or S3.",
    connectionManagement:
      "Must configure PgBouncer manually in Docker or host to avoid memory bloat from thousands of Postgres worker processes.",
    scalingConsiderations:
      "Limited to host VPS vertical RAM/vCPU. Horizontal read replicas require manual streaming replication configuration.",
    regionalLatency:
      "Fastest possible latency (< 0.1ms) when co-located on the same local host as the application.",
    securityBoundaries:
      "Depends entirely on your firewall configuration: must bind PostgreSQL to 127.0.0.1 or private interface; never open port 5432 publicly."
  },
  {
    id: "pgbouncer",
    name: "PgBouncer Connection Pooler",
    category: "Connection Management",
    targetAudience: "Any PostgreSQL deployment serving more than 50 concurrent client connections",
    operationalResponsibility:
      "Configure pool modes (transaction, session, statement) and max connection caps. Lightweight proxy requiring minimal upkeep.",
    costStructure:
      "Near zero: consumes only ~20–50MB RAM. Runs as a lightweight sidecar container or integrated cloud service.",
    availability:
      "Stateless proxy. Can be deployed as a local sidecar on each app container or as an HA proxy cluster.",
    backups: "Stateless: no persistent data. Configuration files committed to version control.",
    connectionManagement:
      "Translates thousands of bursty client connections down to 10–30 persistent backend Postgres connections, eliminating memory exhaustion.",
    scalingConsiderations: "Handles tens of thousands of client sockets on a single CPU core.",
    regionalLatency: "Sub-millisecond when co-located with app servers or database.",
    securityBoundaries: "Enforces TLS between client and pooler, and between pooler and database server."
  },
  {
    id: "cloudnative-pg",
    name: "CloudNativePG (Kubernetes Operator)",
    category: "Cloud-Native HA Operator",
    targetAudience: "Organizations running Kubernetes (EKS, GKE, AKS, or self-hosted k3s/Kubeadm)",
    operationalResponsibility:
      "Operator automates primary election, Raft-based failover, rolling updates, and continuous Barman WAL streaming. You manage the K8s cluster.",
    costStructure:
      "No database software license fees. Consumes standard Kubernetes cluster node compute and persistent volumes.",
    availability:
      "Multi-pod high availability across Kubernetes worker nodes with automatic zero-data-loss failover.",
    backups:
      "Native Barman object store integration: continuous streaming WAL to S3/GCS/R2 with automated PITR restore testing.",
    connectionManagement: "Includes native declarative PgBouncer service resource management.",
    scalingConsiderations:
      "Scale read replicas and resize PVC disk volumes declaratively via Kubernetes YAML manifests.",
    regionalLatency: "Fast pod-to-pod networking across worker nodes in the same cloud region.",
    securityBoundaries:
      "Kubernetes NetworkPolicies restrict pod ingress; automatic internal mutual TLS (mTLS) between all Postgres cluster instances."
  }
];

export const DatabaseAdvisor: React.FC = () => {
  const [selectedWorkload, setSelectedWorkload] = useState<string>("general");
  const [activeTab, setActiveTab] = useState<string>("all");

  const getRecommendedId = () => {
    if (selectedWorkload === "compliance" || selectedWorkload === "enterprise") return "rds-multi-az";
    if (selectedWorkload === "bursty" || selectedWorkload === "preview") return "neon";
    if (selectedWorkload === "rapid-mvp") return "supabase";
    if (selectedWorkload === "budget") return "self-hosted-pg";
    if (selectedWorkload === "k8s") return "cloudnative-pg";
    return "supabase";
  };

  const recommendedId = getRecommendedId();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Database Architecture Advisor
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Compare AWS RDS Multi-AZ, Neon, Supabase, Self-Hosted PostgreSQL, PgBouncer, and CloudNativePG.
          </p>
        </div>

        {/* Workload Selector */}
        <div className="flex items-center space-x-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Workload Matcher:</span>
          <select
            value={selectedWorkload}
            onChange={e => setSelectedWorkload(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs"
          >
            <option value="general">Standard Production SaaS</option>
            <option value="rapid-mvp">Rapid Prototyping / Next.js BaaS</option>
            <option value="bursty">Bursty Traffic & Git Preview Branches</option>
            <option value="budget">Bootstrapped Budget ($0 Markup)</option>
            <option value="compliance">Mission-Critical Enterprise (SOC 2 / HA)</option>
            <option value="k8s">Kubernetes Cloud-Native</option>
          </select>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DB_OPTIONS.map(opt => {
          const isRecommended = opt.id === recommendedId;

          return (
            <div
              key={opt.id}
              className={`rounded-2xl p-6 flex flex-col justify-between space-y-5 transition-all ${
                isRecommended
                  ? "bg-slate-900 border-2 border-indigo-500 shadow-xl shadow-indigo-500/10"
                  : "bg-slate-900/70 border border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      {opt.category}
                    </span>
                    <h3 className="text-base font-bold text-white tracking-tight">{opt.name}</h3>
                  </div>
                  {isRecommended && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 fill-current" />
                      <span>RECOMMENDED</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 font-medium">
                  {opt.targetAudience}
                </p>

                {/* Key Metrics */}
                <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
                  <div>
                    <strong className="text-slate-400 block text-[11px] mb-0.5">
                      Cost Structure
                    </strong>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{opt.costStructure}</p>
                  </div>

                  <div>
                    <strong className="text-slate-400 block text-[11px] mb-0.5">
                      Availability & SLAs
                    </strong>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{opt.availability}</p>
                  </div>

                  <div>
                    <strong className="text-slate-400 block text-[11px] mb-0.5">
                      Operational Responsibility
                    </strong>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      {opt.operationalResponsibility}
                    </p>
                  </div>

                  <div>
                    <strong className="text-slate-400 block text-[11px] mb-0.5">
                      Connection Management & Backups
                    </strong>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      {opt.connectionManagement} · {opt.backups}
                    </p>
                  </div>

                  <div>
                    <strong className="text-slate-400 block text-[11px] mb-0.5">
                      Security Boundaries
                    </strong>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      {opt.securityBoundaries}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
