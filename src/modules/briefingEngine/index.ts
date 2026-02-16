import { BriefingTypeConfig } from "@/types/briefing";
import { landingConfig } from "./configs/landing";

const configs: Record<string, BriefingTypeConfig> = {
    LANDING: landingConfig,
};

export function getBriefingConfig(type: string): BriefingTypeConfig | null {
    return configs[type.toUpperCase()] || null;
}

export function getAllConfigs(): BriefingTypeConfig[] {
    return Object.values(configs);
}

export function getEnabledConfigs(): BriefingTypeConfig[] {
    return Object.values(configs).filter((c) => c.enabled);
}

export { landingConfig };
