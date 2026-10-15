import React from "react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Navbar } from "../components/Navbar";
import { OverviewDashboard } from "../components/Dashboard/OverviewDashboard";
import { FounderModeForm } from "../components/ArchitectureDesigner/FounderModeForm";
import { RecommendationCards } from "../components/ArchitectureDesigner/RecommendationCards";
import { FALLBACK_PROVIDERS } from "../data/fallbackProviders";
import { generateClientRecommendations } from "../engine/recommendationEngine";
import { calculateClientCosts } from "../engine/costEngine";
import { generateClientArchitecture } from "../engine/architectureEngine";
import { Requirements } from "../types";

const mockReq: Requirements = {
  projectName: "Test SaaS",
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

describe("React Components Integration", () => {
  it("renders Navbar and switches planning modes", () => {
    const handleModeChange = vi.fn();
    const handleTabChange = vi.fn();

    render(
      <Navbar
        currentTab="designer"
        onTabChange={handleTabChange}
        planningMode="founder"
        onModeChange={handleModeChange}
        backendOnline={true}
        onNewArchitecture={vi.fn()}
        savedCount={2}
      />
    );

    expect(screen.getByText("CloudBlueprint")).toBeInTheDocument();
    expect(screen.getByText("Founder Mode")).toBeInTheDocument();
    expect(screen.getByText("DevOps Mode")).toBeInTheDocument();
    expect(screen.getByText("ONLINE DB")).toBeInTheDocument();

    fireEvent.click(screen.getByText("DevOps Mode"));
    expect(handleModeChange).toHaveBeenCalledWith("devops");
  });

  it("renders OverviewDashboard with provider counts and metrics", () => {
    const cost = calculateClientCosts({});
    const arch = generateClientArchitecture(mockReq);

    render(
      <OverviewDashboard
        providers={FALLBACK_PROVIDERS}
        savedProjects={[]}
        currentCostEstimate={cost}
        currentArchitecture={arch}
        onNavigate={vi.fn()}
        onSelectProject={vi.fn()}
      />
    );

    expect(screen.getByText("Supported Providers")).toBeInTheDocument();
    expect(screen.getByText("No saved projects yet")).toBeInTheDocument();
    expect(screen.getByText("Launch Architecture Designer")).toBeInTheDocument();
  });

  it("renders FounderModeForm and calls onGenerate on submit", () => {
    const onGenerate = vi.fn();
    const onChange = vi.fn();

    render(
      <FounderModeForm
        requirements={mockReq}
        onChange={onChange}
        onGenerate={onGenerate}
        onReset={vi.fn()}
        onLoadExample={vi.fn()}
      />
    );

    const generateBtn = screen.getByRole("button", { name: /generate architecture/i });
    expect(generateBtn).toBeInTheDocument();

    fireEvent.click(generateBtn);
    expect(onGenerate).toHaveBeenCalled();
  });

  it("renders RecommendationCards with 3 tiers and handles tier selection", () => {
    const { tiers, bestFitReason } = generateClientRecommendations(mockReq);
    const onSelectTier = vi.fn();

    render(
      <RecommendationCards
        tiers={tiers}
        selectedTierId="balanced"
        onSelectTier={onSelectTier}
        bestFitReason={bestFitReason}
      />
    );

    expect(screen.getByText("Ultra-Budget")).toBeInTheDocument();
    expect(screen.getByText("Balanced Value")).toBeInTheDocument();
    expect(screen.getByText("Enterprise Scalability")).toBeInTheDocument();
    expect(screen.getByText("BEST FIT")).toBeInTheDocument();

    const selectButtons = screen.getAllByRole("button");
    // Click budget tier button
    const budgetBtn = selectButtons.find(b => b.textContent?.includes("Select & Render Topology"));
    if (budgetBtn) {
      fireEvent.click(budgetBtn);
      expect(onSelectTier).toHaveBeenCalled();
    }
  });
});
