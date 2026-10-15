import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingDown,
  Server,
  Database,
  HardDrive,
  Globe,
  Shield,
  HelpCircle,
  Lightbulb,
  ArrowRight
} from "lucide-react";
import { CostEstimate, Currency, ProviderItem } from "../../types";
import { calculateClientCosts } from "../../engine/costEngine";

interface CostCalculatorProps {
  providers: ProviderItem[];
  initialEstimate: CostEstimate;
  onUpdateGlobalEstimate: (estimate: CostEstimate) => void;
}

export const CostCalculator: React.FC<CostCalculatorProps> = ({
  providers,
  initialEstimate,
  onUpdateGlobalEstimate
}) => {
  const [providerId, setProviderId] = useState<string>(initialEstimate.provider.id || "aws");
  const [instances, setInstances] = useState<number>(2);
  const [dbType, setDbType] = useState<string>("postgres");
  const [dbHosting, setDbHosting] = useState<string>("managed");
  const [storageGB, setStorageGB] = useState<number>(100);
  const [dataTransferGB, setDataTransferGB] = useState<number>(1000);
  const [cdnRequired, setCdnRequired] = useState<boolean>(true);
  const [backupRequired, setBackupRequired] = useState<boolean>(true);
  const [natGatewayCount, setNatGatewayCount] = useState<number>(0);
  const [monitoringLevel, setMonitoringLevel] = useState<string>("standard");
  const [currency, setCurrency] = useState<Currency>("USD");

  const activeProvider = providers.find(p => p.id === providerId) || providers[0];

  // Recalculate deterministically using shared engine whenever inputs change
  const estimate = calculateClientCosts({
    providerId: activeProvider.id,
    providerName: activeProvider.name,
    category: activeProvider.category,
    instances,
    unitComputeUSD: activeProvider.startingPrice || 14.60,
    dbType,
    dbHosting,
    storageGB,
    dataTransferGB,
    cdnRequired,
    backupRequired,
    natGatewayCount,
    monitoringLevel,
    currency
  });

  useEffect(() => {
    onUpdateGlobalEstimate(estimate);
  }, [
    providerId,
    instances,
    dbType,
    dbHosting,
    storageGB,
    dataTransferGB,
    cdnRequired,
    backupRequired,
    natGatewayCount,
    monitoringLevel,
    currency
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Cloud Infrastructure Cost Calculator
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Deterministic multi-cloud sizing, usage-based egress modeling, scenario analysis, and currency conversion.
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium px-2">Currency:</span>
          {(["USD", "EUR", "GBP", "INR"] as Currency[]).map(curr => (
            <button
              key={curr}
              type="button"
              onClick={() => setCurrency(curr)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                currency === curr
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {curr}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Controls (1 col) + Right Outputs & Drivers (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Parameters Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6 bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Infrastructure Sizing Parameters
            </h2>
            <span className="text-xs text-indigo-400">Real-time Recalculation</span>
          </div>

          {/* Provider Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Cloud Provider
              </label>
              <select
                value={providerId}
                onChange={e => setProviderId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs"
              >
                {providers.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.tier})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Monitoring & Observability
              </label>
              <select
                value={monitoringLevel}
                onChange={e => setMonitoringLevel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs"
              >
                <option value="basic">Basic (Free metrics / Uptime ping)</option>
                <option value="standard">Standard ($10/mo Prometheus / Alarms)</option>
                <option value="advanced">Advanced ($25/mo APM / Tracing / Sentry)</option>
              </select>
            </div>
          </div>

          {/* Compute Instances */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Application Compute Instances</span>
              <span className="text-indigo-400 font-bold">{instances} node(s)</span>
            </div>
            <input
              type="range"
              min="1"
              max="16"
              value={instances}
              onChange={e => setInstances(Number(e.target.value))}
              className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>1 node (MVP)</span>
              <span>2 nodes (Standard HA)</span>
              <span>4 nodes</span>
              <span>8 nodes</span>
              <span>16 nodes</span>
            </div>
          </div>

          {/* Database Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Database Engine
              </label>
              <select
                value={dbType}
                onChange={e => setDbType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs"
              >
                <option value="postgres">PostgreSQL</option>
                <option value="mysql">MySQL</option>
                <option value="redis">Redis Cache</option>
                <option value="none">None (Stateless)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Database Hosting Model
              </label>
              <select
                value={dbHosting}
                onChange={e => setDbHosting(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs"
              >
                <option value="managed">Managed Database (RDS / DO Managed)</option>
                <option value="serverless">Serverless (Neon / Supabase)</option>
                <option value="self">Self-Hosted on VPS Container</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>

          {/* Storage Capacity Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Persistent Storage Capacity</span>
              <span className="text-indigo-400 font-bold">{storageGB} GB</span>
            </div>
            <input
              type="range"
              min="20"
              max="2000"
              step="20"
              value={storageGB}
              onChange={e => setStorageGB(Number(e.target.value))}
              className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Data Transfer Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Outbound Egress Data Transfer</span>
              <span className="text-indigo-400 font-bold">{dataTransferGB.toLocaleString()} GB / mo</span>
            </div>
            <input
              type="range"
              min="100"
              max="25000"
              step="250"
              value={dataTransferGB}
              onChange={e => setDataTransferGB(Number(e.target.value))}
              className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>100 GB</span>
              <span>1 TB</span>
              <span>5 TB</span>
              <span>10 TB</span>
              <span>25 TB</span>
            </div>
          </div>

          {/* Toggles */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={cdnRequired}
                onChange={e => setCdnRequired(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-0"
              />
              <span className="text-slate-300">Cloudflare Edge CDN</span>
            </label>

            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={backupRequired}
                onChange={e => setBackupRequired(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-0"
              />
              <span className="text-slate-300">Automated Daily Backups</span>
            </label>

            <div className="flex items-center space-x-2">
              <span className="text-slate-400">NAT Gateways:</span>
              <select
                value={natGatewayCount}
                onChange={e => setNatGatewayCount(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs"
              >
                <option value={0}>0 (Standard)</option>
                <option value={1}>1 (Single AZ)</option>
                <option value={2}>2 (Multi-AZ)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Output Summary & Scenarios (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Total Monthly Display */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/30 shadow-2xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Estimated Infrastructure Monthly Spend
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-extrabold text-white">
                {estimate.formatted.totalMonthly}
              </span>
              <span className="text-xs text-slate-400">/ month</span>
            </div>
            <p className="text-xs text-slate-300">
              Annual Projected Run Rate:{" "}
              <strong className="text-emerald-400 font-bold">{estimate.formatted.annualProjected}</strong>
            </p>

            {/* Fixed vs Usage Split */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Monthly Fixed Costs</span>
                <span className="font-bold text-slate-200">
                  {currency} {estimate.fixedMonthlyUSD.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Monthly Usage Costs</span>
                <span className="font-bold text-slate-200">
                  {currency} {estimate.usageMonthlyUSD.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Traffic Scenarios */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
            <h3 className="font-bold text-white uppercase text-[11px] tracking-wider">
              Traffic Sensitivity Scenarios
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Low (-25%)</span>
                <span className="font-bold text-slate-300 mt-1 block">
                  {estimate.formatted.lowScenario}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/40">
                <span className="text-[10px] text-indigo-300 block font-semibold">Expected</span>
                <span className="font-bold text-white mt-1 block">
                  {estimate.formatted.totalMonthly}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Peak (+50%)</span>
                <span className="font-bold text-slate-300 mt-1 block">
                  {estimate.formatted.highScenario}
                </span>
              </div>
            </div>
          </div>

          {/* Major Cost Drivers */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
            <h3 className="font-bold text-white uppercase text-[11px] tracking-wider">
              Major Cost Drivers
            </h3>
            <div className="space-y-2">
              {estimate.costDrivers.map(d => (
                <div key={d.name} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300">{d.name}</span>
                    <span className="font-bold text-slate-200">
                      {d.amountFormatted} ({d.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(5, d.percentage))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer & Assumptions */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center space-x-1.5 text-slate-300 font-semibold">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>Planning Assumptions & Verification Status</span>
            </div>
            <p>
              Calculated deterministically using published 2026 public on-demand baseline rates. Estimates exclude promotional discounts and support plan add-ons unless explicitly declared.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
