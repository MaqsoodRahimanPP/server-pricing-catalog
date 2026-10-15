import React from "react";
import {
  Server,
  Database,
  Globe,
  ShieldCheck,
  Zap,
  HardDrive,
  Network,
  Scale,
  Users,
  Layers,
  Cpu,
  Lock,
  Cloud
} from "lucide-react";

export type CloudProviderId =
  | "aws"
  | "gcp"
  | "azure"
  | "hostinger"
  | "hetzner"
  | "contabo"
  | "digitalocean"
  | "linode"
  | "supabase"
  | "neon"
  | "cloudflare"
  | "unknown";

export type CloudServiceCategory =
  | "loadbalancer"
  | "compute"
  | "database"
  | "storage"
  | "edge"
  | "security"
  | "cache"
  | "client";

// Clean, recognizable SVG Provider Logos
export const ProviderLogo: React.FC<{
  provider: string;
  className?: string;
  size?: number;
}> = ({ provider = "", className = "", size = 20 }) => {
  const p = provider.toLowerCase();

  if (p.includes("aws") || p.includes("amazon")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={className}
      >
        <rect width="24" height="24" rx="5" fill="#232F3E" />
        <path
          d="M6.5 14.5c3 1.8 7.5 1.8 10.5 0"
          stroke="#FF9900"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M17 13.5l1 1-1.2 0.8"
          stroke="#FF9900"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          x="12"
          y="10.5"
          fill="#FFFFFF"
          fontSize="6.5"
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="sans-serif"
        >
          AWS
        </text>
      </svg>
    );
  }

  if (p.includes("gcp") || p.includes("google")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={className}
      >
        <rect width="24" height="24" rx="5" fill="#1E293B" />
        <path
          d="M12 6.5a4 4 0 013.9 3.1A3 3 0 0115 15.5H9a3.5 3.5 0 01-1-6.8 4 4 0 014-2.2z"
          fill="#4285F4"
        />
        <circle cx="9" cy="12" r="2" fill="#EA4335" />
        <circle cx="15" cy="12" r="2" fill="#34A853" />
        <circle cx="12" cy="10" r="2" fill="#FBBC05" />
      </svg>
    );
  }

  if (p.includes("azure") || p.includes("microsoft")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={className}
      >
        <rect width="24" height="24" rx="5" fill="#0F172A" />
        <path
          d="M6 17l4.5-9.5h3L9 17H6z"
          fill="#0078D4"
        />
        <path
          d="M13.5 7.5L18 17h-4.5l-3-6.5 3-3z"
          fill="#50E6FF"
        />
      </svg>
    );
  }

  if (p.includes("hostinger")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={className}
      >
        <rect width="24" height="24" rx="5" fill="#673DE6" />
        <path
          d="M13 5L7 13h5l-1 6 6-8h-5l1-6z"
          fill="#FFFFFF"
          stroke="#FFFFFF"
          strokeWidth="0.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (p.includes("hetzner")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={className}
      >
        <rect width="24" height="24" rx="5" fill="#D50C2D" />
        <path
          d="M7 6v12h3v-4.5h4V18h3V6h-3v4.5h-4V6H7z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  if (p.includes("contabo")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={className}
      >
        <rect width="24" height="24" rx="5" fill="#004F9F" />
        <circle cx="9" cy="12" r="3.5" fill="#00C1DE" />
        <circle cx="15" cy="12" r="3.5" fill="#FFFFFF" fillOpacity="0.8" />
      </svg>
    );
  }

  if (p.includes("digitalocean") || p.includes("do ") || p.includes("droplet")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={className}
      >
        <rect width="24" height="24" rx="5" fill="#0080FF" />
        <path
          d="M12 5a7 7 0 00-7 7h3a4 4 0 014-4V5z"
          fill="#FFFFFF"
        />
        <rect x="7" y="15" width="3" height="3" fill="#FFFFFF" />
        <rect x="10" y="15" width="2" height="2" fill="#FFFFFF" />
      </svg>
    );
  }

  if (p.includes("linode") || p.includes("akamai")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={className}
      >
        <rect width="24" height="24" rx="5" fill="#00A95C" />
        <path
          d="M12 6a6 6 0 100 12A6 6 0 0012 6zm-2 6a2 2 0 114 0 2 2 0 01-4 0z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  if (p.includes("supabase")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={className}
      >
        <rect width="24" height="24" rx="5" fill="#1C1C1C" />
        <path
          d="M13.5 5.5L7 13.5h5l-1.5 5.5L17 11h-5l1.5-5.5z"
          fill="#3ECF8E"
        />
      </svg>
    );
  }

  if (p.includes("neon")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={className}
      >
        <rect width="24" height="24" rx="5" fill="#000000" />
        <path
          d="M7 17V7l10 10V7"
          stroke="#00E599"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (p.includes("cloudflare")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={className}
      >
        <rect width="24" height="24" rx="5" fill="#F38020" />
        <path
          d="M16.5 15.5a2.5 2.5 0 00.5-4.9 3.5 3.5 0 00-6.8-1 2.5 2.5 0 00-3.2 2.9A2 2 0 008 15.5h8.5z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  // Fallback generic cloud
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-md bg-slate-800 flex items-center justify-center text-slate-300 ${className}`}
    >
      <Cloud className="w-3.5 h-3.5" />
    </div>
  );
};

// Recognizable Service Category Icons
export const ServiceIcon: React.FC<{
  category: string;
  iconName?: string;
  className?: string;
  size?: number;
}> = ({ category = "", iconName = "", className = "", size = 18 }) => {
  const cat = category.toLowerCase();
  const icon = iconName.toLowerCase();

  // Load Balancer
  if (cat.includes("load") || cat.includes("lb") || icon.includes("scale") || icon.includes("network")) {
    return <Scale className={`text-emerald-400 ${className}`} style={{ width: size, height: size }} />;
  }

  // Compute / VPS
  if (cat.includes("compute") || cat.includes("vps") || icon.includes("server") || icon.includes("cpu")) {
    return <Server className={`text-indigo-400 ${className}`} style={{ width: size, height: size }} />;
  }

  // Managed Database
  if (cat.includes("data") || cat.includes("db") || icon.includes("database")) {
    return <Database className={`text-purple-400 ${className}`} style={{ width: size, height: size }} />;
  }

  // Object Storage
  if (cat.includes("storage") || icon.includes("harddrive") || icon.includes("drive")) {
    return <HardDrive className={`text-amber-400 ${className}`} style={{ width: size, height: size }} />;
  }

  // CDN / WAF / DNS
  if (cat.includes("edge") || cat.includes("cdn") || icon.includes("globe")) {
    return <Globe className={`text-cyan-400 ${className}`} style={{ width: size, height: size }} />;
  }

  if (cat.includes("security") || cat.includes("waf") || icon.includes("shield")) {
    return <ShieldCheck className={`text-rose-400 ${className}`} style={{ width: size, height: size }} />;
  }

  // Cache / Redis
  if (cat.includes("cache") || icon.includes("zap") || icon.includes("layers")) {
    return <Zap className={`text-yellow-400 ${className}`} style={{ width: size, height: size }} />;
  }

  // Users
  if (cat.includes("client") || icon.includes("users")) {
    return <Users className={`text-blue-400 ${className}`} style={{ width: size, height: size }} />;
  }

  return <Cpu className={`text-slate-400 ${className}`} style={{ width: size, height: size }} />;
};
