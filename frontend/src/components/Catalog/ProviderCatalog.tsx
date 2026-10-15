import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  SlidersHorizontal,
  Check,
  X,
  Layers,
  ArrowUpDown
} from "lucide-react";
import { ProviderItem } from "../../types";

interface ProviderCatalogProps {
  providers: ProviderItem[];
  onSelectProviderForCalculator?: (providerId: string) => void;
}

export const ProviderCatalog: React.FC<ProviderCatalogProps> = ({
  providers,
  onSelectProviderForCalculator
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number>(100);
  const [managedFilter, setManagedFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"price" | "name" | "tier">("price");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Selected providers for side-by-side comparison (up to 3)
  const [compareIds, setCompareIds] = useState<string[]>([]);
  // Detail Modal provider
  const [detailProvider, setDetailProvider] = useState<ProviderItem | null>(null);

  // Multi-faceted filtering
  const filteredProviders = useMemo(() => {
    return providers
      .filter(p => {
        // Category
        if (activeCategory !== "all" && p.category !== activeCategory) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const match =
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.tier.toLowerCase().includes(q) ||
            p.strengths.some(s => s.toLowerCase().includes(q));
          if (!match) return false;
        }

        // Region
        if (selectedRegion !== "all") {
          const matchRegion =
            p.regions.includes(selectedRegion) || p.regions.includes("global");
          if (!matchRegion) return false;
        }

        // Price ceiling
        if (p.startingPrice > maxPrice) return false;

        // Managed filter
        if (managedFilter === "managed" && !p.managed) return false;
        if (managedFilter === "self" && p.managed) return false;

        // Verification status
        if (statusFilter !== "all" && p.pricingStatus !== statusFilter) return false;

        return true;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === "price") {
          comp = a.startingPrice - b.startingPrice;
        } else if (sortBy === "name") {
          comp = a.name.localeCompare(b.name);
        } else if (sortBy === "tier") {
          comp = a.tier.localeCompare(b.tier);
        }
        return sortOrder === "desc" ? -comp : comp;
      });
  }, [
    providers,
    activeCategory,
    searchQuery,
    selectedRegion,
    maxPrice,
    managedFilter,
    statusFilter,
    sortBy,
    sortOrder
  ]);

  const toggleCompare = (id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  const comparedProviders = providers.filter(p => compareIds.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Provider Pricing & Intelligence Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Multi-cloud pricing parameters, official source links, bandwidth economics, and verified 2026 baselines.
          </p>
        </div>
        <div className="text-xs text-slate-400">
          Showing <span className="font-bold text-white">{filteredProviders.length}</span> of{" "}
          <span className="font-bold text-white">{providers.length}</span> cloud platforms
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto space-x-2 pb-2 border-b border-slate-800">
        {[
          { id: "all", label: "All Categories" },
          { id: "hyperscaler", label: "Hyperscalers (AWS / GCP / Azure)" },
          { id: "vps", label: "VPS / Bare Metal (Hetzner / DO / Linode)" },
          { id: "paas", label: "PaaS / Serverless (Vercel / Render / Fly)" },
          { id: "database", label: "Managed Databases (Neon / Supabase)" },
          { id: "storage", label: "Object Storage (Cloudflare R2)" }
        ].map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeCategory === cat.id
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-center text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search provider, strength, tier…"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
          />
        </div>

        {/* Region */}
        <div>
          <select
            value={selectedRegion}
            onChange={e => setSelectedRegion(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
          >
            <option value="all">All Deployment Regions</option>
            <option value="india">India & South Asia</option>
            <option value="europe">Europe</option>
            <option value="us">North America</option>
            <option value="global">Global Footprint</option>
          </select>
        </div>

        {/* Managed Status */}
        <div>
          <select
            value={managedFilter}
            onChange={e => setManagedFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
          >
            <option value="all">Managed & Self-Managed</option>
            <option value="managed">Fully Managed Only</option>
            <option value="self">Self-Managed (VPS / Docker)</option>
          </select>
        </div>

        {/* Price Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-300 font-medium">
            <span>Max Starting Price</span>
            <span className="text-emerald-400 font-bold">${maxPrice}/mo</span>
          </div>
          <input
            type="range"
            min="5"
            max="150"
            step="5"
            value={maxPrice}
            onChange={e => setMaxPrice(Number(e.target.value))}
            className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center space-x-2">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-white text-xs"
          >
            <option value="price">Sort by Price</option>
            <option value="name">Sort by Name</option>
            <option value="tier">Sort by Tier</option>
          </select>
          <button
            type="button"
            onClick={() => setSortOrder(prev => (prev === "asc" ? "desc" : "asc"))}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Toggle sort direction"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison Drawer (if any selected) */}
      {comparedProviders.length > 0 && (
        <div className="p-5 rounded-xl bg-slate-900 border-2 border-indigo-500/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">
                Side-by-Side Comparison ({comparedProviders.length} / 3)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setCompareIds([])}
              className="text-xs text-slate-400 hover:text-white"
            >
              Clear Comparison
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {comparedProviders.map(p => (
              <div key={p.id} className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{p.name}</h4>
                    <span className="text-[10px] text-indigo-400 font-semibold uppercase">{p.tier}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleCompare(p.id)}
                    className="text-slate-500 hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-400">Baseline Price: </span>
                    <strong className="text-emerald-400 font-bold">${p.startingPrice}/mo</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Egress Rate: </span>
                    <span className="text-slate-200">${p.egressRate}/GB</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Included Transfer: </span>
                    <span className="text-slate-200">
                      {p.egressIncludedGB >= 1000
                        ? `${Math.round(p.egressIncludedGB / 1000)} TB`
                        : `${p.egressIncludedGB} GB`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Operations: </span>
                    <span className="text-slate-200">{p.managed ? "Fully Managed" : "Self-Managed"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Compliance: </span>
                    <span className={p.compliance ? "text-emerald-400 font-semibold" : "text-slate-400"}>
                      {p.compliance ? "Audited / Certified" : "Uncertified"}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setDetailProvider(p)}
                    className="w-full py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    View Full Specs
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Provider Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProviders.map(provider => {
          const isComparing = compareIds.includes(provider.id);

          return (
            <div
              key={provider.id}
              className="rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 flex flex-col justify-between space-y-4 transition-all"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      {provider.category}
                    </span>
                    <h3 className="text-base font-bold text-white tracking-tight">{provider.name}</h3>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      provider.pricingStatus === "verified"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    }`}
                  >
                    {provider.pricingStatus === "verified" ? "VERIFIED" : "ESTIMATED"}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {provider.description}
                </p>

                {/* Pricing Box */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Starting Baseline</span>
                    <span className="text-lg font-extrabold text-white">
                      ${provider.startingPrice}
                      <small className="text-xs font-normal text-slate-400">/mo</small>
                    </span>
                  </div>
                  <div className="text-right text-[11px] text-slate-400">
                    <div>Egress: ${provider.egressRate}/GB</div>
                    <div>
                      Inc:{" "}
                      {provider.egressIncludedGB >= 1000
                        ? `${Math.round(provider.egressIncludedGB / 1000)} TB`
                        : `${provider.egressIncludedGB} GB`}
                    </div>
                  </div>
                </div>

                {/* Strengths bullet points */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Key Strengths
                  </span>
                  <ul className="space-y-0.5">
                    {provider.strengths.slice(0, 2).map((st, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start space-x-1.5">
                        <span className="text-emerald-500 mt-0.5">✓</span>
                        <span className="line-clamp-1">{st}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => toggleCompare(provider.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    isComparing
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800"
                  }`}
                >
                  {isComparing ? "Comparing" : "+ Compare"}
                </button>

                <button
                  type="button"
                  onClick={() => setDetailProvider(provider)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-semibold transition-colors"
                >
                  Details & Links →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Provider Details Modal */}
      {detailProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs uppercase font-bold text-indigo-400">
                  {detailProvider.category} · {detailProvider.tier}
                </span>
                <h3 className="text-lg font-bold text-white">{detailProvider.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailProvider(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {detailProvider.description}
            </p>

            {/* Pros & Cons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                <span className="font-bold text-emerald-400 uppercase text-[10px] tracking-wider block">
                  Advantages & Strengths
                </span>
                <ul className="space-y-1">
                  {detailProvider.strengths.map((s, i) => (
                    <li key={i} className="text-slate-300 flex items-start space-x-1.5">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                <span className="font-bold text-amber-400 uppercase text-[10px] tracking-wider block">
                  Considerations & Operational Risks
                </span>
                <ul className="space-y-1">
                  {detailProvider.risks.map((r, i) => (
                    <li key={i} className="text-slate-300 flex items-start space-x-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Compute Options & DB Plans */}
            {detailProvider.computeOptions && detailProvider.computeOptions.length > 0 && (
              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-300">Baseline Compute Options</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {detailProvider.computeOptions.map(co => (
                    <div key={co.name} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="font-semibold text-white">{co.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {co.vcpu} · {co.ram}
                      </div>
                      <div className="text-xs font-bold text-emerald-400 mt-1">
                        ${co.monthlyUSD}/mo
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verification Metadata & Official URL */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-slate-400">Pricing Verification Status: </span>
                  <span className="text-emerald-400 font-bold uppercase">
                    {detailProvider.pricingStatus} ({detailProvider.lastVerifiedDate})
                  </span>
                </div>
                <a
                  href={detailProvider.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center space-x-1"
                >
                  <span>Official Provider Pricing Documentation</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-[11px] text-slate-400">
                <strong className="text-slate-300">Pricing Assumptions: </strong>
                {detailProvider.assumptions}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailProvider(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
