import { CostEstimate, Currency } from "../types";

export const CURRENCY_RATES: Record<Currency, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.78,
  INR: 86.5
};

export function calculateClientCosts(params: {
  providerId?: string;
  providerName?: string;
  category?: string;
  instances?: number;
  unitComputeUSD?: number;
  dbType?: string;
  dbHosting?: string;
  storageGB?: number;
  dataTransferGB?: number;
  cdnRequired?: boolean;
  backupRequired?: boolean;
  natGatewayCount?: number;
  monitoringLevel?: string;
  currency?: Currency;
}): CostEstimate {
  const {
    providerId = "aws",
    providerName = "Amazon Web Services",
    category = "hyperscaler",
    instances = 2,
    unitComputeUSD = 14.60,
    dbType = "postgres",
    dbHosting = "managed",
    storageGB = 100,
    dataTransferGB = 1000,
    cdnRequired = true,
    backupRequired = true,
    natGatewayCount = 0,
    monitoringLevel = "standard",
    currency = "USD"
  } = params;

  // 1. Compute
  const computeMonthlyUSD = Number((instances * unitComputeUSD).toFixed(2));

  // 2. Database
  let databaseMonthlyUSD = 0;
  if (dbType !== "none" && dbHosting !== "none") {
    if (dbHosting === "self") {
      databaseMonthlyUSD = providerId === "hetzner" ? 4.50 : 15.00;
    } else if (dbHosting === "serverless") {
      databaseMonthlyUSD = 19.00;
    } else {
      databaseMonthlyUSD = category === "hyperscaler" ? 130.00 : 30.00;
    }
  }

  // 3. Storage
  const storageMonthlyUSD = Number((storageGB * 0.08).toFixed(2));

  // 4. Transfer / Egress
  const includedGB = providerId === "hetzner" ? 20480 : providerId === "contabo" ? 32768 : 100;
  const egressRate = providerId === "hetzner" ? 0.001 : providerId === "contabo" ? 0.001 : 0.09;
  const billableGB = Math.max(0, dataTransferGB - includedGB);
  const transferMonthlyUSD = Number((billableGB * egressRate).toFixed(2));

  // 5. Networking
  const cdnMonthlyUSD = cdnRequired ? (dataTransferGB > 5000 ? 20.00 : 0.00) : 0.00;
  const natMonthlyUSD = Number((natGatewayCount * 32.85).toFixed(2));
  const lbMonthlyUSD = instances > 1 ? (category === "hyperscaler" ? 22.00 : 12.00) : 0.00;
  const networkingMonthlyUSD = Number((cdnMonthlyUSD + natMonthlyUSD + lbMonthlyUSD).toFixed(2));

  // 6. Backup & Monitoring
  const backupMonthlyUSD = backupRequired ? Number((storageGB * 0.05 + 5.00).toFixed(2)) : 0.00;
  const monitoringMonthlyUSD =
    monitoringLevel === "advanced" ? 25.00 : monitoringLevel === "standard" ? 10.00 : 0.00;

  const fixedMonthlyUSD = Number(
    (computeMonthlyUSD + databaseMonthlyUSD + lbMonthlyUSD + natMonthlyUSD + monitoringMonthlyUSD).toFixed(2)
  );
  const usageMonthlyUSD = Number(
    (storageMonthlyUSD + transferMonthlyUSD + backupMonthlyUSD + cdnMonthlyUSD).toFixed(2)
  );

  const totalMonthlyUSD = Number((fixedMonthlyUSD + usageMonthlyUSD).toFixed(2));
  const annualProjectedUSD = Number((totalMonthlyUSD * 12).toFixed(2));

  const lowUSD = Number((fixedMonthlyUSD + usageMonthlyUSD * 0.75).toFixed(2));
  const highUSD = Number((fixedMonthlyUSD + usageMonthlyUSD * 1.50).toFixed(2));

  const fxRate = CURRENCY_RATES[currency] || 1.0;
  const toCurr = (val: number) => Number((val * fxRate).toFixed(2));

  const costDrivers = [
    { name: "Compute Instances", amountUSD: computeMonthlyUSD, category: "Compute" },
    { name: "Database Service", amountUSD: databaseMonthlyUSD, category: "Database" },
    { name: "Storage Volumes", amountUSD: storageMonthlyUSD, category: "Storage" },
    { name: "Egress Bandwidth", amountUSD: transferMonthlyUSD, category: "Network" },
    { name: "Networking (ALB/NAT)", amountUSD: networkingMonthlyUSD, category: "Network" },
    { name: "Backups & Monitoring", amountUSD: backupMonthlyUSD + monitoringMonthlyUSD, category: "Operations" }
  ]
    .filter(i => i.amountUSD > 0)
    .sort((a, b) => b.amountUSD - a.amountUSD)
    .map(i => ({
      ...i,
      amountFormatted: `${currency} ${toCurr(i.amountUSD).toLocaleString()}`,
      percentage: totalMonthlyUSD > 0 ? Number(((i.amountUSD / totalMonthlyUSD) * 100).toFixed(1)) : 0
    }));

  return {
    provider: {
      id: providerId,
      name: providerName,
      category,
      tier: "Standard",
      officialUrl: "https://aws.amazon.com/pricing/",
      lastVerifiedDate: "2026-10-15"
    },
    currency,
    exchangeRate: fxRate,
    lineItems: {
      computeUSD: computeMonthlyUSD,
      databaseUSD: databaseMonthlyUSD,
      storageUSD: storageMonthlyUSD,
      transferUSD: transferMonthlyUSD,
      networkingUSD: networkingMonthlyUSD,
      backupUSD: backupMonthlyUSD,
      monitoringUSD: monitoringMonthlyUSD
    },
    fixedMonthlyUSD,
    usageMonthlyUSD,
    totalMonthlyUSD,
    annualProjectedUSD,
    scenarios: {
      lowUSD,
      expectedUSD: totalMonthlyUSD,
      highUSD
    },
    formatted: {
      totalMonthly: `${currency} ${toCurr(totalMonthlyUSD).toLocaleString()}`,
      annualProjected: `${currency} ${toCurr(annualProjectedUSD).toLocaleString()}`,
      lowScenario: `${currency} ${toCurr(lowUSD).toLocaleString()}`,
      highScenario: `${currency} ${toCurr(highUSD).toLocaleString()}`
    },
    costDrivers,
    optimizations: [
      {
        area: "Edge Caching",
        action: "Use Cloudflare edge caching for static assets to reduce origin egress.",
        estimatedSavingsUSD: Math.round(transferMonthlyUSD * 0.7)
      }
    ],
    assumptions: [
      `Calculated for ${instances} compute instance(s) running 730 hours/month`,
      "Pricing reflects standard 2026 on-demand rates without reserved commitments",
      "Usage-based network and storage estimates depend on actual client traffic"
    ]
  };
}
