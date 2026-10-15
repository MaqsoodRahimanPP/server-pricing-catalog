import React from "react";
import { Server, Sparkles, Terminal, Activity, Plus } from "lucide-react";
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
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange("dashboard")}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Server className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-lg text-white tracking-tight">CloudBlueprint</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">2026</span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Architecture & FinOps Intelligence</p>
          </div>
        </div>

        {/* Planning Mode Switcher */}
        <div className="hidden md:flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => onModeChange("founder")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              planningMode === "founder"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Founder Mode</span>
          </button>
          <button
            type="button"
            onClick={() => onModeChange("devops")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              planningMode === "devops"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>DevOps Mode</span>
          </button>
        </div>

        {/* Navigation Tabs */}
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
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                currentTab === tab.id
                  ? "bg-slate-800 text-indigo-400 font-semibold"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              {tab.label}
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
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Project</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="lg:hidden flex overflow-x-auto px-4 py-2 space-x-1 border-t border-slate-800 bg-slate-900/50">
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
            className={`whitespace-nowrap px-3 py-1 rounded-md text-xs font-medium ${
              currentTab === tab.id
                ? "bg-indigo-600 text-white"
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
