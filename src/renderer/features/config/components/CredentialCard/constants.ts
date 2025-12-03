import type { Platform } from "../../hooks/useCredentials";
import type { PlatformConfig } from "./types";

export const PLATFORM_CONFIG: Record<Platform, PlatformConfig> = {
  alptis: {
    name: "Alptis",
    description: "Portail courtier Alptis Assurances",
    accentColor: "text-emerald-400",
    accentBg: "bg-emerald-500/10",
    accentBorder: "border-emerald-500/30",
    icon: "🏔️",
  },
  swisslife: {
    name: "SwissLife One",
    description: "Plateforme SwissLife One",
    accentColor: "text-rose-400",
    accentBg: "bg-rose-500/10",
    accentBorder: "border-rose-500/30",
    icon: "🔴",
  },
};
