import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error('[stripe/webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId =
          typeof session.customer === 'string'
            ? session.customer
            : session.customer?.id;
        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id;

        if (customerId && subscriptionId) {
          // Fetch the subscription to get metadata
          const subscription =
            await stripe.subscriptions.retrieve(subscriptionId);
          const orgId = subscription.metadata.organization_id;
          const planId = subscription.metadata.plan_id;
          console.log('[webhook] checkout.session.completed — orgId:', orgId, 'planId:', planId, 'customerId:', customerId, 'subscriptionId:', subscriptionId);

          if (orgId) {
            const { error } = await supabaseAdmin
              .from('organizations')
              .update({
                subscription_status: 'trialing',
                plan: planId || 'starter',
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
              })
              .eq('id', orgId);
            if (error) console.error('[webhook] DB update error:', error);
            else console.log('[webhook] DB updated successfully for org:', orgId);
          }
        } else {
          console.log('[webhook] checkout.session.completed — missing customerId or subscriptionId:', { customerId, subscriptionId });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer?.id;

        if (customerId) {
          const updates: Record<string, unknown> = {
            subscription_status: subscription.status,
            subscription_ends_at: new Date(
              (subscription as unknown as { current_period_end: number }).current_period_end * 1000,
            ).toISOString(),
          };

          // Update plan if metadata has plan_id
          if (subscription.metadata.plan_id) {
            updates.plan = subscription.metadata.plan_id;
          }

          await supabaseAdmin
            .from('organizations')
            .update(updates)
            .eq('stripe_customer_id', customerId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer?.id;

        if (customerId) {
          await supabaseAdmin
            .from('organizations')
            .update({
              subscription_status: 'canceled',
              plan: 'starter',
            })
            .eq('stripe_customer_id', customerId);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer?.id;

        if (customerId) {
          await supabaseAdmin
            .from('organizations')
            .update({ subscription_status: 'active' })
            .eq('stripe_customer_id', customerId);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer?.id;

        if (customerId) {
          await supabaseAdmin
            .from('organizations')
            .update({ subscription_status: 'past_due' })
            .eq('stripe_customer_id', customerId);
        }
        break;
      }
    }
  } catch (err) {
    console.error('[stripe/webhook] Error processing event:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
