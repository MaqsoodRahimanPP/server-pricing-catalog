import React from "react";
import {
  Server,
  Database,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FolderOpen
} from "lucide-react";
import { ProviderItem, SavedProject, CostEstimate, ArchitectureGraph } from "../../types";

interface OverviewDashboardProps {
  providers: ProviderItem[];
  savedProjects: SavedProject[];
  currentCostEstimate: CostEstimate | null;
  currentArchitecture: ArchitectureGraph | null;
  onNavigate: (tab: string) => void;
  onSelectProject: (project: SavedProject) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  providers,
  savedProjects,
  currentCostEstimate,
  currentArchitecture,
  onNavigate,
  onSelectProject
}) => {
  const verifiedCount = providers.filter(p => p.pricingStatus === "verified").length;
  const latestProject = savedProjects.length > 0 ? savedProjects[0] : null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-900/40 p-6 sm:p-8">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
            <span>Cloud Infrastructure Planner & FinOps Baseline 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Production Cloud Architecture & Cost Intelligence
          </h1>
          <p className="text-sm sm:text-base text-slate-300">
            Generate workload-tailored architecture topologies across 3 recommendation tiers, model multi-cloud costs deterministically, inspect network boundaries, and optimize with FinOps rules.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate("designer")}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2"
            >
              <span>Launch Architecture Designer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate("catalog")}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700 transition-all"
            >
              Compare Cloud Providers
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Providers */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Supported Providers</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">{providers.length}</div>
            <p className="text-xs text-slate-400 mt-0.5">
              {verifiedCount} verified pricing baseline models
            </p>
          </div>
        </div>

        {/* Saved Projects */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Saved Projects</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <FolderOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">{savedProjects.length}</div>
            <p className="text-xs text-slate-400 mt-0.5">Persisted in SQLite database</p>
          </div>
        </div>

        {/* Current Architecture */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Topology</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white truncate">
              {currentArchitecture ? `${currentArchitecture.nodes.length} Components` : "Default SaaS"}
            </div>
            <p className="text-xs text-emerald-400 mt-0.5 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 inline" />
              <span>3 Security Subnets</span>
            </p>
          </div>
        </div>

        {/* Monthly Estimate */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Monthly Run Rate</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">
              {currentCostEstimate ? currentCostEstimate.formatted.totalMonthly : "$75/mo"}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentCostEstimate
                ? `${currentCostEstimate.formatted.annualProjected} / year`
                : "Standard baseline sizing"}
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Latest Saved Architecture & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Latest Saved Project Banner */}
          <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-semibold text-white">Latest Saved Architecture</h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("projects")}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                View all saved ({savedProjects.length}) →
              </button>
            </div>

            {latestProject ? (
              <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-white">{latestProject.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 uppercase font-semibold">
                      {latestProject.selectedTier}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Target: {latestProject.requirements.users?.toLocaleString() || "10,000"} users ·{" "}
                    {latestProject.requirements.nodes || 2} nodes ·{" "}
                    {latestProject.requirements.database?.toUpperCase() || "POSTGRES"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Saved: {new Date(latestProject.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-base font-bold text-emerald-400">
                      ${latestProject.costEstimate?.totalMonthlyUSD || 0}/mo
                    </div>
                    <div className="text-[11px] text-slate-400">Estimated cost</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectProject(latestProject);
                      onNavigate("designer");
                    }}
                    className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                  >
                    Open
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-lg bg-slate-950/40 border border-dashed border-slate-800 text-center space-y-2">
                <Layers className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm text-slate-400">No saved projects yet</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Design an architecture and click "Save Project to Database" to preserve your design permanently.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate("designer")}
                  className="mt-2 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-semibold"
                >
                  Create Your First Project
                </button>
              </div>
            )}
          </div>

          {/* FinOps Quick Recommendations */}
          <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingDown className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-semibold text-white">Recommended FinOps Cost Savings</h2>
            </div>

            <div className="space-y-3">
              {[
                {
                  title: "Cloudflare Edge Asset Caching",
                  action: "Offload static assets and API read cache to edge nodes.",
                  savings: "Est. 60–80% origin egress savings"
                },
                {
                  title: "PgBouncer Connection Pooling",
                  action: "Prevent database connection memory saturation during spikes.",
                  savings: "Allows rightsizing DB compute, saving $40–$120/mo"
                },
                {
                  title: "Cloudflare R2 for Object Storage",
                  action: "Replace AWS S3 with R2 for zero public internet egress fees.",
                  savings: "$0/GB egress fee vs $0.09/GB on S3"
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-4"
                >
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-semibold text-slate-200">{item.title}</h3>
                    <p className="text-xs text-slate-400">{item.action}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-400 whitespace-nowrap bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {item.savings}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/60 flex justify-end">
              <button
                type="button"
                onClick={() => onNavigate("finops")}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                View all 13 FinOps & Security Advisory Rules →
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Security & Reliability Warnings */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center space-x-2 mb-4">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-semibold text-white">Security & Reliability Guards</h2>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 space-y-1">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Public Database Ingress Guard</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  PostgreSQL port 5432 and MySQL 3306 must never be exposed to 0.0.0.0/0. CloudBlueprint isolates databases in private subnets with security group constraints.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 space-y-1">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-blue-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Automated Rollback & Health Check</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Application Load Balancers must ping a dedicated `/health` route and automatically halt rolling container updates if health checks fail.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20 space-y-1">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-purple-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Zero Plaintext Credentials</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Database connection URIs and encryption keys must be injected via runtime environment variables or KMS; never committed to git repositories.
                </p>
              </div>
            </div>

            {/* Quick Navigation Cards */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Quick Navigation
              </span>
              <button
                type="button"
                onClick={() => onNavigate("calculator")}
                className="w-full text-left px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-xs text-slate-200 transition-colors flex items-center justify-between"
              >
                <span>Cost Calculator & Scenarios</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate("database-advisor")}
                className="w-full text-left px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-xs text-slate-200 transition-colors flex items-center justify-between"
              >
                <span>Database Advisor (RDS vs Neon vs Supabase)</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate("catalog")}
                className="w-full text-left px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-xs text-slate-200 transition-colors flex items-center justify-between"
              >
                <span>Provider Pricing Catalog</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
