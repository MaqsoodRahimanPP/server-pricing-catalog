import React from "react";
import { Sparkles, RotateCcw, Play } from "lucide-react";
import { Requirements, ProjectType, Region } from "../../types";

interface FounderModeFormProps {
  requirements: Requirements;
  onChange: (updated: Partial<Requirements>) => void;
  onGenerate: () => void;
  onReset: () => void;
  onLoadExample: () => void;
  isLoading?: boolean;
}

export const FounderModeForm: React.FC<FounderModeFormProps> = ({
  requirements,
  onChange,
  onGenerate,
  onReset,
  onLoadExample,
  isLoading = false
}) => {
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onGenerate();
      }}
      className="space-y-5 bg-slate-900/90 p-5 rounded-xl border border-slate-800 text-xs sm:text-sm"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h3 className="font-semibold text-white">Founder Requirements Wizard</h3>
        </div>
        <span className="text-[11px] text-slate-400">Simplified high-level inputs</span>
      </div>

      {/* Project Name */}
      <div>
        <label className="block text-slate-300 font-medium mb-1.5 text-xs">Project Name</label>
        <input
          type="text"
          value={requirements.projectName}
          onChange={e => onChange({ projectName: e.target.value })}
          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
          placeholder="e.g. Acme SaaS Platform"
          required
        />
      </div>

      {/* Project Type */}
      <div>
        <label className="block text-slate-300 font-medium mb-1.5 text-xs">Workload Archetype</label>
        <select
          value={requirements.projectType}
          onChange={e => onChange({ projectType: e.target.value as ProjectType })}
          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
        >
          <option value="saas">SaaS Application (Web + API + DB + Redis Cache)</option>
          <option value="ecommerce">E-Commerce Platform (Transactions + High Availability)</option>
          <option value="food">Real-Time Logistics / Food Delivery (High WebSocket Concurrency)</option>
          <option value="pos">Cloud POS & Retail Platform (Zero-downtime reliability)</option>
          <option value="api">Backend Microservices API (Stateless Compute + Database)</option>
          <option value="media">Media Platform (High Egress & Object Storage Delivery)</option>
          <option value="portfolio">Portfolio / Jamstack Static Website (Edge CDN delivery)</option>
        </select>
      </div>

      {/* Users Slider */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-slate-300 font-medium text-xs">Estimated Monthly Active Users (MAU)</label>
          <span className="text-indigo-400 font-bold text-xs">{requirements.users.toLocaleString()} MAU</span>
        </div>
        <input
          type="range"
          min="1000"
          max="1000000"
          step="5000"
          value={requirements.users}
          onChange={e => {
            const users = Number(e.target.value);
            const traffic = Math.max(100, Math.round(users * 0.05));
            const nodes = users >= 500000 ? 4 : users >= 100000 ? 3 : users >= 20000 ? 2 : 1;
            onChange({ users, trafficGB: traffic, nodes });
          }}
          className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>1k</span>
          <span>50k</span>
          <span>250k</span>
          <span>500k</span>
          <span>1M</span>
        </div>
      </div>

      {/* Target Region */}
      <div>
        <label className="block text-slate-300 font-medium mb-1.5 text-xs">Target User Geographic Region</label>
        <select
          value={requirements.region}
          onChange={e => onChange({ region: e.target.value as Region })}
          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
        >
          <option value="india">India & South Asia (Mumbai / Bangalore / Singapore)</option>
          <option value="europe">Europe (Frankfurt / Amsterdam / London / Helsinki)</option>
          <option value="us">North America (US East / US West)</option>
          <option value="global">Global Multi-Region Traffic</option>
        </select>
      </div>

      {/* Monthly Budget Ceiling */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-slate-300 font-medium text-xs">Desired Monthly Budget Target</label>
          <span className="text-emerald-400 font-bold text-xs">${requirements.budgetUSD}/mo</span>
        </div>
        <input
          type="range"
          min="10"
          max="500"
          step="10"
          value={requirements.budgetUSD}
          onChange={e => onChange({ budgetUSD: Number(e.target.value) })}
          className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>$10</span>
          <span>$75</span>
          <span>$150</span>
          <span>$300</span>
          <span>$500+</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 space-y-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isLoading ? "Generating Recommendations…" : "Generate Architecture"}</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onReset}
            className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center justify-center space-x-1.5"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={onLoadExample}
            className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-medium"
          >
            Load Example
          </button>
        </div>
      </div>
    </form>
  );
};
