import React from "react";
import { Server, Sparkles, Terminal, Activity, Plus, Info } from "lucide-react";
import { PlanningMode } from "../types";

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  planningMode: PlanningMode;
  onModeChange: (mode: PlanningMode) => void;
  backendOnline: boolean;
  onNewArchitecture: () => void;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  planningMode,
  onModeChange,
  backendOnline,
  onNewArchitecture,
  savedCount
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange("dashboard")}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Server className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-lg text-white tracking-tight">CloudBlueprint</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">2026</span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Architecture & Multi-Cloud FinOps</p>
          </div>
        </div>

        {/* Enhanced Intuitive Mode Selector with Visual Indicators & Tooltips */}
        <div className="hidden md:flex items-center bg-slate-950/90 p-1 rounded-xl border border-slate-800 shadow-inner">
          {/* Founder Mode Button */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => onModeChange("founder")}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                planningMode === "founder"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${planningMode === "founder" ? "text-amber-300" : "text-slate-400"}`} />
              <span>Founder Mode</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase transition-colors ${
                planningMode === "founder"
                  ? "bg-white/20 text-white"
                  : "bg-slate-800 text-slate-400"
              }`}>
                TCO & Growth
              </span>
            </button>

            {/* Founder Mode Tooltip */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-2.5 rounded-lg bg-slate-900 text-slate-200 text-[11px] border border-slate-700 shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 leading-relaxed">
              <div className="font-bold text-indigo-400 mb-0.5 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Founder Mode View</span>
              </div>
              High-level TCO & business metrics. Streamlined sliders for MAU, traffic tiers, and estimated monthly run-rate.
            </div>
          </div>

          {/* DevOps Mode Button */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => onModeChange("devops")}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                planningMode === "devops"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
            >
              <Terminal className={`w-3.5 h-3.5 ${planningMode === "devops" ? "text-emerald-300" : "text-slate-400"}`} />
              <span>DevOps Mode</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase transition-colors ${
                planningMode === "devops"
                  ? "bg-white/20 text-white"
                  : "bg-slate-800 text-slate-400"
              }`}>
                Infra & Specs
              </span>
            </button>

            {/* DevOps Mode Tooltip */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-2.5 rounded-lg bg-slate-900 text-slate-200 text-[11px] border border-slate-700 shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 leading-relaxed">
              <div className="font-bold text-emerald-400 mb-0.5 flex items-center space-x-1">
                <Terminal className="w-3 h-3 text-emerald-400" />
                <span>DevOps Mode View</span>
              </div>
              Granular infrastructure specs. Fine-tune vCPU/RAM allocation, read/write ratios, disk IOPS, and network topology.
            </div>
          </div>
        </div>

        {/* Navigation Tabs (DSA Academy completely removed) */}
        <nav className="hidden lg:flex items-center space-x-1">
          {[
            { id: "dashboard", label: "Dashboard" },
            { id: "designer", label: "Architecture Designer" },
            { id: "catalog", label: "Provider Catalog" },
            { id: "calculator", label: "Cost Calculator" },
            { id: "database-advisor", label: "Database Advisor" },
            { id: "finops", label: "FinOps Advisor" },
            { id: "projects", label: `Saved (${savedCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1.5 cursor-pointer ${
                currentTab === tab.id
                  ? "bg-slate-800 text-indigo-400 font-bold"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Status Pill & Action */}
        <div className="flex items-center space-x-3">
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              backendOnline
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-amber-500/10 border-amber-500/30 text-amber-400"
            }`}
            title={backendOnline ? "Connected to SQLite backend API" : "Operating in offline local-first calculation mode"}
          >
            <Activity className="w-3 h-3 animate-pulse" />
            <span className="hidden sm:inline">{backendOnline ? "ONLINE DB" : "OFFLINE READY"}</span>
          </div>

          <button
            type="button"
            onClick={onNewArchitecture}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Blueprint</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Bar (DSA Academy completely removed) */}
      <div className="lg:hidden flex overflow-x-auto space-x-1 px-4 py-2 bg-slate-950 border-t border-slate-800 text-xs">
        {[
          { id: "dashboard", label: "Dashboard" },
          { id: "designer", label: "Designer" },
          { id: "catalog", label: "Catalog" },
          { id: "calculator", label: "Calculator" },
          { id: "database-advisor", label: "DB Advisor" },
          { id: "finops", label: "FinOps" },
          { id: "projects", label: `Saved (${savedCount})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`whitespace-nowrap px-2.5 py-1 rounded-md text-[11px] font-medium ${
              currentTab === tab.id
                ? "bg-indigo-600 text-white font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
};
