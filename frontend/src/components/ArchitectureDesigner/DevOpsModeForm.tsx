import React from "react";
import { Terminal, Shield, Play } from "lucide-react";
import {
  Requirements,
  DatabaseType,
  DatabaseHosting,
  AvailabilityTarget,
  OpsPreference,
  Region
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
      className="space-y-4 bg-slate-900/90 p-5 rounded-xl border border-slate-800 text-xs sm:text-sm"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <h3 className="font-semibold text-white">DevOps / System Designer Mode</h3>
        </div>
        <span className="text-[11px] text-slate-400">Granular infrastructure specs</span>
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
            <option value="self">Self-Hosted Container on VPS</option>
            <option value="none">None</option>
          </select>
        </div>
      </div>

      {/* Resource Tier & Ops Model */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-300 font-medium mb-1 text-xs">Instance Sizing Tier</label>
          <select
            value={requirements.resourceTier}
            onChange={e => onChange({ resourceTier: e.target.value as any })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
          >
            <option value="small">Small (1–2 vCPU, 2GB RAM)</option>
            <option value="medium">Medium (2 vCPU, 4GB RAM)</option>
            <option value="large">Large (4 vCPU, 8GB RAM)</option>
            <option value="xlarge">X-Large (8 vCPU, 16GB RAM)</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1 text-xs">Operations Preference</label>
          <select
            value={requirements.ops}
            onChange={e => onChange({ ops: e.target.value as OpsPreference })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
          >
            <option value="managed">Managed Cloud Platform</option>
            <option value="self">Self-Managed (Coolify / Docker)</option>
            <option value="serverless">Serverless / PaaS Runtime</option>
          </select>
        </div>
      </div>

      {/* High Availability & Egress */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-300 font-medium mb-1 text-xs">Availability SLA</label>
          <select
            value={requirements.availability}
            onChange={e => onChange({ availability: e.target.value as AvailabilityTarget })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
          >
            <option value="standard">Standard (Single AZ, 99.5%)</option>
            <option value="ha">High Availability (Multi-AZ, 99.99%)</option>
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
          <option value="europe">Europe (Frankfurt / eu-central-1 / Falkenstein)</option>
          <option value="us">North America (us-east-1 / us-west-2 / Ashburn)</option>
          <option value="global">Global Multi-Region Anycast</option>
        </select>
      </div>

      {/* Compliance & Backups Checkboxes */}
      <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
        <label className="flex items-start space-x-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={requirements.compliance}
            onChange={e => onChange({ compliance: e.target.checked })}
            className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-0"
          />
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-200">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>Enterprise Compliance Framework</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Requires certified SOC 2, HIPAA, or ISO 27001 audited cloud primitives and KMS encryption.
            </p>
          </div>
        </label>

        <label className="flex items-start space-x-2.5 cursor-pointer pt-2 border-t border-slate-800/60">
          <input
            type="checkbox"
            checked={requirements.backup}
            onChange={e => onChange({ backup: e.target.checked })}
            className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-0"
          />
          <div>
            <span className="text-xs font-semibold text-slate-200">Automated Encrypted Snapshots</span>
            <p className="text-[11px] text-slate-400">
              Schedules continuous daily backups and WAL archives to offsite object storage (R2/S3).
            </p>
          </div>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="button"
        onClick={onGenerate}
        disabled={isLoading}
        className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
      >
        <Play className="w-3.5 h-3.5 fill-current" />
        <span>{isLoading ? "Recalculating Architecture…" : "Regenerate DevOps Topology"}</span>
      </button>
    </form>
  );
};
