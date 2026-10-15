import React, { useState } from "react";
import {
  X,
  Trash2,
  Cpu,
  Scale,
  Copy,
  Check,
  AlertTriangle,
  Zap,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  Server,
  Database
} from "lucide-react";
import { ArchitectureNode, DSANodeType } from "../../types";
import { DSA_SYSTEM_DESIGN_MAP } from "../../data/dsaSystemDesignMap";
import { ProviderLogo, ServiceIcon } from "./CloudIcons";

interface ComponentInspectorProps {
  node: ArchitectureNode;
  onClose: () => void;
  onUpdateNode: (nodeId: string, updatedData: any) => void;
  onRemoveNode: (nodeId: string) => void;
  onTriggerChaosOnNode?: (nodeId: string) => void;
}

export const ComponentInspector: React.FC<ComponentInspectorProps> = ({
  node,
  onClose,
  onUpdateNode,
  onRemoveNode,
  onTriggerChaosOnNode
}) => {
  const { data } = node;
  const [activeTab, setActiveTab] = useState<"overview" | "system-design" | "resilience">("overview");
  const [codeLanguage, setCodeLanguage] = useState<"typescript" | "python">("typescript");
  const [copiedCode, setCopiedCode] = useState(false);

  // Determine node type knowledge
  const resolvedNodeType: DSANodeType =
    data.nodeType ||
    (node.id.includes("cdn")
      ? "cdn"
      : node.id.includes("waf")
      ? "waf"
      : node.id.includes("lb")
      ? "lb"
      : node.id.includes("compute")
      ? "app"
      : node.id.includes("pooler")
      ? "pgbouncer"
      : node.id.includes("db")
      ? "postgres"
      : node.id.includes("cache")
      ? "redis"
      : node.id.includes("storage")
      ? "s3"
      : node.id.includes("queue")
      ? "queue"
      : "app");

  const dsaKnowledge = DSA_SYSTEM_DESIGN_MAP[resolvedNodeType] || DSA_SYSTEM_DESIGN_MAP.app;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl flex flex-col text-slate-200 transition-all duration-300">
      {/* Drawer Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <ProviderLogo provider={data.provider || "Cloud"} size={22} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {data.zone === "public" ? "Public Edge" : data.zone === "app-subnet" ? "VPC Subnet" : "Private Subnet"}
              </span>
              <span className="text-xs text-slate-500 font-mono">ID: {node.id}</span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
              {data.title}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950 px-4 text-xs">
        {[
          { id: "overview", label: "Overview & Specs", icon: Cpu },
          { id: "system-design", label: "System Design & CAP", icon: Scale },
          { id: "resilience", label: "Failure Modes & SLA", icon: Shield }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-1.5 px-3.5 py-2.5 border-b-2 font-semibold transition-all cursor-pointer ${
                isActive
                  ? "border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t-lg"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* TAB 1: OVERVIEW & CONFIG */}
        {activeTab === "overview" && (
          <div className="space-y-5">
            {/* Metadata Pills */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                  Security Zone
                </span>
                <span className="font-bold text-slate-200 capitalize">
                  {data.zone === "public"
                    ? "Public Internet Edge"
                    : data.zone === "app-subnet"
                    ? "VPC App Subnet"
                    : "Private Isolated Data Subnet"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                  Provider Runtime
                </span>
                <span className="font-bold text-indigo-300">{data.provider}</span>
              </div>
            </div>

            {/* Editable Title & Subtitle */}
            <div className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                Custom Component Configuration
              </h4>
              <div>
                <label className="block text-slate-400 text-xs mb-1 font-medium">Component Label</label>
                <input
                  type="text"
                  value={data.title}
                  onChange={e => onUpdateNode(node.id, { ...data, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1 font-medium">Subtitle / Specs</label>
                <input
                  type="text"
                  value={data.subtitle}
                  onChange={e => onUpdateNode(node.id, { ...data, subtitle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Instances count */}
              {data.instances !== undefined && (
                <div className="pt-2">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-slate-300 font-medium">Instance Scale Count</span>
                    <span className="text-indigo-400 font-bold">{data.instances} Nodes</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="16"
                    value={data.instances}
                    onChange={e => {
                      const count = Number(e.target.value);
                      onUpdateNode(node.id, {
                        ...data,
                        instances: count,
                        subtitle: `${count} node(s) · Active Cluster`
                      });
                    }}
                    className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}

              {/* High Availability Toggle */}
              {node.category === "database" && (
                <label className="flex items-center space-x-2.5 p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer mt-3">
                  <input
                    type="checkbox"
                    checked={Boolean(data.isHA)}
                    onChange={e =>
                      onUpdateNode(node.id, {
                        ...data,
                        isHA: e.target.checked,
                        subtitle: e.target.checked
                          ? "Multi-AZ Synchronous Standby"
                          : "Single Node Instance"
                      })
                    }
                    className="w-4 h-4 rounded accent-indigo-600 bg-slate-900 border-slate-700"
                  />
                  <div className="text-xs">
                    <span className="text-white font-semibold block">Multi-AZ Standby Replication</span>
                    <span className="text-slate-400 text-[11px]">
                      Synchronous failover within sub-60s
                    </span>
                  </div>
                </label>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onRemoveNode(node.id)}
                className="px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Node from Canvas</span>
              </button>

              {onTriggerChaosOnNode && (
                <button
                  type="button"
                  onClick={() => onTriggerChaosOnNode(node.id)}
                  className="px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Simulate Node Failure</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SYSTEM DESIGN & CAP THEOREM */}
        {activeTab === "system-design" && (
          <div className="space-y-6 text-xs">
            {/* CAP Theorem Classification */}
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-indigo-400">
                  CAP Theorem Trade-Off
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono font-bold text-[10px]">
                  {dsaKnowledge.systemDesign.capTheorem}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed text-xs">
                {dsaKnowledge.systemDesign.capExplanation}
              </p>
            </div>

            {/* Throughput Math & QPS Estimation */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <Scale className="w-3.5 h-3.5 text-indigo-400" />
                <span>Throughput Math & Sizing Formula</span>
              </h4>
              <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-indigo-300 text-xs border border-slate-800">
                {dsaKnowledge.systemDesign.throughputMath.formula}
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {dsaKnowledge.systemDesign.throughputMath.explanation}
              </p>
              <div className="text-[11px] text-slate-400 italic">
                Example: {dsaKnowledge.systemDesign.throughputMath.exampleCalc}
              </div>
            </div>

            {/* Architectural Pattern */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 text-[11px]">
              <strong className="text-white block mb-1">Production Architecture Pattern:</strong>
              {dsaKnowledge.systemDesign.faangPattern}
            </div>
          </div>
        )}

        {/* TAB 3: RESILIENCE & FAILURE MODES */}
        {activeTab === "resilience" && (
          <div className="space-y-6 text-xs">
            {/* Primary Role */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 leading-relaxed">
              <span className="font-bold text-white block mb-1">Service SLA & Boundary:</span>
              {dsaKnowledge.primaryRole}
            </div>

            {/* Failure Modes & Mitigations */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Known Production Failure Modes & Auto-Recovery</span>
              </h4>
              <div className="space-y-3">
                {dsaKnowledge.systemDesign.failureModes.map((fm, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300 text-xs">{fm.name}</span>
                      <span className="text-[10px] text-rose-400 font-semibold">{fm.blastRadius}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      <strong className="text-slate-300">Symptoms: </strong>
                      {fm.symptoms}
                    </p>
                    <p className="text-[11px] text-emerald-400">
                      <strong className="text-emerald-300">Mitigation: </strong>
                      {fm.mitigation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Drawer Footer */}
      <div className="p-3 px-5 border-t border-slate-800 bg-slate-900/80 text-[11px] text-slate-400 flex items-center justify-between">
        <span>CloudBlueprint 2026 Component Inspector</span>
        <button
          type="button"
          onClick={onClose}
          className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
        >
          Close Drawer
        </button>
      </div>
    </div>
  );
};

