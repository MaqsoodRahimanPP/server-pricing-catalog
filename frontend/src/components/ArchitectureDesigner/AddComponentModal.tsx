import React, { useState } from "react";
import {
  X,
  Plus,
  Globe,
  ShieldCheck,
  Scale,
  Server,
  Database,
  Layers,
  Zap,
  HardDrive,
  Network
} from "lucide-react";
import { ArchitectureNode } from "../../types";

interface AddComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddComponent: (node: ArchitectureNode) => void;
  existingNodeIds: string[];
}

export const AddComponentModal: React.FC<AddComponentModalProps> = ({
  isOpen,
  onClose,
  onAddComponent,
  existingNodeIds
}) => {
  if (!isOpen) return null;

  const availableCatalog = [
    {
      type: "worker",
      category: "compute" as const,
      title: "Background Worker Service",
      subtitle: "Asynchronous Queue & Cron Jobs",
      zone: "app-subnet" as const,
      icon: "Server",
      provider: "Cloud App Compute",
      defaultPos: { x: 810, y: 390 }
    },
    {
      type: "cache",
      category: "cache" as const,
      title: "Redis In-Memory Cache",
      subtitle: "Session Store & Realtime Queues",
      zone: "data-subnet" as const,
      icon: "Zap",
      provider: "Managed Redis",
      defaultPos: { x: 1000, y: 280 }
    },
    {
      type: "pooler",
      category: "database" as const,
      title: "PgBouncer Connection Pool",
      subtitle: "Transaction Pooling Layer",
      zone: "data-subnet" as const,
      icon: "Layers",
      provider: "Open Source Proxy",
      defaultPos: { x: 1000, y: 160 }
    },
    {
      type: "nat",
      category: "networking" as const,
      title: "VPC NAT Gateway",
      subtitle: "Outbound Private Subnet Egress",
      zone: "app-subnet" as const,
      icon: "Network",
      provider: "Cloud VPC Network",
      defaultPos: { x: 610, y: 280 }
    },
    {
      type: "storage",
      category: "storage" as const,
      title: "Cloudflare R2 Object Storage",
      subtitle: "S3-Compatible Zero-Egress Storage",
      zone: "app-subnet" as const,
      icon: "HardDrive",
      provider: "Cloudflare R2",
      defaultPos: { x: 810, y: 280 }
    },
    {
      type: "waf",
      category: "security" as const,
      title: "AWS WAF / Web Application Firewall",
      subtitle: "OWASP Top 10 Ingress Filtering",
      zone: "public" as const,
      icon: "ShieldCheck",
      provider: "AWS / Cloud Edge",
      defaultPos: { x: 420, y: 160 }
    }
  ];

  const handleAdd = (item: (typeof availableCatalog)[0]) => {
    const id = `node-${item.type}-${Date.now().toString().slice(-4)}`;
    const newNode: ArchitectureNode = {
      id,
      type: "default",
      category: item.category,
      position: item.defaultPos,
      data: {
        title: item.title,
        subtitle: item.subtitle,
        zone: item.zone,
        status: "active",
        provider: item.provider,
        icon: item.icon
      }
    };

    onAddComponent(newNode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Add Architecture Component</h3>
            <p className="text-xs text-slate-400">
              Select a supported infrastructure primitive to insert into the topology.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
          {availableCatalog.map(item => (
            <div
              key={item.title}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-indigo-500/60 flex flex-col justify-between space-y-3 transition-colors group"
            >
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {item.zone === "public" ? "Public Edge" : item.zone === "app-subnet" ? "VPC App" : "Private DB"}
                </span>
                <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors pt-1">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-400">{item.subtitle}</p>
              </div>

              <button
                type="button"
                onClick={() => handleAdd(item)}
                className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center space-x-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Node</span>
              </button>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
