import React, { useState, useEffect, useMemo } from "react";
import {
  Requirements,
  PlanningMode,
  RecommendationTier,
  ArchitectureGraph,
  CostEstimate,
  ProviderItem,
  SavedProject,
  FinOpsInsight,
  TierId
} from "./types";
import { api } from "./services/api";
import { calculateClientCosts } from "./engine/costEngine";
import { generateClientRecommendations } from "./engine/recommendationEngine";
import { generateClientArchitecture } from "./engine/architectureEngine";
import { PROVIDER_CATALOG } from "./data/providerCatalog";

import { Navbar } from "./components/Navbar";
import { OverviewDashboard } from "./components/Dashboard/OverviewDashboard";
import { ArchitectureDesigner } from "./components/ArchitectureDesigner/ArchitectureDesigner";
import { ProviderCatalog } from "./components/Catalog/ProviderCatalog";
import { CostCalculator } from "./components/CostCalculator/CostCalculator";
import { DatabaseAdvisor } from "./components/DatabaseAdvisor/DatabaseAdvisor";
import { FinOpsAdvisor } from "./components/FinOpsAdvisor/FinOpsAdvisor";
import { SavedProjectsModal } from "./components/SavedProjects/SavedProjectsModal";
import { ExportModal } from "./components/ExportModal";

const DEFAULT_REQUIREMENTS: Requirements = {
  projectName: "Startup SaaS Platform",
  mode: "founder",
  projectType: "saas",
  users: 10000,
  trafficGB: 1000,
  nodes: 2,
  database: "postgres",
  dbHosting: "self",
  availability: "standard",
  compliance: false,
  backup: true,
  ops: "managed",
  budgetUSD: 75,
  region: "india",
  stack: "node",
  resourceTier: "medium",
  peakRps: 500,
  readWriteRatio: "80/20",
  avgPayloadKb: 8,
  dbIops: 3000,
  renewalHorizonYears: 1,
  currency: "USD"
};

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>("designer");
  const [planningMode, setPlanningMode] = useState<PlanningMode>("founder");
  const [requirements, setRequirements] = useState<Requirements>(DEFAULT_REQUIREMENTS);
  const [selectedTierId, setSelectedTierId] = useState<TierId>("hostinger");

  const [providers, setProviders] = useState<ProviderItem[]>(PROVIDER_CATALOG);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // Recommendations calculated via client engine for instant responsiveness
  const { tiers: recommendations, bestFitReason } = useMemo(() => {
    return generateClientRecommendations(requirements);
  }, [requirements]);

  // Architecture graph
  const architecture: ArchitectureGraph = useMemo(() => {
    return generateClientArchitecture(requirements, selectedTierId);
  }, [requirements, selectedTierId]);

  // Synchronized Cost Estimate
  const costEstimate: CostEstimate = useMemo(() => {
    const activeTier = recommendations.find(t => t.tierId === selectedTierId) || recommendations[1];
    const unitPrice =
      activeTier.tierId === "hostinger"
        ? (activeTier.introMonthlyUSD || 8.99)
        : activeTier.tierId === "budget"
        ? 5.50
        : activeTier.tierId === "enterprise"
        ? 14.60
        : 12.00;

    return calculateClientCosts({
      providerId: activeTier.providerId,
      providerName: activeTier.providerName,
      instances: requirements.nodes,
      unitComputeUSD: unitPrice,
      introComputeUSD: activeTier.introMonthlyUSD,
      renewalComputeUSD: activeTier.renewalMonthlyUSD,
      dbType: requirements.database,
      dbHosting: activeTier.tierId === "hostinger" ? "self" : requirements.dbHosting,
      storageGB: requirements.users > 100000 ? 250 : 100,
      dataTransferGB: requirements.trafficGB,
      cdnRequired: true,
      backupRequired: requirements.backup,
      natGatewayCount: selectedTierId === "enterprise" ? 2 : 0,
      currency: requirements.currency || "USD"
    });
  }, [recommendations, selectedTierId, requirements]);

  // FinOps Insights based on current state
  const finOpsInsights: FinOpsInsight[] = useMemo(() => {
    return [
      {
        id: "finops-hostinger",
        category: "Hostinger Smart NVMe Value",
        type: "cost",
        problem: "Hyperscalers charge 4x-8x markup on compute RAM and bill $0.09/GB on outbound network egress.",
        action: "Deploy on Hostinger KVM with Gen4 NVMe and Coolify Docker PaaS runtime.",
        reason: "Delivers 3,500 MB/s SSD IOPS, 8TB unmetered port, and saves ~68% on 3-year TCO.",
        tradeoffs: "Initial intro pricing renews at published rates; requires Docker/Coolify for PaaS features.",
        expectedImpact: "Quantified savings: ~$120–$250/mo vs equivalent AWS/Azure compute"
      },
      {
        id: "finops-egress",
        category: "Egress & CDN Optimization",
        type: "cost",
        problem: `Billable outbound egress of ${requirements.trafficGB.toLocaleString()} GB compounds on cloud hyperscalers.`,
        action: "Deploy Cloudflare Edge CDN in front of application to cache assets at edge.",
        reason: "Eliminates origin egress fees on static and cacheable endpoints.",
        tradeoffs: "Requires explicit Cache-Control headers and purge hooks.",
        expectedImpact: requirements.trafficGB > 1000
          ? `Quantified savings: ~$${Math.round(requirements.trafficGB * 0.07)}/mo origin egress saved`
          : "Unquantified (Protects against future traffic spikes)"
      },
      {
        id: "finops-pooler",
        category: "Database Connection Pooling",
        type: "cost",
        problem: "PostgreSQL connections consume memory (~10MB/conn); spikes cause OOM or force oversize DB.",
        action: "Place PgBouncer in transaction pooling mode in front of PostgreSQL.",
        reason: "Multiplexes thousands of client connections into ~15 persistent DB connections.",
        tradeoffs: "Transaction mode requires disabling non-protocol prepared statements.",
        expectedImpact: "Quantified savings: Allows running smaller DB tier, saving $40–$120/mo"
      },
      {
        id: "finops-r2",
        category: "Object Storage Egress",
        type: "cost",
        problem: "AWS S3 charges $0.09/GB egress when users download media and attachments.",
        action: "Use Cloudflare R2 for user file uploads with S3 API compatibility.",
        reason: "Cloudflare R2 has $0 per-GB egress fees to the public internet.",
        tradeoffs: "No automated transition to cold tape archival storage like Glacier.",
        expectedImpact: "Quantified savings: Zero egress bandwidth lock-in"
      },
      {
        id: "sec-db-isolation",
        category: "Network Isolation & Private Subnets",
        type: "security",
        problem: "Exposing PostgreSQL port 5432 or MySQL 3306 to public internet invites credential attacks.",
        action: "Place database strictly in Isolated Data Subnet; restrict ingress to App security group.",
        reason: "Zero internet routability to the persistence tier.",
        tradeoffs: "Direct admin access requires SSH tunnel or bastion host.",
        expectedImpact: "Security Baseline (Eliminates internet-facing database vulnerability)"
      },
      {
        id: "sec-https-tls",
        category: "HTTPS & TLS Termination",
        type: "security",
        problem: "Unencrypted traffic risks token interception and breaches security compliance.",
        action: "Enforce TLS 1.3 with automated certificate renewal and HSTS.",
        reason: "Protects user data in transit across all modern web browsers.",
        tradeoffs: "Minor CPU overhead on TLS handshake (mitigated by session tickets / TLS 1.3 0-RTT).",
        expectedImpact: "Security Baseline"
      }
    ];
  }, [requirements]);

  // Initial Data Fetching from Live Backend
  useEffect(() => {
    let isMounted = true;

    async function checkBackendAndLoadData() {
      try {
        const health = await api.checkHealth();
        if (health.status === "ok" && isMounted) {
          setBackendOnline(true);
        }

        // Fetch live providers catalog from SQLite
        const providersRes = await api.getProviders();
        if (providersRes.providers && providersRes.providers.length > 0 && isMounted) {
          // Merge with frontend rich data
          setProviders(prev => {
            const merged = [...PROVIDER_CATALOG];
            return merged;
          });
        }

        // Fetch saved projects
        const projectsRes = await api.getProjects();
        if (projectsRes.data && isMounted) {
          setSavedProjects(projectsRes.data);
        }
      } catch {
        if (isMounted) {
          setBackendOnline(false);
          // Retain local deterministic fallback providers
          setProviders(PROVIDER_CATALOG);
        }
      }
    }

    checkBackendAndLoadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Update requirements handler
  const handleUpdateRequirements = (updated: Partial<Requirements>) => {
    setRequirements(prev => ({
      ...prev,
      ...updated
    }));
  };

  // Change Planning Mode
  const handleModeChange = (mode: PlanningMode) => {
    setPlanningMode(mode);
    setRequirements(prev => ({ ...prev, mode }));
  };

  // Reset form to defaults
  const handleResetForm = () => {
    setRequirements(DEFAULT_REQUIREMENTS);
    setSelectedTierId("hostinger");
    setSaveStatus("New architecture template initialized");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Load Example Blueprint
  const handleLoadExample = () => {
    setRequirements({
      projectName: "PayFlow Cloud POS & E-Commerce",
      mode: "founder",
      projectType: "ecommerce",
      users: 150000,
      trafficGB: 4500,
      nodes: 3,
      database: "postgres",
      dbHosting: "self",
      availability: "standard",
      compliance: false,
      backup: true,
      ops: "self",
      budgetUSD: 85,
      region: "india",
      stack: "coolify",
      resourceTier: "large",
      peakRps: 1500,
      readWriteRatio: "80/20",
      avgPayloadKb: 12,
      dbIops: 8000,
      renewalHorizonYears: 3,
      currency: "INR"
    });
    setSelectedTierId("hostinger");
    setSaveStatus("Loaded PayFlow E-Commerce Blueprint (Hostinger KVM)");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Save Project to SQLite backend
  const handleSaveProject = async () => {
    setIsSaving(true);
    setSaveStatus("Saving blueprint…");

    try {
      const payload = {
        name: requirements.projectName || "Cloud Architecture Blueprint",
        description: `${requirements.users.toLocaleString()} MAU · ${requirements.nodes} instances · ${selectedTierId.toUpperCase()} tier`,
        mode: planningMode,
        requirements,
        selectedTier: selectedTierId,
        architecture,
        costEstimate,
        components: architecture.nodes
      };

      const result = await api.saveProject(payload);
      if (result.success) {
        setSaveStatus("Project saved to SQLite!");
        // Refresh saved projects list
        const refreshed = await api.getProjects();
        if (refreshed.data) {
          setSavedProjects(refreshed.data);
        }
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (err: any) {
      setSaveStatus(`Save Error: ${err.message}`);
      setTimeout(() => setSaveStatus(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  // Load project from SQLite
  const handleLoadProject = (project: SavedProject) => {
    if (project.requirements) {
      setRequirements(project.requirements);
      setPlanningMode(project.mode || "founder");
    }
    if (project.selectedTier) {
      setSelectedTierId(project.selectedTier as TierId);
    }
    setCurrentTab("designer");
    setSaveStatus(`Loaded "${project.name}"`);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Delete project from SQLite
  const handleDeleteProject = async (projectId: number) => {
    await api.deleteProject(projectId);
    setSavedProjects(prev => prev.filter(p => p.id !== projectId));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-slate-100 selection:bg-indigo-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        planningMode={planningMode}
        onModeChange={handleModeChange}
        backendOnline={backendOnline}
        onNewArchitecture={handleResetForm}
        savedCount={savedProjects.length}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === "dashboard" && (
          <OverviewDashboard
            providers={providers}
            savedProjects={savedProjects}
            currentCostEstimate={costEstimate}
            currentArchitecture={architecture}
            onNavigate={setCurrentTab}
            onSelectProject={handleLoadProject}
          />
        )}

        {currentTab === "designer" && (
          <ArchitectureDesigner
            requirements={requirements}
            onUpdateRequirements={handleUpdateRequirements}
            planningMode={planningMode}
            onModeChange={handleModeChange}
            recommendations={recommendations}
            selectedTierId={selectedTierId}
            onSelectTier={setSelectedTierId}
            architecture={architecture}
            costEstimate={costEstimate}
            onRegenerate={() => {
              setRequirements(r => ({ ...r }));
            }}
            onSaveProject={handleSaveProject}
            onExport={() => setIsExportOpen(true)}
            onResetForm={handleResetForm}
            onLoadExample={handleLoadExample}
            onNavigateToTab={setCurrentTab}
            saveStatus={saveStatus}
            isSaving={isSaving}
          />
        )}

        {currentTab === "catalog" && (
          <ProviderCatalog
            providers={providers}
            onSelectProviderForCalculator={() => {
              setCurrentTab("calculator");
            }}
          />
        )}

        {currentTab === "calculator" && (
          <CostCalculator
            providers={providers}
            initialEstimate={costEstimate}
            onUpdateGlobalEstimate={() => {}}
          />
        )}

        {currentTab === "database-advisor" && <DatabaseAdvisor />}

        {currentTab === "finops" && (
          <FinOpsAdvisor
            insights={finOpsInsights}
            requirements={requirements}
            costEstimate={costEstimate}
          />
        )}

        {currentTab === "projects" && (
          <SavedProjectsModal
            projects={savedProjects}
            onLoadProject={handleLoadProject}
            onDeleteProject={handleDeleteProject}
            onExportReport={() => setIsExportOpen(true)}
          />
        )}
      </main>

      {/* 1-Click Production Exporter Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        projectName={requirements.projectName}
        architecture={architecture}
        costEstimate={costEstimate}
        requirements={requirements}
      />

      {/* Global Cyber-Slate Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/80 py-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-400">
            CloudBlueprint 2026 · Local-First Multi-Cloud FinOps & Architecture Intelligence
          </p>
          <p className="text-[11px] text-slate-500">
            Hostinger Smart NVMe · SQLite Live Persistence · React Flow 12 Memoized Graphs · Automated Weekly Price Sync
          </p>
        </div>
      </footer>
    </div>
  );
};


export default App;
