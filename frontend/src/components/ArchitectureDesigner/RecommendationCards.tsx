import React, { useState } from "react";
import {
  Check,
  Star,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Bot,
  Zap,
  HardDrive,
  Calendar,
  Globe2,
  ShieldCheck
} from "lucide-react";
import { RecommendationTier, TierId, Currency } from "../../types";

interface RecommendationCardsProps {
  tiers: RecommendationTier[];
  selectedTierId: string;
  onSelectTier: (tierId: TierId) => void;
  bestFitReason?: string;
  currency?: Currency;
  onCurrencyChange?: (c: Currency) => void;
}

export const RecommendationCards: React.FC<RecommendationCardsProps> = ({
  tiers,
  selectedTierId,
  onSelectTier,
  bestFitReason,
  currency: controlledCurrency,
  onCurrencyChange
}) => {
  const [internalCurrency, setInternalCurrency] = useState<Currency>("USD");
  const [tcoHorizon, setTcoHorizon] = useState<"1year" | "3year">("1year");

  const currency = controlledCurrency || internalCurrency;
  const setCurrency = (c: Currency) => {
    if (onCurrencyChange) onCurrencyChange(c);
    else setInternalCurrency(c);
  };

  const isINR = currency === "INR";
  const currSym = isINR ? "₹" : "$";

  return (
    <div className="space-y-4">
      {/* Top Banner: Algorithm Rationale + TCO & Currency Toggles */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
        {/* Left: Best Fit Rationale */}
        <div className="flex items-start space-x-2.5 text-xs text-indigo-200 flex-1">
          <Sparkles className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-bold text-white">Algorithm Recommendation: </span>
            <span className="text-slate-300">
              {bestFitReason || "Comparing Contabo Ultra-Budget, Hostinger Smart NVMe, DigitalOcean, and AWS Enterprise tiers."}
            </span>
          </div>
        </div>

        {/* Right: TCO Horizon & Currency Switchers */}
        <div className="flex items-center space-x-3 self-end lg:self-auto">
          {/* TCO Horizon Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-semibold">
            <span className="text-slate-400 px-2 hidden sm:inline">TCO Horizon:</span>
            <button
              type="button"
              onClick={() => setTcoHorizon("1year")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                tcoHorizon === "1year"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              1-Year Promo
            </button>
            <button
              type="button"
              onClick={() => setTcoHorizon("3year")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                tcoHorizon === "3year"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              3-Year Renewal TCO
            </button>
          </div>

          {/* Currency Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setCurrency("USD")}
              className={`px-2 py-1 rounded-md transition-all ${
                currency === "USD"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              USD ($)
            </button>
            <button
              type="button"
              onClick={() => setCurrency("INR")}
              className={`px-2 py-1 rounded-md transition-all ${
                currency === "INR"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              INR (₹)
            </button>
          </div>
        </div>
      </div>

      {/* 4 Tier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map(tier => {
          const isSelected = selectedTierId === tier.tierId;
          const isBestFit = tier.isBestFit;
          const isHostinger = tier.tierId === "hostinger";

          // Pricing calculation based on Currency and TCO Horizon
          const monthlyDisplay = isINR
            ? (tcoHorizon === "3year" && tier.renewalMonthlyINR
                ? tier.renewalMonthlyINR
                : tier.monthlyEstimateINR || Math.round(tier.monthlyEstimateUSD * 86.5))
            : (tcoHorizon === "3year" && tier.renewalMonthlyUSD
                ? tier.renewalMonthlyUSD
                : tier.monthlyEstimateUSD);

          const tcoTotalDisplay = isINR
            ? (tcoHorizon === "3year" ? tier.tco3YearINR : tier.tco1YearINR)
            : (tcoHorizon === "3year" ? tier.tco3YearUSD : tier.tco1YearUSD);

          return (
            <div
              key={tier.tierId}
              onClick={() => onSelectTier(tier.tierId)}
              className={`relative rounded-2xl flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                isSelected
                  ? isHostinger
                    ? "bg-slate-900 border-2 border-violet-500 shadow-2xl shadow-violet-500/20 ring-2 ring-violet-500/40"
                    : "bg-slate-900 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/20 ring-2 ring-indigo-500/40"
                  : isHostinger
                  ? "bg-slate-900/80 border border-violet-500/40 hover:border-violet-400 hover:shadow-lg"
                  : "bg-slate-900/70 border border-slate-800 hover:border-slate-700"
              }`}
            >
              {/* Top Section */}
              <div className="p-4 sm:p-5 pb-3">
                <div className="flex items-center justify-between gap-1.5 mb-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      isHostinger
                        ? "bg-violet-500/20 text-violet-300 border-violet-500/40"
                        : "text-slate-400 border-slate-700 bg-slate-800"
                    }`}
                  >
                    {tier.tierName}
                  </span>

                  {isBestFit && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold animate-pulse">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <span>BEST FIT</span>
                    </span>
                  )}
                </div>

                <h4 className="text-base font-bold text-white tracking-tight flex items-center justify-between">
                  <span>{tier.providerName}</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {tier.headline}
                </p>

                {/* Price Display Box */}
                <div
                  className={`mt-4 p-3 rounded-xl border ${
                    isHostinger
                      ? "bg-violet-950/40 border-violet-500/30"
                      : "bg-slate-950 border-slate-800"
                  }`}
                >
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-extrabold text-white">
                      {currSym}{monthlyDisplay.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </div>

                  {/* TCO summary subtext */}
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                    <span>
                      {tcoHorizon === "1year" ? "1-Yr Intro Total:" : "3-Yr Renewal TCO:"}{" "}
                      <strong className="text-white">
                        {currSym}{tcoTotalDisplay ? tcoTotalDisplay.toLocaleString() : (monthlyDisplay * 12).toLocaleString()}
                      </strong>
                    </span>
                    {isHostinger && (
                      <span className="text-emerald-400 font-semibold">Save ~68%</span>
                    )}
                  </div>
                </div>

                {/* Hostinger Special Badges */}
                {isHostinger && tier.hostingerFeatures && (
                  <div className="mt-3 grid grid-cols-2 gap-1.5 text-[10px]">
                    <div className="p-1.5 rounded-lg bg-violet-900/30 border border-violet-500/20 text-violet-200 flex items-center space-x-1">
                      <Bot className="w-3 h-3 text-violet-400 flex-shrink-0" />
                      <span className="truncate">Kodee AI Assistant</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-indigo-900/30 border border-indigo-500/20 text-indigo-200 flex items-center space-x-1">
                      <Zap className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                      <span className="truncate">Coolify 1-Click</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center space-x-1">
                      <HardDrive className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      <span className="truncate">Gen4 NVMe IOPS</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center space-x-1">
                      <Globe2 className="w-3 h-3 text-blue-400 flex-shrink-0" />
                      <span className="truncate">Mumbai / SG / EU</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Middle Section: Architecture Primitives & Tradeoffs */}
              <div className="px-4 sm:px-5 py-3 space-y-3 text-xs border-t border-slate-800/80">
                {/* Included Components */}
                <div>
                  <span className="text-[11px] font-semibold text-emerald-400 block mb-1.5 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Included Architecture</span>
                  </span>
                  <ul className="space-y-1">
                    {tier.includedComponents.slice(0, 3).map((item, i) => (
                      <li key={i} className="text-[11px] text-slate-300 flex items-start space-x-1.5">
                        <span className="text-emerald-500 mt-0.5">•</span>
                        <span className="line-clamp-1">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tradeoffs */}
                <div className="pt-2 border-t border-slate-800/60">
                  <span className="text-[10px] text-slate-400 block font-semibold">Availability SLA:</span>
                  <span className="text-[11px] text-slate-300 line-clamp-1">{tier.tradeoffs.availability}</span>
                </div>
              </div>

              {/* Bottom Action Button */}
              <div className="p-4 sm:p-5 pt-2">
                <button
                  type="button"
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                    isSelected
                      ? isHostinger
                        ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30"
                        : "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSelected ? "Active Blueprint" : "Select Architecture"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
