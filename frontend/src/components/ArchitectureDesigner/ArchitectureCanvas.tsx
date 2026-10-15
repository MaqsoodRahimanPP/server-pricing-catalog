import React, { useMemo, useState } from "react";
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
  Download,
  Plus,
  RefreshCw,
  Sparkles,
  Activity,
  Layers,
  ShieldCheck,
  Server,
  Database,
  Globe,
  Sliders,
  CheckCircle2,
  Lock,
  ArrowRight
} from "lucide-react";
import {
  ArchitectureNode,
  ArchitectureEdge,
  TrustBoundary
} from "../../types";
import { ProviderLogo, ServiceIcon } from "./CloudIcons";

// Memoized Custom Icon-Driven Cloud Node Component
const CustomArchitectureNode: React.FC<NodeProps> = React.memo(({ data, selected }) => {
  const zone = (data.zone as string) || "public";
  const provider = (data.provider as string) || "Cloud Provider";
  const category = (data.category as string) || "compute";
  const iconName = (data.icon as string) || "";
  const title = (data.title as string) || "Service";
  const subtitle = (data.subtitle as string) || "";
  const liveRps = data.liveRps !== undefined ? Number(data.liveRps) : null;
  const liveLatencyMs = data.liveLatencyMs !== undefined ? Number(data.liveLatencyMs) : null;
  const isHA = Boolean(data.isHA);

  const isHostinger = provider.toLowerCase().includes("hostinger");

  // Layer Accent Styles
  const layerStyle =
    zone === "public"
      ? {
          border: selected ? "border-blue-500 ring-2 ring-blue-500/60" : "border-blue-500/30 hover:border-blue-400",
          badgeBg: "bg-blue-500/20 text-blue-300 border-blue-500/40",
          iconBg: "bg-blue-500/15 border-blue-500/30",
          layerName: "Public Edge",
          layerIcon: Globe
        }
      : zone === "app-subnet"
      ? {
          border: selected ? "border-emerald-500 ring-2 ring-emerald-500/60" : "border-emerald-500/30 hover:border-emerald-400",
          badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
          iconBg: "bg-emerald-500/15 border-emerald-500/30",
          layerName: "VPC App",
          layerIcon: Server
        }
      : {
          border: selected ? "border-purple-500 ring-2 ring-purple-500/60" : "border-purple-500/30 hover:border-purple-400",
          badgeBg: "bg-purple-500/20 text-purple-300 border-purple-500/40",
          iconBg: "bg-purple-500/15 border-purple-500/30",
          layerName: "Private Data",
          layerIcon: Database
        };

  return (
    <div
      className={`min-w-[220px] max-w-[240px] p-3 rounded-2xl bg-slate-900/95 backdrop-blur-md border text-left shadow-2xl transition-all duration-150 relative ${
        layerStyle.border
      } ${selected ? "shadow-indigo-500/30 scale-[1.02]" : "hover:shadow-xl"}`}
    >
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-indigo-500 border border-slate-900" />

      {/* Top Header: Provider Logo & Layer Tag */}
      <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-800/80">
        <div className="flex items-center space-x-1.5 overflow-hidden">
          <ProviderLogo provider={provider} size={18} className="flex-shrink-0 rounded shadow" />
          <span className="text-[10px] font-bold text-slate-300 truncate max-w-[95px]" title={provider}>
            {provider}
          </span>
        </div>

        <div className="flex items-center space-x-1 flex-shrink-0">
          {isHostinger && (
            <span className="text-[8px] px-1 py-0.2 rounded font-extrabold uppercase bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center space-x-0.5">
              <Sparkles className="w-2 h-2 text-violet-400" />
              <span>NVMe</span>
            </span>
          )}
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase border ${layerStyle.badgeBg}`}>
            {layerStyle.layerName}
          </span>
        </div>
      </div>

      {/* Center Service Icon + Name */}
      <div className="flex items-start space-x-2.5 mb-2">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center border flex-shrink-0 shadow-inner ${layerStyle.iconBg}`}
        >
          <ServiceIcon category={category} iconName={iconName} size={20} />
        </div>

        <div className="space-y-0.5 overflow-hidden">
          <div className="text-xs font-bold text-white tracking-tight leading-snug line-clamp-1" title={title}>
            {title}
          </div>
          <div className="text-[10px] text-slate-400 leading-tight line-clamp-2" title={subtitle}>
            {subtitle}
          </div>
        </div>
      </div>

      {/* Live Metrics Pill */}
      {liveRps !== null && (
        <div className="mt-2 flex items-center justify-between text-[10px] py-1 px-2 rounded-lg bg-slate-950/90 border border-slate-800/80 font-mono">
          <span className="text-emerald-400 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>{liveRps} RPS</span>
          </span>
          <span className="text-slate-400">{liveLatencyMs || 5}ms</span>
          {isHA && <span className="text-indigo-400 font-semibold text-[9px]">HA Multi-AZ</span>}
        </div>
      )}

      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-indigo-500 border border-slate-900" />
    </div>
  );
});

CustomArchitectureNode.displayName = "CustomArchitectureNode";

interface ArchitectureCanvasProps {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  boundaries: TrustBoundary[];
  selectedNodeId: string | null;
  onSelectNode: (node: ArchitectureNode | null) => void;
  onOpenAddComponent: () => void;
  onRegenerate: () => void;
  onExportDiagram: () => void;
  selectedTierId?: string;
}

export const ArchitectureCanvas: React.FC<ArchitectureCanvasProps> = ({
  nodes,
  edges,
  boundaries,
  selectedNodeId,
  onSelectNode,
  onOpenAddComponent,
  onRegenerate,
  onExportDiagram,
  selectedTierId = "hostinger"
}) => {
  const nodeTypes = useMemo(() => ({ default: CustomArchitectureNode }), []);
  const [layerFilter, setLayerFilter] = useState<"all" | "public" | "app-subnet" | "data-subnet">("all");

  // Filter nodes if user clicks a specific layer filter
  const filteredNodes = useMemo(() => {
    if (layerFilter === "all") return nodes;
    return nodes.filter(n => n.data?.zone === layerFilter);
  }, [nodes, layerFilter]);

  const flowNodes: Node[] = useMemo(() => {
    return filteredNodes.map(n => ({
      id: n.id,
      type: "default",
      position: n.position,
      data: n.data,
      selected: n.id === selectedNodeId
    }));
  }, [filteredNodes, selectedNodeId]);

  const flowEdges: Edge[] = useMemo(() => {
    const activeNodeIds = new Set(filteredNodes.map(n => n.id));
    return edges
      .filter(e => activeNodeIds.has(e.source) && activeNodeIds.has(e.target))
      .map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        animated: true,
        style: {
          stroke: "#6366f1",
          strokeWidth: 2
        },
        labelStyle: {
          fill: "#e2e8f0",
          fontSize: 10,
          fontWeight: 600
        },
        labelBgStyle: {
          fill: "#0f172a",
          fillOpacity: 0.9,
          stroke: "#334155",
          strokeWidth: 1
        }
      }));
  }, [edges, filteredNodes]);

  // Counts by layer
  const layerCounts = useMemo(() => {
    return {
      all: nodes.length,
      public: nodes.filter(n => n.data?.zone === "public").length,
      app: nodes.filter(n => n.data?.zone === "app-subnet").length,
      data: nodes.filter(n => n.data?.zone === "data-subnet").length
    };
  }, [nodes]);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col h-[640px]">
      {/* Canvas Top Toolbar: Layer Filters & Action Controls */}
      <div className="p-3 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10">
        {/* Visual Layer Indicators / Focus Tabs */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setLayerFilter("all")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              layerFilter === "all"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Layers ({layerCounts.all})
          </button>
          <button
            type="button"
            onClick={() => setLayerFilter("public")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center space-x-1 cursor-pointer ${
              layerFilter === "public"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-blue-400 hover:text-blue-300"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span>Public Edge ({layerCounts.public})</span>
          </button>
          <button
            type="button"
            onClick={() => setLayerFilter("app-subnet")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center space-x-1 cursor-pointer ${
              layerFilter === "app-subnet"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-emerald-400 hover:text-emerald-300"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>VPC App ({layerCounts.app})</span>
          </button>
          <button
            type="button"
            onClick={() => setLayerFilter("data-subnet")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center space-x-1 cursor-pointer ${
              layerFilter === "data-subnet"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-purple-400 hover:text-purple-300"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>Private Data ({layerCounts.data})</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onOpenAddComponent}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Component</span>
          </button>

          <button
            type="button"
            onClick={onRegenerate}
            title="Regenerate architecture from active requirements"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onExportDiagram}
            title="Export Architecture Artifacts"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-700 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Visual Subnet & Layer Lane Watermark Header (Rendered above canvas) */}
      <div className="grid grid-cols-3 border-b border-slate-800/80 bg-slate-950/90 text-center py-1.5 px-4 text-[10px] font-bold uppercase tracking-wider z-10">
        <div className="text-blue-400/90 flex items-center justify-center space-x-1.5">
          <Globe className="w-3 h-3 text-blue-400" />
          <span>1. Public Edge & Ingress Zone</span>
        </div>
        <div className="text-emerald-400/90 flex items-center justify-center space-x-1.5 border-x border-slate-800">
          <Server className="w-3 h-3 text-emerald-400" />
          <span>2. Application VPC Subnet</span>
        </div>
        <div className="text-purple-400/90 flex items-center justify-center space-x-1.5">
          <Lock className="w-3 h-3 text-purple-400" />
          <span>3. Isolated Private Data Subnet</span>
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
      <div className="px-4 py-2 bg-slate-900/95 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center space-x-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Click any node to inspect cloud specifications, resource allocation, and scaling parameters.</span>
        </span>
        <span className="text-slate-500 hidden sm:inline font-mono text-[10px]">
          AWS · GCP · Azure · Hostinger · Hetzner · Contabo · DO · Linode · Supabase · Neon · Cloudflare
        </span>
      </div>
    </div>
  );
};
