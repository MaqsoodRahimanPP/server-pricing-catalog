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
  introComputeUSD?: number;
  renewalComputeUSD?: number;
}): CostEstimate {
  const {
    providerId = "hostinger",
    providerName = "Hostinger Cloud & KVM",
    category = params.category || (params.providerId === "aws" || params.providerId === "gcp" || params.providerId === "azure" ? "hyperscaler" : "vps"),
    instances = 2,
    unitComputeUSD = 8.99,
    dbType = "postgres",
    dbHosting = "self",
    storageGB = 100,
    dataTransferGB = 1000,
    cdnRequired = true,
    backupRequired = true,
    natGatewayCount = 0,
    monitoringLevel = "standard",
    currency = "USD",
    introComputeUSD,
    renewalComputeUSD
  } = params;

  // 1. Compute
  const activeComputeUnit = introComputeUSD !== undefined ? introComputeUSD : unitComputeUSD;
  const computeMonthlyUSD = Number((instances * activeComputeUnit).toFixed(2));

  // 2. Database
  let databaseMonthlyUSD = 0;
  if (dbType !== "none" && dbHosting !== "none") {
    if (dbHosting === "self") {
      databaseMonthlyUSD =
        providerId === "hetzner" ? 4.5 : providerId === "hostinger" ? 0.0 : 15.0;
    } else if (dbHosting === "serverless") {
      databaseMonthlyUSD = 19.0;
    } else {
      databaseMonthlyUSD = category === "hyperscaler" ? 130.0 : 30.0;
    }
  }

  // 3. Storage
  const storageMonthlyUSD =
    providerId === "hostinger" ? 0.0 : Number((storageGB * 0.08).toFixed(2));

  // 4. Transfer / Egress
  const includedGB =
    providerId === "hetzner"
      ? 20480
      : providerId === "contabo"
      ? 32768
      : providerId === "hostinger"
      ? 8192
      : 100;
  const egressRate =
    providerId === "hetzner" || providerId === "contabo"
      ? 0.001
      : providerId === "hostinger"
      ? 0.0001
      : 0.09;
  const billableGB = Math.max(0, dataTransferGB - includedGB);
  const transferMonthlyUSD = Number((billableGB * egressRate).toFixed(2));

  // 5. Networking
  const cdnMonthlyUSD = cdnRequired ? (dataTransferGB > 5000 ? 20.0 : 0.0) : 0.0;
  const natMonthlyUSD = Number((natGatewayCount * 32.85).toFixed(2));
  const lbMonthlyUSD =
    instances > 1
      ? category === "hyperscaler"
        ? 22.0
        : providerId === "hostinger" || providerId === "contabo"
        ? 0.0
        : 12.0
      : 0.0;
  const networkingMonthlyUSD = Number(
    (cdnMonthlyUSD + natMonthlyUSD + lbMonthlyUSD).toFixed(2)
  );

  // 6. Backup & Monitoring
  const backupMonthlyUSD = backupRequired
    ? providerId === "hostinger"
      ? 0.0 // Hostinger includes automated weekly backups
      : Number((storageGB * 0.05 + 5.0).toFixed(2))
    : 0.0;
  const monitoringMonthlyUSD =
    monitoringLevel === "advanced"
      ? 25.0
      : monitoringLevel === "standard"
      ? 10.0
      : 0.0;

  const fixedMonthlyUSD = Number(
    (
      computeMonthlyUSD +
      databaseMonthlyUSD +
      lbMonthlyUSD +
      natMonthlyUSD +
      monitoringMonthlyUSD
    ).toFixed(2)
  );
  const usageMonthlyUSD = Number(
    (
      storageMonthlyUSD +
      transferMonthlyUSD +
      backupMonthlyUSD +
      cdnMonthlyUSD
    ).toFixed(2)
  );

  const totalMonthlyUSD = Number((fixedMonthlyUSD + usageMonthlyUSD).toFixed(2));
  const annualProjectedUSD = Number((totalMonthlyUSD * 12).toFixed(2));

  // TCO Calculations
  const renewalComputeRate = renewalComputeUSD !== undefined ? renewalComputeUSD : activeComputeUnit * 1.5;
  const renewalMonthlyUSD = Number(
    (instances * renewalComputeRate + databaseMonthlyUSD + usageMonthlyUSD).toFixed(2)
  );
  const tco1YearUSD = annualProjectedUSD;
  const tco3YearUSD = Number((totalMonthlyUSD * 12 + renewalMonthlyUSD * 24).toFixed(2));

  const lowUSD = usageMonthlyUSD > 0
    ? Number((fixedMonthlyUSD + usageMonthlyUSD * 0.75).toFixed(2))
    : Number((totalMonthlyUSD * 0.85).toFixed(2));

  const highUSD = usageMonthlyUSD > 0
    ? Number((fixedMonthlyUSD + usageMonthlyUSD * 1.5).toFixed(2))
    : Number((totalMonthlyUSD * 1.25).toFixed(2));


  const fxRate = CURRENCY_RATES[currency] || 1.0;
  const toCurr = (val: number) => Number((val * fxRate).toFixed(2));
  const sym = currency === "INR" ? "₹" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";

  const costDrivers = [
    { name: "Compute Instances", amountUSD: computeMonthlyUSD, category: "Compute" },
    { name: "Database Service", amountUSD: databaseMonthlyUSD, category: "Database" },
    { name: "Storage Volumes", amountUSD: storageMonthlyUSD, category: "Storage" },
    { name: "Egress Bandwidth", amountUSD: transferMonthlyUSD, category: "Network" },
    { name: "Networking (ALB/NAT)", amountUSD: networkingMonthlyUSD, category: "Network" },
    { name: "Backups & Monitoring", amountUSD: backupMonthlyUSD + monitoringMonthlyUSD, category: "Operations" }
  ]
    .filter(d => d.amountUSD > 0)
    .map(d => ({
      ...d,
      amountFormatted: `${sym}${toCurr(d.amountUSD).toLocaleString()}`,
      percentage: totalMonthlyUSD > 0 ? Math.round((d.amountUSD / totalMonthlyUSD) * 100) : 0
    }));

  const optimizations = [
    {
      area: "Edge CDN Caching",
      action: "Route dynamic and static cache hits through Cloudflare Edge to eliminate origin bandwidth.",
      estimatedSavingsUSD: Math.round(dataTransferGB * 0.05)
    },
    {
      area: "Connection Multiplexing",
      action: "Use PgBouncer transaction pooling to run smaller database compute with 10x connection density.",
      estimatedSavingsUSD: 40
    },
    {
      area: "Object Storage Egress",
      action: "Use Cloudflare R2 ($0/GB egress) instead of AWS S3 ($0.09/GB) for media uploads.",
      estimatedSavingsUSD: Math.round(storageGB * 0.07)
    }
  ];

  return {
    provider: {
      id: providerId,
      name: providerName,
      category,
      tier: providerId === "hostinger" ? "Smart NVMe Value" : "Cloud Tier",
      officialUrl:
        providerId === "hostinger"
          ? "https://www.hostinger.com/vps-hosting"
          : providerId === "aws"
          ? "https://aws.amazon.com/pricing/"
          : "https://www.digitalocean.com/pricing",
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
    tco1YearUSD,
    tco3YearUSD,
    tco1YearFormatted: `${sym}${toCurr(tco1YearUSD).toLocaleString()}`,
    tco3YearFormatted: `${sym}${toCurr(tco3YearUSD).toLocaleString()}`,
    scenarios: {
      lowUSD,
      expectedUSD: totalMonthlyUSD,
      highUSD
    },
    formatted: {
      totalMonthly: `${sym}${toCurr(totalMonthlyUSD).toLocaleString()}`,
      annualProjected: `${sym}${toCurr(annualProjectedUSD).toLocaleString()}`,
      lowScenario: `${sym}${toCurr(lowUSD).toLocaleString()}`,
      highScenario: `${sym}${toCurr(highUSD).toLocaleString()}`
    },
    costDrivers,
    optimizations,
    assumptions: [
      `Compute sizing based on ${instances} instance(s) running 24/7.`,
      providerId === "hostinger"
        ? "Hostinger Gen4 NVMe disk, unmetered network port, automated weekly backups, and Kodee AI included."
        : "Standard on-demand pricing with public ingress free.",
      `Data transfer includes ${includedGB >= 1000 ? `${includedGB / 1024} TB` : `${includedGB} GB`} free baseline bandwidth.`
    ]
  };
}
