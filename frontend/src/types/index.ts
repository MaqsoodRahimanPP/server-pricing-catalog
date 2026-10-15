export type PlanningMode = "founder" | "devops";

export type ProjectType =
  | "saas"
  | "ecommerce"
  | "food"
  | "pos"
  | "media"
  | "api"
  | "portfolio";

export type Region = "india" | "europe" | "us" | "global";

export type AvailabilityTarget = "standard" | "ha";

export type OpsPreference = "managed" | "self" | "serverless";

export type DatabaseType = "postgres" | "mysql" | "mongo" | "redis" | "none";

export type DatabaseHosting = "managed" | "self" | "serverless" | "none";

export type Currency = "USD" | "EUR" | "GBP" | "INR";

export interface Requirements {
  projectName: string;
  mode: PlanningMode;
  projectType: ProjectType;
  users: number;
  trafficGB: number;
  nodes: number;
  database: DatabaseType;
  dbHosting: DatabaseHosting;
  availability: AvailabilityTarget;
  compliance: boolean;
  backup: boolean;
  ops: OpsPreference;
  budgetUSD: number;
  region: Region;
  stack: string;
  resourceTier: "small" | "medium" | "large" | "xlarge";
  // DevOps Mode granular controls
  peakRps?: number;
  readWriteRatio?: "95/5" | "80/20" | "50/50";
  avgPayloadKb?: number;
  dbIops?: number;
  renewalHorizonYears?: 1 | 3;
  currency?: Currency;
}

export type TierId = "budget" | "hostinger" | "balanced" | "enterprise";

export interface RecommendationTier {
  tierId: TierId;
  tierName: string;
  providerId: string;
  providerName: string;
  monthlyEstimateUSD: number;
  monthlyEstimateINR?: number;
  introMonthlyUSD?: number;
  renewalMonthlyUSD?: number;
  introMonthlyINR?: number;
  renewalMonthlyINR?: number;
  tco1YearUSD?: number;
  tco3YearUSD?: number;
  tco1YearINR?: number;
  tco3YearINR?: number;
  pricingConfidence: string;
  headline: string;
  whySelected: string;
  satisfiedRequirements: string[];
  includedComponents: string[];
  excludedComponents: string[];
  operationalComplexity: string;
  tradeoffs: {
    availability: string;
    security: string;
  };
  risks: string[];
  eligible: boolean;
  eligibilityReason: string;
  isBestFit?: boolean;
  badge?: string;
  hostingerFeatures?: {
    kodeeAi: boolean;
    coolifySupport: boolean;
    nvmeStorage: string;
    datacenter: string;
    backupCadence: string;
  };
}

export interface ArchitectureNodeData {
  title: string;
  subtitle: string;
  zone: "public" | "app-subnet" | "data-subnet";
  status: "active" | "standby" | "optional" | "overloaded" | "failed" | "recovering";
  provider: string;
  icon: string;
  instances?: number;
  isHA?: boolean;
  options?: Record<string, any>;
  nodeType?: "cdn" | "waf" | "lb" | "app" | "pgbouncer" | "postgres" | "redis" | "s3" | "queue";
  liveRps?: number;
  liveLatencyMs?: number;
  [key: string]: any;
}

export interface ArchitectureNode {
  id: string;
  type: string;
  category: "client" | "edge" | "security" | "networking" | "compute" | "database" | "cache" | "storage" | "queue";
  position: { x: number; y: number };
  data: ArchitectureNodeData;
}

export interface ArchitectureEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
  liveMetrics?: {
    rps: number;
    latencyMs: number;
    protocol: string;
  };
}

export interface TrustBoundary {
  id: string;
  title: string;
  description: string;
  zone: string;
  color: string;
}

export interface ArchitectureGraph {
  template: string;
  selectedTier: string;
  provider: string;
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  boundaries: TrustBoundary[];
  validationWarnings: Array<{
    type: string;
    severity: "info" | "success" | "warning" | "danger";
    message: string;
  }>;
  summary: string;
}

export interface CostLineItems {
  computeUSD: number;
  databaseUSD: number;
  storageUSD: number;
  transferUSD: number;
  networkingUSD: number;
  backupUSD: number;
  monitoringUSD: number;
}

export interface CostDriver {
  name: string;
  amountUSD: number;
  category: string;
  amountFormatted: string;
  percentage: number;
}

export interface CostOptimization {
  area: string;
  action: string;
  estimatedSavingsUSD: number;
}

export interface CostEstimate {
  provider: {
    id: string;
    name: string;
    category: string;
    tier: string;
    officialUrl: string;
    lastVerifiedDate: string;
  };
  currency: Currency;
  exchangeRate: number;
  lineItems: CostLineItems;
  fixedMonthlyUSD: number;
  usageMonthlyUSD: number;
  totalMonthlyUSD: number;
  annualProjectedUSD: number;
  tco1YearUSD?: number;
  tco3YearUSD?: number;
  tco1YearFormatted?: string;
  tco3YearFormatted?: string;
  scenarios: {
    lowUSD: number;
    expectedUSD: number;
    highUSD: number;
  };
  formatted: {
    totalMonthly: string;
    annualProjected: string;
    lowScenario: string;
    highScenario: string;
  };
  costDrivers: CostDriver[];
  optimizations: CostOptimization[];
  assumptions: string[];
}

export interface ProviderPlan {
  id: number;
  provider: string;
  plan_name: string;
  region: string;
  vcpu?: string;
  ram?: string;
  storage?: string;
  bandwidth?: string;
  monthly_usd: number | null;
  renewal_usd?: number | null;
  monthly_inr?: number | null;
  renewal_inr?: number | null;
  pricing_url: string;
  pricing_status: string;
  updated_at: string;
  category?: "compute" | "managed-k8s" | "database" | "cache" | "storage" | "edge";
  features?: string[];
}

export interface ProviderItem {
  id: string;
  name: string;
  category: "hyperscaler" | "vps" | "paas" | "database" | "storage" | "edge";
  tier: string;
  startingPrice: number;
  pricingModel: string;
  description: string;
  strengths: string[];
  risks: string[];
  computeOptions?: Array<{
    name: string;
    vcpu: string;
    ram: string;
    storage?: string;
    bandwidth?: string;
    monthlyUSD: number;
    renewalUSD?: number;
    monthlyINR?: number;
    renewalINR?: number;
    features?: string[];
  }>;
  databaseOptions?: Array<{
    name: string;
    monthlyUSD: number;
    renewalUSD?: number;
  }>;
  storageOptions?: Array<{
    name: string;
    storageCostPerGB: number;
    egressCostPerGB: number;
  }>;
  egressRate: number;
  egressIncludedGB: number;
  managed: boolean;
  compliance: boolean;
  regions: string[];
  officialUrl: string;
  pricingStatus: "verified" | "verify-before-use" | "requires-calculator" | "unverified";
  lastVerifiedDate: string;
  assumptions: string;
  dbPlans?: ProviderPlan[];
  specialPrimitives?: {
    aiAssistant?: string;
    osTemplates?: string[];
    backupInfo?: string;
    datacenters?: string[];
    tcoDiscountNote?: string;
  };
}

export interface FinOpsInsight {
  id: string;
  category: string;
  type: "cost" | "security";
  problem: string;
  action: string;
  reason: string;
  tradeoffs: string;
  expectedImpact: string;
}

export interface DatabaseAdvisorOption {
  id: string;
  name: string;
  category: string;
  targetAudience: string;
  operationalResponsibility: string;
  costStructure: string;
  availability: string;
  backups: string;
  connectionManagement: string;
  scalingConsiderations: string;
  regionalLatency: string;
  securityBoundaries: string;
}

export interface SavedProject {
  id: number;
  name: string;
  description: string;
  mode: PlanningMode;
  requirements: Requirements;
  selectedTier: TierId;
  architecture: ArchitectureGraph;
  costEstimate: CostEstimate;
  components: any[];
  tags: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------- DSA & System Design Types -----------------

export type DSANodeType =
  | "cdn"
  | "waf"
  | "lb"
  | "app"
  | "pgbouncer"
  | "postgres"
  | "redis"
  | "s3"
  | "queue";

export interface DSAComplexity {
  time: string;
  space: string;
}

export interface DSAAlgorithm {
  name: string;
  complexity: DSAComplexity;
  description: string;
  whyUsedInCloud: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface FailureMode {
  name: string;
  symptoms: string;
  mitigation: string;
  blastRadius: string;
}

export interface DSANodeKnowledge {
  nodeType: DSANodeType;
  title: string;
  category: string;
  primaryRole: string;
  dsa: {
    coreDataStructures: string[];
    algorithms: DSAAlgorithm[];
    codeSnippets: {
      typescript: string;
      python: string;
    };
  };
  systemDesign: {
    capTheorem: "AP (High Availability)" | "CP (Strong Consistency)" | "CA (Local Cluster)";
    capExplanation: string;
    failureModes: FailureMode[];
    throughputMath: {
      formula: string;
      explanation: string;
      exampleCalc: string;
    };
    faangPattern: string;
  };
  quiz: QuizQuestion[];
}

export type ChaosScenarioId = "spike" | "db-crash" | "cache-flush";

export interface ChaosScenario {
  id: ChaosScenarioId;
  name: string;
  description: string;
  severity: "high" | "critical" | "warning";
  triggerEffect: string;
}

export interface TierChaosImpact {
  status: "survived" | "degraded" | "failed";
  rto: string;
  dataLoss: string;
  explanation: string;
  bottleneckNode: string;
  recoveryAction: string;
}

export interface ChaosSimulationResult {
  scenarioId: ChaosScenarioId;
  scenarioName: string;
  timestamp: string;
  contabo: TierChaosImpact;
  hostinger: TierChaosImpact;
  digitalocean: TierChaosImpact;
  aws: TierChaosImpact;
}

// ----------------- Weekly Pricing Sync & Changes Types -----------------
export interface WeeklyPricingChange {
  id: string;
  providerId: string;
  providerName: string;
  changeType: string;
  title: string;
  description: string;
  impact: string;
  oldPrice: string;
  newPrice: string;
  category: "compute" | "database" | "storage" | "bandwidth" | "pricing-freeze";
  effectiveDate: string;
  officialUrl: string;
}

export interface PricingSyncStatus {
  lastSyncedAt: string;
  nextSyncAt: string;
  syncStatus: "synced" | "syncing" | "stale";
  syncFrequency: string;
  totalProvidersTracked: number;
  totalPlansTracked: number;
  lastSyncResult: {
    success: boolean;
    message: string;
    verifiedProviders: number;
    verifiedPlans: number;
    fluctuationsDetected: number;
  };
  officialPricingUrls: Record<string, { name: string; url: string; category: string }>;
}

