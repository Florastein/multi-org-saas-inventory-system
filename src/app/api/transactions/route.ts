import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { transactions } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    // Pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Status filter
    const statusFilter = searchParams.get('status');

    // Build query
    let query = db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, session.user.id))
      .orderBy(desc(transactions.createdAt))
      .limit(limit)
      .offset(offset);

    // Add status filter if provided
    if (statusFilter) {
      query = db
        .select()
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, session.user.id),
            eq(transactions.status, statusFilter)
          )
        )
        .orderBy(desc(transactions.createdAt))
        .limit(limit)
        .offset(offset);
    }

    const results = await query;

    // Parse metadata field as JSON
    const parsedResults = results.map((transaction) => {
      let parsedMetadata = null;
      
      if (transaction.metadata) {
        try {
          parsedMetadata = JSON.parse(transaction.metadata);
        } catch (error) {
          console.error('Failed to parse metadata for transaction:', transaction.id, error);
          parsedMetadata = transaction.metadata;
        }
      }

      return {
        ...transaction,
        metadata: parsedMetadata,
      };
    });

    return NextResponse.json(parsedResults, { status: 200 });
  } catch (error) {
    console.error('GET transactions error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}