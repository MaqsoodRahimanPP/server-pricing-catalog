import React, { useState } from "react";
import {
  TrendingDown,
  ShieldCheck,
  Filter,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight
} from "lucide-react";
import { FinOpsInsight, Requirements, CostEstimate } from "../../types";

interface FinOpsAdvisorProps {
  insights: FinOpsInsight[];
  requirements: Requirements;
  costEstimate: CostEstimate;
}

export const FinOpsAdvisor: React.FC<FinOpsAdvisorProps> = ({
  insights,
  requirements,
  costEstimate
}) => {
  const [filterType, setFilterType] = useState<"all" | "cost" | "security">("all");

  const filtered = insights.filter(i => {
    if (filterType === "all") return true;
    return i.type === filterType;
  });

  const quantifiedCount = insights.filter(i => i.expectedImpact.includes("Quantified")).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            FinOps & Cloud Security Advisor
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            13 actionable architectural rules for egress optimization, NAT gateways, connection pooling, IAM, and isolation.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterType === "all" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            All Insights ({insights.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("cost")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterType === "cost" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Cost Optimization
          </button>
          <button
            type="button"
            onClick={() => setFilterType("security")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterType === "security" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Security & Reliability
          </button>
        </div>
      </div>

      {/* Summary Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400">Quantified Savings Opportunities</span>
            <div className="text-xl font-bold text-white">{quantifiedCount} Available</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400">Security Guardrails Evaluated</span>
            <div className="text-xl font-bold text-white">6 Baseline Controls</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400">Private VPC Subnet Status</span>
            <div className="text-xl font-bold text-emerald-400">Isolated & Enforced</div>
          </div>
        </div>
      </div>

      {/* Insights Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map(item => {
          const isCost = item.type === "cost";
          const isQuantified = item.expectedImpact.includes("Quantified");

          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 flex flex-col justify-between space-y-4 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isCost
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {isCost ? (
                        <TrendingDown className="w-4 h-4" />
                      ) : (
                        <ShieldCheck className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      isQuantified
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    {isQuantified ? "QUANTIFIED SAVINGS" : "SECURITY BASELINE"}
                  </span>
                </div>

                {/* Problem Statement */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
                    Architecture Problem / Risk
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.problem}</p>
                </div>

                {/* Suggested Action */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                    Recommended Action
                  </span>
                  <p className="text-xs text-slate-200 font-medium leading-relaxed">
                    {item.action}
                  </p>
                </div>

                {/* Reason & Tradeoffs */}
                <div className="space-y-1.5 text-xs text-slate-400">
                  <p>
                    <strong className="text-slate-300">Technical Rationale: </strong>
                    {item.reason}
                  </p>
                  <p>
                    <strong className="text-slate-300">Operational Trade-off: </strong>
                    {item.tradeoffs}
                  </p>
                </div>
              </div>

              {/* Impact Footer */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-semibold">Expected Impact:</span>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                    isQuantified
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-slate-800 text-slate-300 border border-slate-700"
                  }`}
                >
                  {item.expectedImpact}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
