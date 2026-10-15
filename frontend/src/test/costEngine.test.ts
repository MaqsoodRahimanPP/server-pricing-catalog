import { describe, it, expect } from "vitest";
import { calculateClientCosts, CURRENCY_RATES } from "../engine/costEngine";

describe("Cost Calculation Engine", () => {
  it("calculates fixed and usage costs correctly for standard input", () => {
    const result = calculateClientCosts({
      providerId: "aws",
      instances: 2,
      unitComputeUSD: 14.60,
      dbType: "postgres",
      dbHosting: "managed",
      storageGB: 100,
      dataTransferGB: 1000,
      cdnRequired: true,
      backupRequired: true,
      currency: "USD"
    });

    // Compute: 2 * 14.60 = 29.20
    // Database: 130.00
    // Storage: 100 * 0.08 = 8.00
    // Transfer: (1000 - 100) * 0.09 = 900 * 0.09 = 81.00
    // Load balancer (instances > 1 on hyperscaler): 22.00
    // Backup: 100 * 0.05 + 5 = 10.00
    // Monitoring standard: 10.00
    expect(result.lineItems.computeUSD).toBe(29.20);
    expect(result.lineItems.databaseUSD).toBe(130.00);
    expect(result.lineItems.storageUSD).toBe(8.00);
    expect(result.lineItems.transferUSD).toBe(81.00);
    expect(result.fixedMonthlyUSD).toBeGreaterThan(0);
    expect(result.usageMonthlyUSD).toBeGreaterThan(0);
    expect(result.totalMonthlyUSD).toBe(
      Number((result.fixedMonthlyUSD + result.usageMonthlyUSD).toFixed(2))
    );
    expect(result.annualProjectedUSD).toBe(
      Number((result.totalMonthlyUSD * 12).toFixed(2))
    );
  });

  it("calculates low and peak traffic sensitivity scenarios", () => {
    const result = calculateClientCosts({
      instances: 2,
      dataTransferGB: 2000,
      storageGB: 200
    });

    expect(result.scenarios.lowUSD).toBeLessThan(result.scenarios.expectedUSD);
    expect(result.scenarios.highUSD).toBeGreaterThan(result.scenarios.expectedUSD);
  });

  it("converts totals to alternative currencies accurately", () => {
    const usdResult = calculateClientCosts({ currency: "USD", instances: 2 });
    const inrResult = calculateClientCosts({ currency: "INR", instances: 2 });
    const eurResult = calculateClientCosts({ currency: "EUR", instances: 2 });

    expect(inrResult.exchangeRate).toBe(CURRENCY_RATES.INR);
    expect(eurResult.exchangeRate).toBe(CURRENCY_RATES.EUR);
    expect(inrResult.formatted.totalMonthly).toContain("INR");
    expect(eurResult.formatted.totalMonthly).toContain("EUR");
  });

  it("identifies major cost drivers sorted in descending order", () => {
    const result = calculateClientCosts({
      instances: 4,
      unitComputeUSD: 25.00,
      dbType: "postgres",
      dbHosting: "managed"
    });

    expect(result.costDrivers.length).toBeGreaterThan(0);
    for (let i = 0; i < result.costDrivers.length - 1; i++) {
      expect(result.costDrivers[i].amountUSD).toBeGreaterThanOrEqual(
        result.costDrivers[i + 1].amountUSD
      );
    }
  });
});
