import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { subscriptions, subscriptionPlans } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user session
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    // Query active subscription with plan details
    const result = await db
      .select({
        id: subscriptions.id,
        userId: subscriptions.userId,
        status: subscriptions.status,
        paystackSubscriptionCode: subscriptions.paystackSubscriptionCode,
        paystackCustomerCode: subscriptions.paystackCustomerCode,
        paystackAuthorizationCode: subscriptions.paystackAuthorizationCode,
        currentPeriodStart: subscriptions.currentPeriodStart,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        canceledAt: subscriptions.canceledAt,
        createdAt: subscriptions.createdAt,
        updatedAt: subscriptions.updatedAt,
        plan: {
          id: subscriptionPlans.id,
          name: subscriptionPlans.name,
          price: subscriptionPlans.price,
          pricePesewas: subscriptionPlans.pricePesewas,
          interval: subscriptionPlans.interval,
          maxUsers: subscriptionPlans.maxUsers,
          maxOrganizations: subscriptionPlans.maxOrganizations,
          features: subscriptionPlans.features,
          paystackPlanCode: subscriptionPlans.paystackPlanCode,
          isActive: subscriptionPlans.isActive,
        }
      })
      .from(subscriptions)
      .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(
        and(
          eq(subscriptions.userId, session.user.id),
          eq(subscriptions.status, 'active')
        )
      )
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ 
        error: 'No active subscription found',
        code: 'NO_ACTIVE_SUBSCRIPTION' 
      }, { status: 404 });
    }

    const subscription = result[0];

    // Parse features JSON field
    let parsedFeatures: string[] = [];
    if (subscription.plan.features) {
      try {
        parsedFeatures = JSON.parse(subscription.plan.features);
      } catch (error) {
        console.error('Failed to parse features JSON:', error);
        parsedFeatures = [];
      }
    }

    // Format response
    const response = {
      id: subscription.id,
      userId: subscription.userId,
      status: subscription.status,
      paystackSubscriptionCode: subscription.paystackSubscriptionCode,
      paystackCustomerCode: subscription.paystackCustomerCode,
      paystackAuthorizationCode: subscription.paystackAuthorizationCode,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      canceledAt: subscription.canceledAt,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
      plan: {
        id: subscription.plan.id,
        name: subscription.plan.name,
        price: subscription.plan.price,
        pricePesewas: subscription.plan.pricePesewas,
        interval: subscription.plan.interval,
        maxUsers: subscription.plan.maxUsers,
        maxOrganizations: subscription.plan.maxOrganizations,
        features: parsedFeatures,
        paystackPlanCode: subscription.plan.paystackPlanCode,
        isActive: subscription.plan.isActive,
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('GET subscription error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}