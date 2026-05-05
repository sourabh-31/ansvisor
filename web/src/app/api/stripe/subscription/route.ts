import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe, PRICE_IDS } from '@/lib/stripe';
import { SUBSCRIBABLE_PLANS } from '@/config/plans';

type SubscriptionRaw = {
  id: string;
  status: string;
  current_period_end: number;
  cancel_at_period_end: boolean;
  metadata: Record<string, string>;
  items: { data: Array<{ id: string; price: { unit_amount: number | null; recurring: { interval: string } | null } }> };
};

async function getOrgStripeIds() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  if (!profile?.organization_id) return null;

  const { data: org } = await supabase
    .from('organizations')
    .select('id, plan, subscription_status, stripe_customer_id, stripe_subscription_id, subscription_ends_at')
    .eq('id', profile.organization_id)
    .single();

  return org;
}

/** GET — current subscription details */
export async function GET() {
  try {
    const org = await getOrgStripeIds();
    if (!org) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!org.stripe_subscription_id) {
      return NextResponse.json({
        planId: org.plan ?? 'starter',
        status: org.subscription_status ?? 'inactive',
        currentPeriodEnd: org.subscription_ends_at,
        cancelAtPeriodEnd: false,
        priceAmount: null,
        interval: null,
      });
    }

    const sub = await stripe.subscriptions.retrieve(
      org.stripe_subscription_id as string,
    ) as unknown as SubscriptionRaw;

    const item = sub.items.data[0];
    const price = item?.price;

    return NextResponse.json({
      planId: org.plan ?? 'starter',
      status: sub.status,
      currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      priceAmount: price?.unit_amount ? price.unit_amount / 100 : null,
      interval: price?.recurring?.interval ?? null,
    });
  } catch (err) {
    console.error('[stripe/subscription] GET error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 },
    );
  }
}

/** PATCH — change plan (upgrade/downgrade) or reactivate */
export async function PATCH(req: NextRequest) {
  try {
    const org = await getOrgStripeIds();
    if (!org) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!org.stripe_subscription_id) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
    }

    const body = await req.json();
    const { newPlanId, reactivate } = body as {
      newPlanId?: 'starter' | 'growth';
      reactivate?: boolean;
    };

    const subscriptionId = org.stripe_subscription_id as string;

    // Reactivate a canceled-at-period-end subscription
    if (reactivate) {
      const updated = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      }) as unknown as SubscriptionRaw;
      return NextResponse.json({
        status: updated.status,
        cancelAtPeriodEnd: false,
        currentPeriodEnd: new Date(updated.current_period_end * 1000).toISOString(),
      });
    }

    // Plan change
    if (!newPlanId || !SUBSCRIBABLE_PLANS.includes(newPlanId)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    if (newPlanId === org.plan) {
      return NextResponse.json({ error: 'Already on this plan' }, { status: 400 });
    }

    const priceId = PRICE_IDS[newPlanId]?.monthly;
    if (!priceId) {
      return NextResponse.json({ error: 'Price not configured' }, { status: 400 });
    }

    const currentSub = await stripe.subscriptions.retrieve(subscriptionId) as unknown as SubscriptionRaw;
    const itemId = currentSub.items.data[0]?.id;

    if (!itemId) {
      return NextResponse.json({ error: 'Subscription item not found' }, { status: 400 });
    }

    const updated = await stripe.subscriptions.update(subscriptionId, {
      items: [{ id: itemId, price: priceId }],
      metadata: { plan_id: newPlanId, organization_id: org.id },
      proration_behavior: 'create_prorations',
    }) as unknown as SubscriptionRaw;

    // Optimistic DB update
    const supabase = await createClient();
    await supabase
      .from('organizations')
      .update({ plan: newPlanId })
      .eq('id', org.id);

    const newPrice = updated.items.data[0]?.price;

    return NextResponse.json({
      planId: newPlanId,
      status: updated.status,
      currentPeriodEnd: new Date(updated.current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: updated.cancel_at_period_end,
      priceAmount: newPrice?.unit_amount ? newPrice.unit_amount / 100 : null,
      interval: newPrice?.recurring?.interval ?? null,
    });
  } catch (err) {
    console.error('[stripe/subscription] PATCH error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 },
    );
  }
}

/** DELETE — cancel subscription at period end */
export async function DELETE() {
  try {
    const org = await getOrgStripeIds();
    if (!org) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!org.stripe_subscription_id) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
    }

    const updated = await stripe.subscriptions.update(
      org.stripe_subscription_id as string,
      { cancel_at_period_end: true },
    ) as unknown as SubscriptionRaw;

    return NextResponse.json({
      cancelAtPeriodEnd: true,
      currentPeriodEnd: new Date(updated.current_period_end * 1000).toISOString(),
    });
  } catch (err) {
    console.error('[stripe/subscription] DELETE error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 },
    );
  }
}
