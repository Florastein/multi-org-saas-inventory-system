import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { activityLog, organizationMembers, users, inventoryItems, organizations } from '@/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract required parameters
    const userIdParam = searchParams.get('userId');
    const organizationIdParam = searchParams.get('organizationId');
    
    // Validate required parameters
    if (!userIdParam) {
      return NextResponse.json(
        { error: 'User ID is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }
    
    if (!organizationIdParam) {
      return NextResponse.json(
        { error: 'Organization ID is required', code: 'MISSING_ORGANIZATION_ID' },
        { status: 400 }
      );
    }
    
    // Validate IDs are valid integers
    const userId = parseInt(userIdParam);
    const organizationId = parseInt(organizationIdParam);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Valid User ID is required', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }
    
    if (isNaN(organizationId)) {
      return NextResponse.json(
        { error: 'Valid Organization ID is required', code: 'INVALID_ORGANIZATION_ID' },
        { status: 400 }
      );
    }
    
    // Verify organization exists
    const orgCheck = await db.select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);
    
    if (orgCheck.length === 0) {
      return NextResponse.json(
        { error: 'Organization not found', code: 'ORGANIZATION_NOT_FOUND' },
        { status: 404 }
      );
    }
    
    // Verify user is a member of the organization
    const memberCheck = await db.select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.userId, userId),
          eq(organizationMembers.organizationId, organizationId)
        )
      )
      .limit(1);
    
    if (memberCheck.length === 0) {
      return NextResponse.json(
        { error: 'User is not a member of this organization', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }
    
    // Extract optional parameters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const action = searchParams.get('action');
    const inventoryItemIdParam = searchParams.get('inventoryItemId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Build WHERE conditions
    const conditions = [eq(activityLog.organizationId, organizationId)];
    
    if (action) {
      conditions.push(eq(activityLog.action, action));
    }
    
    if (inventoryItemIdParam) {
      const inventoryItemId = parseInt(inventoryItemIdParam);
      if (!isNaN(inventoryItemId)) {
        conditions.push(eq(activityLog.inventoryItemId, inventoryItemId));
      }
    }
    
    if (startDate) {
      conditions.push(gte(activityLog.createdAt, startDate));
    }
    
    if (endDate) {
      conditions.push(lte(activityLog.createdAt, endDate));
    }
    
    // Execute query with joins
    const results = await db.select({
      id: activityLog.id,
      organizationId: activityLog.organizationId,
      action: activityLog.action,
      description: activityLog.description,
      createdAt: activityLog.createdAt,
      userId: activityLog.userId,
      inventoryItemId: activityLog.inventoryItemId,
      userName: users.name,
      userEmail: users.email,
      itemName: inventoryItems.name,
      itemSku: inventoryItems.sku,
    })
      .from(activityLog)
      .leftJoin(users, eq(activityLog.userId, users.id))
      .leftJoin(inventoryItems, eq(activityLog.inventoryItemId, inventoryItems.id))
      .where(and(...conditions))
      .orderBy(desc(activityLog.createdAt))
      .limit(limit)
      .offset(offset);
    
    // Format response
    const formattedResults = results.map(row => ({
      id: row.id,
      organizationId: row.organizationId,
      action: row.action,
      description: row.description,
      createdAt: row.createdAt,
      user: {
        id: row.userId,
        name: row.userName ?? '',
        email: row.userEmail ?? '',
      },
      inventoryItem: row.inventoryItemId ? {
        id: row.inventoryItemId,
        name: row.itemName ?? '',
        sku: row.itemSku ?? '',
      } : null,
    }));
    
    return NextResponse.json(formattedResults, { status: 200 });
    
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}