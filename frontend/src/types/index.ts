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
}

export interface RecommendationTier {
  tierId: "budget" | "balanced" | "enterprise";
  tierName: string;
  providerId: string;
  providerName: string;
  monthlyEstimateUSD: number;
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
}

export interface ArchitectureNodeData {
  title: string;
  subtitle: string;
  zone: "public" | "app-subnet" | "data-subnet";
  status: "active" | "standby" | "optional";
  provider: string;
  icon: string;
  instances?: number;
  isHA?: boolean;
  options?: Record<string, any>;
  [key: string]: any;
}

export interface ArchitectureNode {
  id: string;
  type: string;
  category: "client" | "edge" | "security" | "networking" | "compute" | "database" | "cache" | "storage";
  position: { x: number; y: number };
  data: ArchitectureNodeData;
}

export interface ArchitectureEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
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
  pricing_url: string;
  pricing_status: string;
  updated_at: string;
}

export interface ProviderItem {
  id: string;
  name: string;
  category: "hyperscaler" | "vps" | "paas" | "database" | "storage";
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
    monthlyUSD: number;
  }>;
  databaseOptions?: Array<{
    name: string;
    monthlyUSD: number;
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
  selectedTier: "budget" | "balanced" | "enterprise";
  architecture: ArchitectureGraph;
  costEstimate: CostEstimate;
  components: any[];
  tags: string;
  createdAt: string;
  updatedAt: string;
}
