import React from "react";
import { X, Trash2, Shield, Server, CheckCircle2 } from "lucide-react";
import { ArchitectureNode } from "../../types";

interface ComponentInspectorProps {
  node: ArchitectureNode;
  onClose: () => void;
  onUpdateNode: (nodeId: string, updatedData: any) => void;
  onRemoveNode: (nodeId: string) => void;
}

export const ComponentInspector: React.FC<ComponentInspectorProps> = ({
  node,
  onClose,
  onUpdateNode,
  onRemoveNode
}) => {
  const { data } = node;

  return (
    <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
      <div className="flex items-start justify-between pb-3 border-b border-slate-800">
        <div>
          <span className="text-[10px] uppercase font-bold text-indigo-400">Component Inspector</span>
          <h4 className="text-sm font-bold text-white">{data.title}</h4>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Security Zone</span>
          <span className="font-semibold text-slate-200 capitalize">
            {data.zone === "public" ? "Public Edge" : data.zone === "app-subnet" ? "VPC App Subnet" : "Private Data Subnet"}
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Infrastructure Provider</span>
          <span className="font-semibold text-slate-200">{data.provider}</span>
        </div>
      </div>

      {/* Editable Properties */}
      <div className="space-y-3 text-xs">
        <div>
          <label className="block text-slate-400 text-[11px] mb-1">Component Title / Role</label>
          <input
            type="text"
            value={data.title}
            onChange={e => onUpdateNode(node.id, { ...data, title: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
          />
        </div>

        <div>
          <label className="block text-slate-400 text-[11px] mb-1">Specification Subtitle</label>
          <input
            type="text"
            value={data.subtitle}
            onChange={e => onUpdateNode(node.id, { ...data, subtitle: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
          />
        </div>

        {/* Compute Instance Count if applicable */}
        {data.instances !== undefined && (
          <div>
            <label className="block text-slate-400 text-[11px] mb-1">
              Active Instances ({data.instances} nodes)
            </label>
            <input
              type="range"
              min="1"
              max="8"
              value={data.instances}
              onChange={e =>
                onUpdateNode(node.id, {
                  ...data,
                  instances: Number(e.target.value),
                  subtitle: `${e.target.value} node(s) · High Availability Cluster`
                })
              }
              className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        )}

        {/* HA Standby Toggle if database or compute */}
        {node.category === "database" && (
          <label className="flex items-center space-x-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(data.isHA)}
              onChange={e =>
                onUpdateNode(node.id, {
                  ...data,
                  isHA: e.target.checked,
                  subtitle: e.target.checked
                    ? "Multi-AZ Synchronous Standby Failover"
                    : "Single Node Instance with Backups"
                })
              }
              className="rounded border-slate-700 text-indigo-600 focus:ring-0"
            />
            <span className="text-slate-300 text-xs">Enable Multi-AZ Synchronous Failover</span>
          </label>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onRemoveNode(node.id)}
          className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Remove Component</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
        >
          Done
        </button>
      </div>
    </div>
  );
};
