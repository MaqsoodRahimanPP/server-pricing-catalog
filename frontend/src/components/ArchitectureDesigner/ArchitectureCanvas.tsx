import React, { useMemo } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  Handle,
  Position,
  NodeProps,
  Node,
  Edge
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Users,
  Globe,
  ShieldCheck,
  Scale,
  Server,
  Database,
  Layers,
  Zap,
  HardDrive,
  Network,
  Download,
  Plus,
  RefreshCw,
  Maximize2
} from "lucide-react";
import { ArchitectureNode, ArchitectureEdge, TrustBoundary } from "../../types";

const iconMap: Record<string, any> = {
  Users,
  Globe,
  ShieldCheck,
  Scale,
  Server,
  Database,
  Layers,
  Zap,
  HardDrive,
  Network
};

// Custom Node Component
const CustomArchitectureNode: React.FC<NodeProps> = ({ data, selected }) => {
  const IconComponent = iconMap[data.icon as string] || Server;

  const zoneBadgeColor =
    data.zone === "public"
      ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
      : data.zone === "app-subnet"
      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      : "bg-purple-500/20 text-purple-400 border-purple-500/30";

  return (
    <div
      className={`min-w-[190px] p-3 rounded-xl bg-slate-900 border text-left shadow-lg transition-all ${
        selected
          ? "border-indigo-500 shadow-indigo-500/20 ring-2 ring-indigo-500/50"
          : "border-slate-800 hover:border-slate-700"
      }`}
    >
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-indigo-500" />

      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
          <IconComponent className="w-4 h-4" />
        </div>
        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border ${zoneBadgeColor}`}>
          {data.zone === "public" ? "Public Edge" : data.zone === "app-subnet" ? "VPC App" : "Private DB"}
        </span>
      </div>

      <div className="space-y-0.5">
        <div className="text-xs font-bold text-white tracking-tight truncate">
          {data.title as string}
        </div>
        <div className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
          {data.subtitle as string}
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-500">
        <span>{String(data.provider || "")}</span>
        {Boolean(data.isHA) ? <span className="text-emerald-400 font-semibold">Multi-AZ</span> : null}
      </div>

      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-indigo-500" />
    </div>
  );
};

interface ArchitectureCanvasProps {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  boundaries: TrustBoundary[];
  selectedNodeId: string | null;
  onSelectNode: (node: ArchitectureNode | null) => void;
  onOpenAddComponent: () => void;
  onRegenerate: () => void;
  onExportDiagram: () => void;
}

export const ArchitectureCanvas: React.FC<ArchitectureCanvasProps> = ({
  nodes,
  edges,
  boundaries,
  selectedNodeId,
  onSelectNode,
  onOpenAddComponent,
  onRegenerate,
  onExportDiagram
}) => {
  const nodeTypes = useMemo(() => ({ default: CustomArchitectureNode }), []);

  const flowNodes: Node[] = useMemo(() => {
    return nodes.map(n => ({
      id: n.id,
      type: "default",
      position: n.position,
      data: n.data,
      selected: n.id === selectedNodeId
    }));
  }, [nodes, selectedNodeId]);

  const flowEdges: Edge[] = useMemo(() => {
    return edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: e.animated,
      style: { stroke: "#6366f1", strokeWidth: 2 }
    }));
  }, [edges]);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col h-[560px]">
      {/* Canvas Top Toolbar */}
      <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-10">
        {/* Trust Boundaries Indicator */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-medium hidden sm:inline">Trust Boundaries:</span>
          {boundaries.map(b => (
            <span
              key={b.id}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
              style={{
                backgroundColor: `${b.color}15`,
                borderColor: `${b.color}40`,
                color: b.color
              }}
            >
              {b.title.split("(")[0]}
            </span>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onOpenAddComponent}
            className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Component</span>
          </button>

          <button
            type="button"
            onClick={onRegenerate}
            title="Regenerate architecture from active requirements"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onExportDiagram}
            title="Export Architecture as PNG / SVG / JSON"
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Diagram</span>
          </button>
        </div>
      </div>

      {/* Main React Flow Canvas */}
      <div className="flex-1 w-full h-full relative" id="react-flow-diagram-container">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => {
            const original = nodes.find(n => n.id === node.id) || null;
            onSelectNode(original);
          }}
          onPaneClick={() => onSelectNode(null)}
          fitView
          attributionPosition="bottom-left"
          minZoom={0.2}
          maxZoom={2}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#1e293b" />
          <Controls className="bg-slate-900 border border-slate-800 text-slate-200" />
        </ReactFlow>
      </div>

      {/* Bottom Hint Footer */}
      <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Click any node to inspect properties, adjust configuration, or delete component.</span>
        <span className="text-slate-500 hidden sm:inline">Pan: Drag · Zoom: Scroll · Fit: Bottom-left icon</span>
      </div>
    </div>
  );
};
