import { describe, it, expect } from "vitest";
import { generateClientArchitecture } from "../engine/architectureEngine";
import { Requirements } from "../types";

const baseReq: Requirements = {
  projectName: "Test App",
  mode: "founder",
  projectType: "saas",
  users: 25000,
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

describe("Architecture Engine", () => {
  it("generates valid topology graph with nodes, edges, and boundaries", () => {
    const arch = generateClientArchitecture(baseReq, "balanced");

    expect(arch.nodes.length).toBeGreaterThan(0);
    expect(arch.edges.length).toBeGreaterThan(0);
    expect(arch.boundaries.length).toBe(3); // Public Edge, VPC App Subnet, Isolated Data Subnet
  });

  it("places database strictly in isolated data subnet and never in public zone", () => {
    const arch = generateClientArchitecture(baseReq, "balanced");
    const dbNode = arch.nodes.find(n => n.category === "database" && n.data.title.includes("PostgreSQL"));

    expect(dbNode).toBeDefined();
    expect(dbNode?.data.zone).toBe("data-subnet");
  });

  it("adds PgBouncer connection pooler between compute and PostgreSQL", () => {
    const arch = generateClientArchitecture(baseReq, "balanced");
    const poolerNode = arch.nodes.find(n => n.id === "node-pooler");

    expect(poolerNode).toBeDefined();
    expect(poolerNode?.data.zone).toBe("data-subnet");

    // Edge from compute to pooler
    const edgeToPooler = arch.edges.find(e => e.target === "node-pooler");
    expect(edgeToPooler).toBeDefined();

    // Edge from pooler to DB
    const edgeToDb = arch.edges.find(e => e.source === "node-pooler" && e.target === "node-db");
    expect(edgeToDb).toBeDefined();
  });

  it("includes load balancer when instance count is greater than 1", () => {
    const arch = generateClientArchitecture({ ...baseReq, nodes: 3 }, "balanced");
    const lbNode = arch.nodes.find(n => n.category === "networking");

    expect(lbNode).toBeDefined();
  });
});
