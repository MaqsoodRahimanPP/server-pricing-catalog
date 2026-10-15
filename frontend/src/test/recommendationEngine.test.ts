import { describe, it, expect } from "vitest";
import { generateClientRecommendations } from "../engine/recommendationEngine";
import { Requirements } from "../types";

const baseReq: Requirements = {
  projectName: "Test App",
  mode: "founder",
  projectType: "saas",
  users: 10000,
  trafficGB: 1000,
  nodes: 2,
  database: "postgres",
  dbHosting: "managed",
  availability: "standard",
  compliance: false,
  backup: true,
  ops: "managed",
  budgetUSD: 75,
  region: "india",
  stack: "node",
  resourceTier: "medium"
};

describe("Recommendation Engine", () => {
  it("returns three distinct transparent recommendation tiers", () => {
    const { tiers } = generateClientRecommendations(baseReq);

    expect(tiers).toHaveLength(3);
    const tierIds = tiers.map(t => t.tierId);
    expect(tierIds).toContain("budget");
    expect(tierIds).toContain("balanced");
    expect(tierIds).toContain("enterprise");
  });

  it("applies compliance gate: requires Enterprise Scalability when compliance = true", () => {
    const { bestFitTierId, tiers } = generateClientRecommendations({
      ...baseReq,
      compliance: true
    });

    expect(bestFitTierId).toBe("enterprise");
    const budgetTier = tiers.find(t => t.tierId === "budget");
    expect(budgetTier?.eligible).toBe(false);
    expect(budgetTier?.eligibilityReason).toContain("compliance");
  });

  it("applies budget constraint: selects Ultra-Budget when budget < $25", () => {
    const { bestFitTierId } = generateClientRecommendations({
      ...baseReq,
      budgetUSD: 15
    });

    expect(bestFitTierId).toBe("budget");
  });

  it("selects Balanced Value for standard managed SaaS requirements", () => {
    const { bestFitTierId, tiers } = generateClientRecommendations(baseReq);

    expect(bestFitTierId).toBe("balanced");
    const balancedTier = tiers.find(t => t.tierId === "balanced");
    expect(balancedTier?.isBestFit).toBe(true);
  });
});
