import React from "react";
import { Terminal, Shield, Play, Sliders, Activity, Database, DollarSign } from "lucide-react";
import {
  Requirements,
  DatabaseType,
  DatabaseHosting,
  AvailabilityTarget,
  OpsPreference,
  Region,
  Currency
} from "../../types";

interface DevOpsModeFormProps {
  requirements: Requirements;
  onChange: (updated: Partial<Requirements>) => void;
  onGenerate: () => void;
  isLoading?: boolean;
}

export const DevOpsModeForm: React.FC<DevOpsModeFormProps> = ({
  requirements,
  onChange,
  onGenerate,
  isLoading = false
}) => {
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onGenerate();
      }}
      className="space-y-4 bg-slate-900/90 p-5 rounded-xl border border-slate-800 text-xs sm:text-sm shadow-xl"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <h3 className="font-semibold text-white">DevOps Architect Mode</h3>
        </div>
        <span className="text-[11px] text-indigo-400 font-mono">Fine-Grained SLA & IOPS</span>
      </div>

      {/* Grid Row 1: Runtime Stack & Instances */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-300 font-medium mb-1 text-xs">Runtime Stack</label>
          <select
            value={requirements.stack}
            onChange={e => onChange({ stack: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
          >
            <option value="node">Node.js (Express / Fastify)</option>
            <option value="python">Python (FastAPI / Django)</option>
            <option value="go">Go (High Concurrency)</option>
            <option value="docker">Docker Multi-Container</option>
            <option value="coolify">Coolify PaaS (Hostinger KVM)</option>
            <option value="nextjs">Next.js SSR / Fullstack</option>
            <option value="php">PHP / Laravel (FPM)</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1 text-xs">Compute Nodes</label>
          <input
            type="number"
            min="1"
            max="16"
            value={requirements.nodes}
            onChange={e => onChange({ nodes: Math.max(1, Math.min(16, Number(e.target.value))) })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
          />
        </div>
      </div>

      {/* DevOps Granular Sliders Section */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-white uppercase tracking-wider">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span>Throughput & Workload Parameters</span>
        </div>

        {/* Peak RPS Slider */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-300">Peak Ingress RPS (Requests / Sec)</span>
            <span className="text-emerald-400 font-mono font-bold">
              {(requirements.peakRps || 500).toLocaleString()} RPS
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="25000"
            step="50"
            value={requirements.peakRps || 500}
            onChange={e => onChange({ peakRps: Number(e.target.value) })}
            className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
            <span>50 RPS</span>
            <span>2.5k RPS</span>
            <span>10k RPS</span>
            <span>25k RPS</span>
          </div>
        </div>

        {/* Read/Write Ratio & Average Payload */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-slate-300 font-medium mb-1 text-xs">Read/Write Ratio</label>
            <select
              value={requirements.readWriteRatio || "80/20"}
              onChange={e => onChange({ readWriteRatio: e.target.value as any })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
            >
              <option value="95/5">95% Read / 5% Write (Content/Media)</option>
              <option value="80/20">80% Read / 20% Write (Standard SaaS)</option>
              <option value="50/50">50% Read / 50% Write (Transactional POS)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1 text-xs">Avg Payload Size (KB)</label>
            <input
              type="number"
              min="1"
              max="500"
              value={requirements.avgPayloadKb || 8}
              onChange={e => onChange({ avgPayloadKb: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
            />
          </div>
        </div>

        {/* DB IOPS Requirement Slider */}
        <div className="pt-1">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-300 flex items-center space-x-1">
              <Database className="w-3 h-3 text-indigo-400" />
              <span>Database Storage IOPS</span>
            </span>
            <span className="text-violet-400 font-mono font-bold">
              {(requirements.dbIops || 3000).toLocaleString()} IOPS{" "}
              {(requirements.dbIops || 3000) > 10000 ? "(NVMe Required)" : ""}
            </span>
          </div>
          <input
            type="range"
            min="500"
            max="35000"
            step="500"
            value={requirements.dbIops || 3000}
            onChange={e => onChange({ dbIops: Number(e.target.value) })}
            className="w-full accent-violet-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
            <span>500 (HDD/Standard)</span>
            <span>3,000 (Baseline SSD)</span>
            <span>20,000+ (Hostinger Gen4 NVMe)</span>
          </div>
        </div>

        {/* Renewal TCO Horizon & Currency */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-slate-300 font-medium mb-1 text-xs">TCO Horizon</label>
            <select
              value={requirements.renewalHorizonYears || 1}
              onChange={e => onChange({ renewalHorizonYears: Number(e.target.value) as 1 | 3 })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
            >
              <option value="1">1-Year Horizon (Introductory)</option>
              <option value="3">3-Year Horizon (Factoring Renewal)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1 text-xs">Currency</label>
            <select
              value={requirements.currency || "USD"}
              onChange={e => onChange({ currency: e.target.value as Currency })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs font-semibold"
            >
              <option value="USD">USD ($) United States</option>
              <option value="INR">INR (₹) India Rupee</option>
              <option value="EUR">EUR (€) Eurozone</option>
              <option value="GBP">GBP (£) British Pound</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Row 2: Database Engine & Hosting Model */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-300 font-medium mb-1 text-xs">Database Engine</label>
          <select
            value={requirements.database}
            onChange={e => onChange({ database: e.target.value as DatabaseType })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
          >
            <option value="postgres">PostgreSQL 16</option>
            <option value="mysql">MySQL 8.0</option>
            <option value="mongo">MongoDB Document DB</option>
            <option value="redis">Redis (Standalone Cache)</option>
            <option value="none">No Database (Stateless)</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1 text-xs">Database Hosting</label>
          <select
            value={requirements.dbHosting}
            onChange={e => onChange({ dbHosting: e.target.value as DatabaseHosting })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
          >
            <option value="managed">Managed VPC (RDS / DO Managed)</option>
            <option value="serverless">Serverless (Neon / Supabase)</option>
            <option value="self">Self-Hosted NVMe Container (Hostinger / Coolify)</option>
            <option value="none">None</option>
          </select>
        </div>
      </div>

      {/* High Availability & Data Transfer */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-300 font-medium mb-1 text-xs">Availability SLA</label>
          <select
            value={requirements.availability}
            onChange={e => onChange({ availability: e.target.value as AvailabilityTarget })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
          >
            <option value="standard">Standard (Single AZ, 99.5%)</option>
            <option value="ha">High Availability (Multi-AZ Standby, 99.99%)</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1 text-xs">Data Transfer (GB/mo)</label>
          <input
            type="number"
            min="50"
            max="50000"
            value={requirements.trafficGB}
            onChange={e => onChange({ trafficGB: Number(e.target.value) })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
          />
        </div>
      </div>

      {/* Target Region */}
      <div>
        <label className="block text-slate-300 font-medium mb-1 text-xs">Deployment Region</label>
        <select
          value={requirements.region}
          onChange={e => onChange({ region: e.target.value as Region })}
          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
        >
          <option value="india">India (Mumbai / Bangalore / ap-south-1)</option>
          <option value="europe">Europe (Frankfurt / Lithuania / Paris)</option>
          <option value="us">North America (Phoenix / us-east-1 / Ashburn)</option>
          <option value="global">Global Multi-Region Anycast Edge</option>
        </select>
      </div>

      {/* Compliance & Backups Checkboxes */}
      <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
        <label className="flex items-start space-x-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={requirements.compliance}
            onChange={e => onChange({ compliance: e.target.checked })}
            className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
          />
          <div className="text-xs">
            <span className="font-semibold text-slate-200">Regulatory Compliance Mandate</span>
            <span className="text-[11px] text-slate-400 block">
              SOC 2 Type II, HIPAA, ISO 27001 (Requires AWS Enterprise Tier)
            </span>
          </div>
        </label>

        <label className="flex items-start space-x-2.5 cursor-pointer pt-1 border-t border-slate-800/80">
          <input
            type="checkbox"
            checked={requirements.backup}
            onChange={e => onChange({ backup: e.target.checked })}
            className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
          />
          <div className="text-xs">
            <span className="font-semibold text-slate-200">Automated Snapshots & Point-in-Time Recovery</span>
            <span className="text-[11px] text-slate-400 block">
              Continuous WAL archiving + weekly snapshots
            </span>
          </div>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
      >
        <Play className="w-3.5 h-3.5 fill-current" />
        <span>{isLoading ? "Recalculating Architecture..." : "Re-Synthesize Topology & Sizing"}</span>
      </button>
    </form>
  );
};
