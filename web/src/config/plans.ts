export const FEATURES = [
  "basic_insights",
  "advanced_analytics",
  "prompt_suggestions",
  "prompt_volumes",
  "daily_monitoring",
  "competitor_tracking",
  "content_optimization",
  "custom_reports",
  "api_access",
  "white_label",
  "sso_saml",
] as const;

export type Feature = (typeof FEATURES)[number];

export type PlanId = "self_hosted" | "starter" | "growth" | "enterprise";

export interface PlanLimits {
  maxBrands: number;
  maxPrompts: number;
  maxPlatforms: number;
  maxTeamMembers: number;
  maxDomainsPerBrand: number;
  maxVolumeAnalyses: number;
  maxDailyOnDemand: number;
  onDemandCooldownMinutes: number;
  features: readonly Feature[];
  /** If set, only these scraper IDs are available. Undefined = all. */
  allowedScrapers?: readonly string[];
  /** If set, only these model IDs are available. Undefined = all, [] = none. */
  allowedModels?: readonly string[];
}

export interface PlanPricing {
  monthly: number;
}

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  pricing: PlanPricing | null;
  limits: PlanLimits;
  highlighted?: boolean;
}

export const PLANS: Record<PlanId, Plan> = {
  self_hosted: {
    id: "self_hosted",
    name: "Self-Hosted",
    tagline: "Full control on your own infrastructure",
    pricing: null,
    limits: {
      maxBrands: -1,
      maxPrompts: -1,
      maxPlatforms: 8,
      maxTeamMembers: -1,
      maxDomainsPerBrand: -1,
      maxVolumeAnalyses: -1,
      maxDailyOnDemand: -1,
      onDemandCooldownMinutes: 0,
      features: [
        "basic_insights",
        "prompt_suggestions",
        "prompt_volumes",
        "advanced_analytics",
        "daily_monitoring",
        "competitor_tracking",
        "content_optimization",
        "custom_reports",
        "api_access",
      ],
    },
  },
  starter: {
    id: "starter",
    name: "Starter",
    tagline: "Track your brand across AI platforms",
    pricing: { monthly: 49 },
    limits: {
      maxBrands: 1,
      maxPrompts: 50,
      maxPlatforms: 2,
      maxTeamMembers: 1,
      maxDomainsPerBrand: 3,
      maxVolumeAnalyses: 4,
      maxDailyOnDemand: 3,
      onDemandCooldownMinutes: 15,
      allowedScrapers: ["chatgpt-web", "perplexity-web"],
      allowedModels: [],
      features: [
        "basic_insights",
        "advanced_analytics",
        "prompt_suggestions",
        "prompt_volumes",
        "daily_monitoring",
        "competitor_tracking",
        "content_optimization",
        "custom_reports",
        "api_access",
      ],
    },
  },
  growth: {
    id: "growth",
    name: "Growth",
    tagline: "For brands that need deep insights",
    pricing: { monthly: 249 },
    highlighted: true,
    limits: {
      maxBrands: 4,
      maxPrompts: 200,
      maxPlatforms: 8,
      maxTeamMembers: 3,
      maxDomainsPerBrand: 10,
      maxVolumeAnalyses: 10,
      maxDailyOnDemand: 10,
      onDemandCooldownMinutes: 5,
      features: [
        "basic_insights",
        "prompt_suggestions",
        "prompt_volumes",
        "advanced_analytics",
        "daily_monitoring",
        "competitor_tracking",
        "content_optimization",
        "custom_reports",
        "api_access",
      ],
    },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For agencies and large teams at scale",
    pricing: null,
    limits: {
      maxBrands: -1,
      maxPrompts: -1,
      maxPlatforms: 8,
      maxTeamMembers: -1,
      maxDomainsPerBrand: -1,
      maxVolumeAnalyses: -1,
      maxDailyOnDemand: -1,
      onDemandCooldownMinutes: 0,
      features: [
        "basic_insights",
        "prompt_suggestions",
        "prompt_volumes",
        "advanced_analytics",
        "daily_monitoring",
        "competitor_tracking",
        "content_optimization",
        "custom_reports",
        "api_access",
        "white_label",
        "sso_saml",
      ],
    },
  },
} as const;

export const PLAN_ORDER: PlanId[] = ["starter", "growth", "enterprise"];

export const SUBSCRIBABLE_PLANS: PlanId[] = ["starter", "growth"];

/**
 * Self-hosted instances bypass all limits.
 * Cloud is determined by NEXT_PUBLIC_IS_CLOUD env var.
 */
export function isCloud(): boolean {
  return process.env.NEXT_PUBLIC_IS_CLOUD === "true";
}

export function getPlan(planId: string | null | undefined): Plan {
  if (!isCloud()) return PLANS.self_hosted;
  return PLANS[(planId as PlanId) ?? "starter"] ?? PLANS.starter;
}

export function hasFeature(plan: Plan, feature: Feature): boolean {
  return plan.limits.features.includes(feature);
}

export function isWithinLimit(
  plan: Plan,
  key: keyof Omit<PlanLimits, "features" | "allowedScrapers" | "allowedModels">,
  currentCount: number,
): boolean {
  const limit = plan.limits[key];
  if (limit === -1) return true;
  return currentCount < limit;
}

export function getMinimumPlanForFeature(feature: Feature): PlanId {
  for (const id of PLAN_ORDER) {
    if (PLANS[id].limits.features.includes(feature)) return id;
  }
  return "enterprise";
}
