/**
 * Plan definitions — must stay in sync with frontend (aeo/src/config/plans.ts).
 * Self-hosted instances bypass all limits (IS_CLOUD !== "true").
 */

export const PLANS = {
  self_hosted: {
    id: 'self_hosted',
    name: 'Self-Hosted',
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
        'basic_insights',
        'prompt_suggestions',
        'prompt_volumes',
        'advanced_analytics',
        'daily_monitoring',
        'competitor_tracking',
        'content_optimization',
        'custom_reports',
        'api_access',
      ],
    },
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    limits: {
      maxBrands: 1,
      maxPrompts: 50,
      maxPlatforms: 4,
      maxTeamMembers: 1,
      maxDomainsPerBrand: 3,
      maxVolumeAnalyses: 4,
      maxDailyOnDemand: 3,
      onDemandCooldownMinutes: 15,
      features: [
        'basic_insights',
        'prompt_suggestions',
        'prompt_volumes',
        'advanced_analytics',
        'daily_monitoring',
        'competitor_tracking',
        'content_optimization',
        'custom_reports',
        'api_access',
      ],
    },
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    limits: {
      maxBrands: 10,
      maxPrompts: 200,
      maxPlatforms: 8,
      maxTeamMembers: 3,
      maxDomainsPerBrand: 10,
      maxVolumeAnalyses: 10,
      maxDailyOnDemand: 10,
      onDemandCooldownMinutes: 5,
      features: [
        'basic_insights',
        'prompt_suggestions',
        'prompt_volumes',
        'advanced_analytics',
        'daily_monitoring',
        'competitor_tracking',
        'content_optimization',
        'custom_reports',
        'api_access',
      ],
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
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
        'basic_insights',
        'prompt_suggestions',
        'prompt_volumes',
        'advanced_analytics',
        'daily_monitoring',
        'competitor_tracking',
        'content_optimization',
        'custom_reports',
        'api_access',
        'white_label',
        'sso_saml',
      ],
    },
  },
};

export function isCloud() {
  return process.env.IS_CLOUD === 'true';
}

export function getPlan(planId) {
  if (!isCloud()) return PLANS.self_hosted;
  return PLANS[planId] || PLANS.starter;
}

export function hasFeature(plan, feature) {
  return plan.limits.features.includes(feature);
}

export function isWithinLimit(plan, key, currentCount) {
  const limit = plan.limits[key];
  if (limit === -1) return true;
  return currentCount < limit;
}
