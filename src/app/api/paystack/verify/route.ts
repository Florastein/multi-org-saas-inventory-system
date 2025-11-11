import { NextRequest, NextResponse } from 'next/server';
import { verifyTransaction } from '@/lib/paystack';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { transactions } from '@/db/schema';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const reference = request.nextUrl.searchParams.get('reference');

    if (!reference) {
      return NextResponse.json(
        { error: 'Reference is required' },
        { status: 400 }
      );
    }

    const response = await verifyTransaction(reference);

    if (!response.status) {
      return NextResponse.json(
        { error: 'Transaction verification failed' },
        { status: 400 }
      );
    }

    const { data } = response;
    
    // Store transaction in database
    const now = new Date().toISOString();
    await db.insert(transactions).values({
      userId: session.user.id,
      subscriptionId: null,
      reference: data.reference,
      amount: data.amount,
      amountGhs: data.amount / 100,
      status: data.status,
      paymentMethod: data.channel,
      metadata: JSON.stringify(data.metadata || {}),
      createdAt: now,
      updatedAt: now,
    }).onConflictDoUpdate({
      target: transactions.reference,
      set: {
        status: data.status,
        paymentMethod: data.channel,
        metadata: JSON.stringify(data.metadata || {}),
        updatedAt: now,
      },
    });

    return NextResponse.json({
      status: true,
      message: 'Transaction verified',
      data: {
        reference: data.reference,
        amount: data.amount,
        amountGhs: data.amount / 100,
        status: data.status,
        customer: data.customer.email,
        paidAt: data.paid_at,
        authorization: data.authorization,
      },
    });
  } catch (error) {
    console.error('Verify transaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
