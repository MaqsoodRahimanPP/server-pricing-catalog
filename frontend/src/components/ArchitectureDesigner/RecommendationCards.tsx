import React from "react";
import { Check, Star, CheckCircle2, XCircle, AlertCircle, Sparkles } from "lucide-react";
import { RecommendationTier } from "../../types";

interface RecommendationCardsProps {
  tiers: RecommendationTier[];
  selectedTierId: string;
  onSelectTier: (tierId: "budget" | "balanced" | "enterprise") => void;
  bestFitReason?: string;
}

export const RecommendationCards: React.FC<RecommendationCardsProps> = ({
  tiers,
  selectedTierId,
  onSelectTier,
  bestFitReason
}) => {
  return (
    <div className="space-y-4">
      {/* Best Fit Banner */}
      {bestFitReason && (
        <div className="p-3.5 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-start space-x-3 text-xs text-indigo-200">
          <Sparkles className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-semibold text-white">Algorithm Recommendation Rationale: </span>
            <span>{bestFitReason}</span>
          </div>
        </div>
      )}

      {/* 3 Tier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map(tier => {
          const isSelected = selectedTierId === tier.tierId;
          const isBestFit = tier.isBestFit;

          return (
            <div
              key={tier.tierId}
              className={`relative rounded-xl flex flex-col justify-between transition-all duration-200 ${
                isSelected
                  ? "bg-slate-900 border-2 border-indigo-500 shadow-xl shadow-indigo-500/10"
                  : "bg-slate-900/70 border border-slate-800 hover:border-slate-700"
              }`}
            >
              {/* Top Badges */}
              <div className="p-5 pb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {tier.tierName}
                  </span>
                  {isBestFit && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      <Star className="w-3 h-3 fill-current" />
                      <span>BEST FIT</span>
                    </span>
                  )}
                </div>

                <h4 className="text-base font-bold text-white tracking-tight">{tier.providerName}</h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{tier.headline}</p>

                {/* Price Box */}
                <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-extrabold text-white">
                      ${tier.monthlyEstimateUSD}
                    </span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{tier.pricingConfidence}</p>
                </div>
              </div>

              {/* Middle Section: Details, Satisfied, Tradeoffs */}
              <div className="px-5 py-3 space-y-3.5 text-xs border-t border-slate-800/80">
                {/* Why Selected */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Why It Was Selected
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{tier.whySelected}</p>
                </div>

                {/* Included Components */}
                <div>
                  <span className="text-[11px] font-semibold text-emerald-400 block mb-1.5 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Included Architecture Primitives</span>
                  </span>
                  <ul className="space-y-1">
                    {tier.includedComponents.map((item, i) => (
                      <li key={i} className="text-[11px] text-slate-300 flex items-start space-x-1.5">
                        <span className="text-emerald-500 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Excluded Components */}
                {tier.excludedComponents.length > 0 && (
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center space-x-1">
                      <XCircle className="w-3 h-3 text-slate-500" />
                      <span>Components Not Included</span>
                    </span>
                    <ul className="space-y-0.5">
                      {tier.excludedComponents.map((item, i) => (
                        <li key={i} className="text-[11px] text-slate-400">
                          - {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Complexity & Risks */}
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 space-y-1.5">
                  <div className="text-[10px] text-slate-400">
                    <strong className="text-slate-300">Operational Complexity: </strong>
                    {tier.operationalComplexity}
                  </div>
                  {tier.risks.length > 0 && (
                    <div className="text-[10px] text-amber-400/90 flex items-start space-x-1">
                      <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{tier.risks[0]}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom CTA Button */}
              <div className="p-5 pt-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => onSelectTier(tier.tierId)}
                  disabled={!tier.eligible}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : tier.eligible
                      ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                      : "bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed"
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Active Selection</span>
                    </>
                  ) : tier.eligible ? (
                    <span>Select & Render Topology</span>
                  ) : (
                    <span>Disqualified by Constraints</span>
                  )}
                </button>
                {!tier.eligible && (
                  <p className="text-[10px] text-red-400 mt-1.5 text-center">
                    {tier.eligibilityReason}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
