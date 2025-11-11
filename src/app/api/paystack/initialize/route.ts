import { NextRequest, NextResponse } from 'next/server';
import { initializeTransaction } from '@/lib/paystack';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { email, amount, planCode, metadata } = await request.json();

    // Validate inputs
    if (!email || !amount) {
      return NextResponse.json(
        { error: 'Email and amount are required' },
        { status: 400 }
      );
    }

    // Amount must be in pesewas (GHS 1.00 = 100 pesewas)
    if (typeof amount !== 'number' || amount < 100) {
      return NextResponse.json(
        { error: 'Amount must be at least 100 pesewas (GHS 1.00)' },
        { status: 400 }
      );
    }

    // Add user ID to metadata
    const enrichedMetadata = {
      ...metadata,
      userId: session.user.id,
      userEmail: session.user.email,
    };

    const response = await initializeTransaction(
      email,
      amount,
      enrichedMetadata,
      planCode
    );

    if (!response.status) {
      return NextResponse.json(
        { error: 'Failed to initialize transaction' },
        { status: 400 }
      );
    }

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Initialize transaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
