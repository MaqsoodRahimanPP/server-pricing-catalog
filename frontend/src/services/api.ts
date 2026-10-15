import {
  Requirements,
  RecommendationTier,
  ArchitectureGraph,
  CostEstimate,
  ProviderItem,
  SavedProject,
  DatabaseAdvisorOption,
  FinOpsInsight
} from "../types";

const API_BASE = "/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(json.error || `HTTP error ${response.status} from ${path}`);
  }

  return json;
}

export const api = {
  // Health
  checkHealth: async (): Promise<{ status: string; database: string }> => {
    return request<{ status: string; database: string }>("/health");
  },

  // Providers
  getProviders: async (params?: Record<string, string>): Promise<{ count: number; providers: ProviderItem[] }> => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ count: number; providers: ProviderItem[] }>(`/providers${query}`);
  },

  getProviderDetails: async (id: string): Promise<{ success: boolean; data: ProviderItem }> => {
    return request<{ success: boolean; data: ProviderItem }>(`/providers/${id}`);
  },

  // Recommendations
  generateRecommendations: async (
    reqs: Partial<Requirements>
  ): Promise<{ success: boolean; data: { bestFitTierId: string; bestFitReason: string; tiers: RecommendationTier[] } }> => {
    return request("/recommendations", {
      method: "POST",
      body: JSON.stringify(reqs)
    });
  },

  // Architecture Generation
  generateArchitecture: async (
    requirements: Partial<Requirements>,
    selectedTier: string = "balanced"
  ): Promise<{ success: boolean; data: ArchitectureGraph }> => {
    return request("/architecture/generate", {
      method: "POST",
      body: JSON.stringify({ requirements, selectedTier })
    });
  },

  // Costs Calculation
  calculateCosts: async (params: Record<string, any>): Promise<{ success: boolean; data: CostEstimate }> => {
    return request("/costs/calculate", {
      method: "POST",
      body: JSON.stringify(params)
    });
  },

  // Database Advisor
  getDatabaseAdvisor: async (
    workload: string = "general",
    isHA: boolean = false
  ): Promise<{ success: boolean; data: { recommendedId: string; options: DatabaseAdvisorOption[] } }> => {
    return request(`/database-advisor/database?workload=${encodeURIComponent(workload)}&highAvailability=${isHA}`);
  },

  // FinOps Advisor
  getFinOpsInsights: async (
    requirements: Partial<Requirements>,
    estimate: Partial<CostEstimate>
  ): Promise<{ success: boolean; data: { count: number; insights: FinOpsInsight[] } }> => {
    return request("/finops-advisor/finops", {
      method: "POST",
      body: JSON.stringify({ requirements, estimate })
    });
  },

  // Projects Persistence
  getProjects: async (): Promise<{ success: boolean; count: number; data: SavedProject[] }> => {
    return request<{ success: boolean; count: number; data: SavedProject[] }>("/projects");
  },

  getProjectById: async (id: number): Promise<{ success: boolean; data: SavedProject }> => {
    return request<{ success: boolean; data: SavedProject }>(`/projects/${id}`);
  },

  saveProject: async (project: {
    name: string;
    description?: string;
    mode: string;
    requirements: any;
    selectedTier: string;
    architecture: any;
    costEstimate: any;
    components?: any[];
    tags?: string;
  }): Promise<{ success: boolean; data: { id: number; name: string; message: string } }> => {
    return request("/projects", {
      method: "POST",
      body: JSON.stringify(project)
    });
  },

  updateProject: async (
    id: number,
    project: any
  ): Promise<{ success: boolean; data: { id: number; message: string } }> => {
    return request(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(project)
    });
  },

  deleteProject: async (id: number): Promise<{ success: boolean; data: { id: number; message: string } }> => {
    return request(`/projects/${id}`, {
      method: "DELETE"
    });
  },

  // Reports
  exportReport: async (reportData: any): Promise<{
    success: boolean;
    data: {
      projectName: string;
      generatedDate: string;
      markdownReport: string;
      exportJson: any;
    };
  }> => {
    return request("/reports/export", {
      method: "POST",
      body: JSON.stringify(reportData)
    });
  },

  // Weekly Pricing Sync & Changes Tracker
  getPricingSyncStatus: async (): Promise<{ success: boolean; data: any }> => {
    return request("/providers/sync-status");
  },

  triggerPricingSync: async (): Promise<{ success: boolean; syncState: any; changesCount: number }> => {
    return request("/providers/sync-now", {
      method: "POST"
    });
  },

  getWeeklyPricingChanges: async (filter?: string): Promise<{ success: boolean; count: number; changes: any[]; lastSyncedAt: string }> => {
    const query = filter && filter !== "all" ? `?filter=${encodeURIComponent(filter)}` : "";
    return request(`/providers/weekly-changes${query}`);
  }
};

