import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { subscriptions, subscriptionPlans } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const { planId, paystackSubscriptionCode, paystackCustomerCode, paystackAuthorizationCode } = body;

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    // Validate planId is required
    if (!planId || typeof planId !== 'number') {
      return NextResponse.json(
        {
          error: 'Valid planId is required',
          code: 'MISSING_PLAN_ID',
        },
        { status: 400 }
      );
    }

    // Validate plan exists and is active
    const plan = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId))
      .limit(1);

    if (plan.length === 0) {
      return NextResponse.json(
        {
          error: 'Subscription plan not found',
          code: 'PLAN_NOT_FOUND',
        },
        { status: 400 }
      );
    }

    if (!plan[0].isActive) {
      return NextResponse.json(
        {
          error: 'Subscription plan is not active',
          code: 'PLAN_NOT_ACTIVE',
        },
        { status: 400 }
      );
    }

    // Check if user already has an active subscription
    const existingSubscription = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, 'active')
        )
      )
      .limit(1);

    if (existingSubscription.length > 0) {
      return NextResponse.json(
        {
          error: 'User already has an active subscription',
          code: 'ACTIVE_SUBSCRIPTION_EXISTS',
        },
        { status: 400 }
      );
    }

    // Calculate period dates
    const currentPeriodStart = new Date().toISOString();
    const currentPeriodEndDate = new Date();
    
    // Add 30 days for monthly interval
    if (plan[0].interval === 'monthly') {
      currentPeriodEndDate.setDate(currentPeriodEndDate.getDate() + 30);
    } else if (plan[0].interval === 'yearly') {
      currentPeriodEndDate.setFullYear(currentPeriodEndDate.getFullYear() + 1);
    } else {
      // Default to 30 days
      currentPeriodEndDate.setDate(currentPeriodEndDate.getDate() + 30);
    }
    
    const currentPeriodEnd = currentPeriodEndDate.toISOString();

    // Create new subscription
    const now = new Date().toISOString();
    const newSubscription = await db
      .insert(subscriptions)
      .values({
        userId,
        planId,
        status: 'active',
        paystackSubscriptionCode: paystackSubscriptionCode || null,
        paystackCustomerCode: paystackCustomerCode || null,
        paystackAuthorizationCode: paystackAuthorizationCode || null,
        currentPeriodStart,
        currentPeriodEnd,
        canceledAt: null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newSubscription[0], { status: 201 });
  } catch (error) {
    console.error('POST subscription error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}