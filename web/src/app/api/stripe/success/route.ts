import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!sessionId) {
    return NextResponse.redirect(`${appUrl}/dashboard/insights`);
  }

  let trackingJobId: string | null = null;

  try {
    // Retrieve and validate the Stripe checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (session.payment_status === 'paid' || session.status === 'complete') {
      const customerId =
        typeof session.customer === 'string'
          ? session.customer
          : session.customer?.id;

      const subscription =
        typeof session.subscription === 'string'
          ? await stripe.subscriptions.retrieve(session.subscription)
          : session.subscription;

      const subscriptionId = subscription?.id;
      const orgId =
        (subscription as { metadata?: { organization_id?: string } })?.metadata?.organization_id;
      const planId =
        (subscription as { metadata?: { plan_id?: string } })?.metadata?.plan_id;

      if (orgId && customerId && subscriptionId) {
        // Update org subscription (resolves webhook race condition)
        const { error: updateError } = await supabaseAdmin
          .from('organizations')
          .update({
            subscription_status: 'trialing',
            plan: planId || 'starter',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
          })
          .eq('id', orgId);

        if (updateError) {
          console.error('[stripe/success] DB update error:', updateError);
        } else {
          console.log('[stripe/success] DB updated for org:', orgId);

          // Find first brand and trigger tracking via aeo-server
          const { data: brand } = await supabaseAdmin
            .from('brands')
            .select('id')
            .eq('organization_id', orgId)
            .order('created_at', { ascending: true })
            .limit(1)
            .single();

          if (brand) {
            const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost';
            const cronSecret = process.env.CRON_SECRET;

            if (cronSecret) {
              try {
                const trackingRes = await fetch(`${serverUrl}/api/internal/trigger-tracking`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${cronSecret}`,
                  },
                  body: JSON.stringify({ brandId: brand.id }),
                });

                if (trackingRes.ok) {
                  const result = await trackingRes.json();
                  trackingJobId = result.jobId;
                  console.log('[stripe/success] Tracking triggered for brand:', brand.id, 'jobId:', trackingJobId);
                } else {
                  console.error('[stripe/success] Tracking trigger failed:', trackingRes.status);
                }
              } catch (fetchErr) {
                console.error('[stripe/success] Failed to call trigger-tracking:', fetchErr);
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('[stripe/success] Error:', err);
  }

  const redirectUrl = new URL(`${appUrl}/dashboard/insights`);
  if (trackingJobId) {
    redirectUrl.searchParams.set('jobId', trackingJobId);
  }
  return NextResponse.redirect(redirectUrl.toString());
}
