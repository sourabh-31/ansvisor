"use client";


import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PLANS, PLAN_ORDER, type PlanId } from "@/config/plans";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Check, Minus, Github } from "lucide-react";


function PlanCard({
  planId,
}: {
  planId: PlanId;
}) {
  const plan = PLANS[planId];
  const price = plan.pricing;
  const isHighlighted = plan.highlighted;
  const displayPrice = price === null ? null : price.monthly;

  const ctaMap: Record<PlanId, { label: string; href: string }> = {
    self_hosted: { label: "Self-Host", href: "/docs/self-host" },
    starter: { label: "Get Started", href: "/sign-up" },
    growth: { label: "Start Free Trial", href: "/sign-up" },
    enterprise: { label: "Contact Sales", href: "mailto:sales@ansvisor.com" },
  };
  const cta = ctaMap[planId];

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md",
        isHighlighted && "border-primary shadow-md ring-1 ring-primary/20",
      )}
    >
      {isHighlighted && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          Most Popular
        </Badge>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold">{plan.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>

        <div className="mt-4 flex items-end gap-1">
          {displayPrice !== null ? (
            <>
              <span className="text-4xl font-bold tracking-tight">
                ${displayPrice}
              </span>
              {displayPrice !== 0 && (
                <span className="mb-1 text-sm text-muted-foreground">
                  /month
                </span>
              )}
            </>
          ) : (
            <span className="text-3xl font-bold tracking-tight">Custom</span>
          )}
        </div>

      </div>

      <Link href={cta.href}>
        <Button
          variant={isHighlighted ? "default" : "outline"}
          className="w-full"
        >
          {cta.label}
        </Button>
      </Link>

      <Separator className="my-6" />

      <div className="flex-1 space-y-3 text-sm">
        <PlanFeature>
          <strong>
            {plan.limits.maxBrands === -1
              ? "Unlimited"
              : plan.limits.maxBrands}
          </strong>{" "}
          {plan.limits.maxBrands === 1 ? "brand" : "brands"}
        </PlanFeature>
        <PlanFeature>
          <strong>
            {plan.limits.maxPrompts === -1
              ? "Unlimited"
              : plan.limits.maxPrompts}
          </strong>{" "}
          prompts tracked
        </PlanFeature>
        <PlanFeature>
          {plan.limits.maxPlatforms === 1 ? (
            <><strong>1</strong> platform (ChatGPT)</>
          ) : (
            <><strong>{plan.limits.maxPlatforms}</strong> AI platforms</>
          )}
        </PlanFeature>
        <PlanFeature>
          <strong>
            {plan.limits.maxTeamMembers === -1
              ? "Unlimited"
              : plan.limits.maxTeamMembers}
          </strong>{" "}
          team {plan.limits.maxTeamMembers === 1 ? "member" : "members"}
        </PlanFeature>
        <PlanFeature>
          {plan.limits.features.includes("daily_monitoring")
            ? "Daily monitoring"
            : "Weekly monitoring"}
        </PlanFeature>

        {plan.limits.features.includes("competitor_tracking") && (
          <PlanFeature>Competitor tracking</PlanFeature>
        )}
        {plan.limits.features.includes("content_optimization") && (
          <PlanFeature>Content optimization</PlanFeature>
        )}
        {plan.limits.features.includes("advanced_analytics") && (
          <PlanFeature>Advanced analytics</PlanFeature>
        )}
        {plan.limits.features.includes("custom_reports") && (
          <PlanFeature>Custom reports</PlanFeature>
        )}
        {plan.limits.features.includes("api_access") && (
          <PlanFeature>API access</PlanFeature>
        )}
        {plan.limits.features.includes("white_label") && (
          <PlanFeature>White-label</PlanFeature>
        )}
        {plan.limits.features.includes("sso_saml") && (
          <PlanFeature>SSO / SAML</PlanFeature>
        )}
      </div>
    </div>
  );
}

function PlanFeature({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <span>{children}</span>
    </div>
  );
}

// ─── Comparison Table ────────────────────────────────────────────────────────

interface ComparisonRow {
  label: string;
  values: Record<PlanId, string | boolean>;
}

const COMPARISON_SECTIONS: {
  title: string;
  rows: ComparisonRow[];
}[] = [
  {
    title: "Answer Engine Insights",
    rows: [
      {
        label: "AI platforms",
        values: { self_hosted: "All 8", starter: "4", growth: "All 8", enterprise: "All 8" },
      },
      {
        label: "Prompts tracked",
        values: { self_hosted: "Unlimited", starter: "10", growth: "200", enterprise: "Unlimited" },
      },
      {
        label: "Daily monitoring",
        values: { self_hosted: true, starter: true, growth: true, enterprise: true },
      },
      {
        label: "Competitor tracking",
        values: { self_hosted: true, starter: true, growth: true, enterprise: true },
      },
      {
        label: "Sentiment analysis",
        values: { self_hosted: true, starter: true, growth: true, enterprise: true },
      },
      {
        label: "Prompt suggestions (AI)",
        values: { self_hosted: true, starter: true, growth: true, enterprise: true },
      },
    ],
  },
  {
    title: "Content & Optimization",
    rows: [
      {
        label: "Content optimization",
        values: { self_hosted: true, starter: false, growth: true, enterprise: true },
      },
      {
        label: "Advanced analytics",
        values: { self_hosted: true, starter: false, growth: true, enterprise: true },
      },
      {
        label: "Custom reports",
        values: { self_hosted: true, starter: false, growth: true, enterprise: true },
      },
    ],
  },
  {
    title: "Organization",
    rows: [
      {
        label: "Brands",
        values: { self_hosted: "Unlimited", starter: "1", growth: "10", enterprise: "Unlimited" },
      },
      {
        label: "Team members",
        values: { self_hosted: "Unlimited", starter: "3", growth: "10", enterprise: "Unlimited" },
      },
      {
        label: "Domains per brand",
        values: { self_hosted: "Unlimited", starter: "3", growth: "10", enterprise: "Unlimited" },
      },
      {
        label: "API access",
        values: { self_hosted: true, starter: false, growth: true, enterprise: true },
      },
      {
        label: "White-label",
        values: { self_hosted: true, starter: false, growth: false, enterprise: true },
      },
      {
        label: "SSO / SAML",
        values: { self_hosted: false, starter: false, growth: false, enterprise: true },
      },
    ],
  },
  {
    title: "Support",
    rows: [
      {
        label: "Community support",
        values: { self_hosted: true, starter: true, growth: true, enterprise: true },
      },
      {
        label: "Email support",
        values: { self_hosted: false, starter: true, growth: true, enterprise: true },
      },
      {
        label: "Priority support",
        values: { self_hosted: false, starter: false, growth: true, enterprise: true },
      },
      {
        label: "Dedicated success manager",
        values: { self_hosted: false, starter: false, growth: false, enterprise: true },
      },
      {
        label: "SLA",
        values: { self_hosted: false, starter: false, growth: false, enterprise: true },
      },
    ],
  },
];

function ComparisonCell({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="mx-auto h-4 w-4 text-primary" />
    ) : (
      <Minus className="mx-auto h-4 w-4 text-muted-foreground/40" />
    );
  }
  return <span className="text-sm font-medium">{value}</span>;
}

function ComparisonTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-4 pr-4 text-left font-medium text-muted-foreground w-[240px]">
              Features
            </th>
            {PLAN_ORDER.map((id) => (
              <th key={id} className="px-4 py-4 text-center font-semibold">
                {PLANS[id].name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPARISON_SECTIONS.map((section) => (
            <>
              <tr key={section.title}>
                <td
                  colSpan={5}
                  className="pb-2 pt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {section.title}
                </td>
              </tr>
              {section.rows.map((row) => (
                <tr key={row.label} className="border-b border-border/50">
                  <td className="py-3 pr-4 text-sm">{row.label}</td>
                  {PLAN_ORDER.map((id) => (
                    <td key={id} className="px-4 py-3 text-center">
                      <ComparisonCell value={row.values[id]} />
                    </td>
                  ))}
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function PricingPage() {
  const t = useTranslations("marketing.pricing");

  return (
    <div className="py-20">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="mb-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        {/* Self-hosted banner */}
        <div className="mb-10 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm">
            <Github className="h-4 w-4" />
            <span>
              Self-host for free with{" "}
              <strong className="text-foreground">all features unlocked</strong>
                    </span>
                </div>
              </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PLAN_ORDER.map((id) => (
            <PlanCard key={id} planId={id} />
          ))}
        </div>

        {/* Comparison table */}
        <div className="mt-20">
          <h2 className="mb-8 text-center text-2xl font-bold tracking-tight">
            {t("compareTitle")}
          </h2>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <ComparisonTable />
          </div>
        </div>

        {/* Open source callout */}
        <div className="mt-16 rounded-2xl border bg-card p-8 text-center shadow-sm">
          <Github className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-bold">{t("ossTitle")}</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {t("ossDescription")}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="https://github.com/your-org/ansvisor">
              <Button variant="outline" className="gap-2">
                <Github className="h-4 w-4" />
                View on GitHub
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button>Try Cloud Free</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
