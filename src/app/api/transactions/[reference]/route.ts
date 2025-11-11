import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { transactions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { reference: string } }
) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { reference } = params;

    // Validate reference parameter
    if (!reference) {
      return NextResponse.json(
        { error: 'Transaction reference is required', code: 'MISSING_REFERENCE' },
        { status: 400 }
      );
    }

    // Query transaction by reference AND userId
    const result = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.reference, reference),
          eq(transactions.userId, session.user.id)
        )
      )
      .limit(1);

    // Check if transaction exists and belongs to authenticated user
    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Transaction not found', code: 'TRANSACTION_NOT_FOUND' },
        { status: 404 }
      );
    }

    const transaction = result[0];

    // Parse metadata field as JSON
    let parsedMetadata = null;
    if (transaction.metadata) {
      try {
        parsedMetadata = JSON.parse(transaction.metadata);
      } catch (error) {
        console.error('Error parsing transaction metadata:', error);
        parsedMetadata = transaction.metadata;
      }
    }

    // Return transaction with parsed metadata
    return NextResponse.json({
      id: transaction.id,
      userId: transaction.userId,
      subscriptionId: transaction.subscriptionId,
      reference: transaction.reference,
      amount: transaction.amount,
      amountGhs: transaction.amountGhs,
      status: transaction.status,
      paymentMethod: transaction.paymentMethod,
      metadata: parsedMetadata,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    });
  } catch (error) {
    console.error('GET transaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}