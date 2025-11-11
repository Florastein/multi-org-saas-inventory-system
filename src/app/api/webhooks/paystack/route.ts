import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/paystack';
import { db } from '@/db';
import { transactions, subscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface PaystackWebhookPayload {
  event: string;
  data: {
    reference: string;
    amount: number;
    status: string;
    customer: { email: string };
    authorization?: {
      authorization_code: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
    };
    metadata?: Record<string, any>;
    channel?: string;
    paid_at?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-paystack-signature');
    const payload = await request.text();

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature header' },
        { status: 401 }
      );
    }

    // Verify webhook signature
    if (!verifyWebhookSignature(payload, signature)) {
      console.warn('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event: PaystackWebhookPayload = JSON.parse(payload);

    // Handle different events
    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(event);
        break;
      case 'charge.failed':
        await handleChargeFailed(event);
        break;
      case 'subscription.create':
        await handleSubscriptionCreate(event);
        break;
      case 'subscription.disable':
        await handleSubscriptionDisable(event);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event);
        break;
      default:
        console.log(`Unhandled event: ${event.event}`);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    // Still return 200 to prevent Paystack retries
    return NextResponse.json({ received: true }, { status: 200 });
  }
}

async function handleChargeSuccess(event: PaystackWebhookPayload) {
  const { reference, customer, amount, metadata, authorization, channel, paid_at } = event.data;

  try {
    const now = new Date().toISOString();
    
    // Update or create transaction
    await db.insert(transactions).values({
      userId: metadata?.userId || 'unknown',
      subscriptionId: metadata?.subscriptionId || null,
      reference,
      amount,
      amountGhs: amount / 100,
      status: 'success',
      paymentMethod: channel || 'card',
      metadata: JSON.stringify(metadata || {}),
      createdAt: paid_at || now,
      updatedAt: now,
    }).onConflictDoUpdate({
      target: transactions.reference,
      set: {
        status: 'success',
        paymentMethod: channel || 'card',
        metadata: JSON.stringify(metadata || {}),
        updatedAt: now,
      },
    });

    // Update subscription if applicable
    if (metadata?.subscriptionId && authorization?.authorization_code) {
      await db.update(subscriptions)
        .set({
          status: 'active',
          paystackAuthorizationCode: authorization.authorization_code,
          updatedAt: now,
        })
        .where(eq(subscriptions.id, metadata.subscriptionId));
    }

    console.log(`✅ Payment successful for ${customer.email}: GHS ${amount / 100}`);
  } catch (error) {
    console.error('Error handling charge success:', error);
  }
}

async function handleChargeFailed(event: PaystackWebhookPayload) {
  const { reference, customer } = event.data;

  try {
    const now = new Date().toISOString();
    
    await db.insert(transactions).values({
      userId: event.data.metadata?.userId || 'unknown',
      subscriptionId: event.data.metadata?.subscriptionId || null,
      reference,
      amount: event.data.amount,
      amountGhs: event.data.amount / 100,
      status: 'failed',
      paymentMethod: event.data.channel || 'card',
      metadata: JSON.stringify(event.data.metadata || {}),
      createdAt: now,
      updatedAt: now,
    }).onConflictDoUpdate({
      target: transactions.reference,
      set: {
        status: 'failed',
        updatedAt: now,
      },
    });

    console.log(`❌ Payment failed for ${customer.email}`);
  } catch (error) {
    console.error('Error handling charge failed:', error);
  }
}

async function handleSubscriptionCreate(event: PaystackWebhookPayload) {
  const { data } = event;
  
  try {
    console.log(`✅ Subscription created for ${data.customer.email}`);
    // Additional subscription logic can be added here
  } catch (error) {
    console.error('Error handling subscription create:', error);
  }
}

async function handleSubscriptionDisable(event: PaystackWebhookPayload) {
  const { reference } = event.data;

  try {
    const now = new Date().toISOString();
    
    // Find and update subscription
    await db.update(subscriptions)
      .set({
        status: 'canceled',
        canceledAt: now,
        updatedAt: now,
      })
      .where(eq(subscriptions.paystackSubscriptionCode, reference));

    console.log(`🚫 Subscription canceled: ${reference}`);
  } catch (error) {
    console.error('Error handling subscription disable:', error);
  }
}

async function handleInvoicePaymentFailed(event: PaystackWebhookPayload) {
  const { reference, customer } = event.data;

  console.warn(`⚠️ Invoice payment failed for ${customer.email}: ${reference}`);
  // Implement retry logic or user notification here
}
