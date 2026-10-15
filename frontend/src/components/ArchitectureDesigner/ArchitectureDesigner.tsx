import React, { useState } from "react";
import {
  Save,
  FileText,
  AlertCircle,
  CheckCircle2,
  Sliders,
  DollarSign,
  Layers,
  ArrowRight
} from "lucide-react";
import {
  Requirements,
  PlanningMode,
  RecommendationTier,
  ArchitectureGraph,
  ArchitectureNode,
  CostEstimate
} from "../../types";
import { FounderModeForm } from "./FounderModeForm";
import { DevOpsModeForm } from "./DevOpsModeForm";
import { RecommendationCards } from "./RecommendationCards";
import { ArchitectureCanvas } from "./ArchitectureCanvas";
import { ComponentInspector } from "./ComponentInspector";
import { AddComponentModal } from "./AddComponentModal";

interface ArchitectureDesignerProps {
  requirements: Requirements;
  onUpdateRequirements: (updated: Partial<Requirements>) => void;
  planningMode: PlanningMode;
  onModeChange: (mode: PlanningMode) => void;
  recommendations: RecommendationTier[];
  selectedTierId: "budget" | "balanced" | "enterprise";
  onSelectTier: (tierId: "budget" | "balanced" | "enterprise") => void;
  architecture: ArchitectureGraph;
  costEstimate: CostEstimate;
  onRegenerate: () => void;
  onSaveProject: () => void;
  onExport: () => void;
  onResetForm: () => void;
  onLoadExample: () => void;
  onNavigateToTab: (tab: string) => void;
  saveStatus: string | null;
  isSaving: boolean;
}

export const ArchitectureDesigner: React.FC<ArchitectureDesignerProps> = ({
  requirements,
  onUpdateRequirements,
  planningMode,
  onModeChange,
  recommendations,
  selectedTierId,
  onSelectTier,
  architecture,
  costEstimate,
  onRegenerate,
  onSaveProject,
  onExport,
  onResetForm,
  onLoadExample,
  onNavigateToTab,
  saveStatus,
  isSaving
}) => {
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Dynamic Component updates
  const handleUpdateNode = (nodeId: string, updatedData: any) => {
    architecture.nodes = architecture.nodes.map(n =>
      n.id === nodeId ? { ...n, data: updatedData } : n
    );
    setSelectedNode(prev => (prev ? { ...prev, data: updatedData } : null));
  };

  const handleRemoveNode = (nodeId: string) => {
    architecture.nodes = architecture.nodes.filter(n => n.id !== nodeId);
    architecture.edges = architecture.edges.filter(
      e => e.source !== nodeId && e.target !== nodeId
    );
    setSelectedNode(null);
  };

  const handleAddComponent = (newNode: ArchitectureNode) => {
    architecture.nodes.push(newNode);
    // Connect to app compute if appropriate
    const computeNode = architecture.nodes.find(n => n.category === "compute");
    if (computeNode) {
      architecture.edges.push({
        id: `e-${computeNode.id}-${newNode.id}`,
        source: computeNode.id,
        target: newNode.id,
        label: "Internal Connect",
        animated: true
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Save / Export Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {requirements.projectName || "Cloud Infrastructure Blueprint"}
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {selectedTierId} tier
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {requirements.users.toLocaleString()} MAU · {requirements.nodes} app instance(s) ·{" "}
            {requirements.region.toUpperCase()} ·{" "}
            {requirements.availability === "ha" ? "High Availability" : "Standard SLA"} ·{" "}
            {requirements.database.toUpperCase()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {saveStatus && (
            <span
              className={`text-xs px-2.5 py-1 rounded-md font-medium flex items-center space-x-1 ${
                saveStatus.includes("Error")
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              }`}
            >
              {saveStatus.includes("Error") ? (
                <AlertCircle className="w-3.5 h-3.5" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>{saveStatus}</span>
            </span>
          )}

          <button
            type="button"
            onClick={onSaveProject}
            disabled={isSaving}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving…" : "Save Project"}</span>
          </button>

          <button
            type="button"
            onClick={onExport}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Export Report & Diagram</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Form (1 col) + Right Architecture & Recommendations (2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Requirements Wizard */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Workload Inputs
            </span>
            <div className="flex items-center space-x-1 text-xs">
              <button
                type="button"
                onClick={() => onModeChange("founder")}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  planningMode === "founder" ? "bg-indigo-600 text-white" : "text-slate-400"
                }`}
              >
                Founder
              </button>
              <button
                type="button"
                onClick={() => onModeChange("devops")}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  planningMode === "devops" ? "bg-indigo-600 text-white" : "text-slate-400"
                }`}
              >
                DevOps
              </button>
            </div>
          </div>

          {planningMode === "founder" ? (
            <FounderModeForm
              requirements={requirements}
              onChange={onUpdateRequirements}
              onGenerate={onRegenerate}
              onReset={onResetForm}
              onLoadExample={onLoadExample}
            />
          ) : (
            <DevOpsModeForm
              requirements={requirements}
              onChange={onUpdateRequirements}
              onGenerate={onRegenerate}
            />
          )}

          {/* Quick Cost Sync Card */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Synchronized Sizing Cost</span>
              <span className="text-base font-extrabold text-emerald-400">
                {costEstimate.formatted.totalMonthly}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Includes {requirements.nodes} app node(s), {costEstimate.provider.name} database, and edge CDN.
            </p>
            <button
              type="button"
              onClick={() => onNavigateToTab("calculator")}
              className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Open Detailed Cost Calculator →</span>
            </button>
          </div>
        </div>

        {/* Right Column: 3-Tier Recommendations & React Flow Canvas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: 3-Tier Recommendations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Architecture Recommendation Tiers
              </span>
              <span className="text-[11px] text-slate-500">
                Compare 3 transparent options tailored to your constraints
              </span>
            </div>

            <RecommendationCards
              tiers={recommendations}
              selectedTierId={selectedTierId}
              onSelectTier={onSelectTier}
            />
          </div>

          {/* Section 2: Interactive React Flow Architecture Canvas */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Interactive Architecture Topology
                </span>
              </div>
              <span className="text-xs text-indigo-400 font-medium">
                {architecture.nodes.length} Active Nodes
              </span>
            </div>

            <ArchitectureCanvas
              nodes={architecture.nodes}
              edges={architecture.edges}
              boundaries={architecture.boundaries}
              selectedNodeId={selectedNode ? selectedNode.id : null}
              onSelectNode={setSelectedNode}
              onOpenAddComponent={() => setIsAddModalOpen(true)}
              onRegenerate={onRegenerate}
              onExportDiagram={onExport}
            />

            {/* Selected Node Inspector Drawer / Card */}
            {selectedNode && (
              <ComponentInspector
                node={selectedNode}
                onClose={() => setSelectedNode(null)}
                onUpdateNode={handleUpdateNode}
                onRemoveNode={handleRemoveNode}
              />
            )}
          </div>
        </div>
      </div>

      {/* Add Component Modal */}
      <AddComponentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddComponent={handleAddComponent}
        existingNodeIds={architecture.nodes.map(n => n.id)}
      />
    </div>
  );
};
