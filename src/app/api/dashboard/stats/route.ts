import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { inventoryItems, activityLog, organizationMembers, users, organizations } from '@/db/schema';
import { eq, and, lte, desc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const organizationId = searchParams.get('organizationId');

    // Validate required parameters
    if (!userId || !organizationId) {
      return NextResponse.json({ 
        error: 'userId and organizationId are required',
        code: 'MISSING_REQUIRED_PARAMETERS' 
      }, { status: 400 });
    }

    // Validate parameters are valid integers
    const userIdInt = parseInt(userId);
    const organizationIdInt = parseInt(organizationId);

    if (isNaN(userIdInt) || isNaN(organizationIdInt)) {
      return NextResponse.json({ 
        error: 'userId and organizationId must be valid integers',
        code: 'INVALID_PARAMETERS' 
      }, { status: 400 });
    }

    // Check if organization exists
    const organization = await db.select()
      .from(organizations)
      .where(eq(organizations.id, organizationIdInt))
      .limit(1);

    if (organization.length === 0) {
      return NextResponse.json({ 
        error: 'Organization not found',
        code: 'ORGANIZATION_NOT_FOUND' 
      }, { status: 404 });
    }

    // Verify user is a member of the organization
    const membership = await db.select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.userId, userIdInt),
          eq(organizationMembers.organizationId, organizationIdInt)
        )
      )
      .limit(1);

    if (membership.length === 0) {
      return NextResponse.json({ 
        error: 'User is not a member of this organization',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }

    // 1. Calculate total items count
    const totalItemsResult = await db.select({ 
      count: sql<number>`count(*)` 
    })
      .from(inventoryItems)
      .where(eq(inventoryItems.organizationId, organizationIdInt));

    const totalItems = Number(totalItemsResult[0]?.count || 0);

    // 2. Calculate total value (sum of quantity * unitPrice)
    const totalValueResult = await db.select({ 
      total: sql<number>`COALESCE(sum(${inventoryItems.quantity} * ${inventoryItems.unitPrice}), 0)` 
    })
      .from(inventoryItems)
      .where(eq(inventoryItems.organizationId, organizationIdInt));

    const totalValue = Number(totalValueResult[0]?.total || 0);

    // 3. Calculate low stock count
    const lowStockCountResult = await db.select({ 
      count: sql<number>`count(*)` 
    })
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.organizationId, organizationIdInt),
          sql`${inventoryItems.quantity} <= ${inventoryItems.lowStockThreshold}`
        )
      );

    const lowStockCount = Number(lowStockCountResult[0]?.count || 0);

    // 4. Get low stock items (limit 10)
    const lowStockItems = await db.select({
      id: inventoryItems.id,
      name: inventoryItems.name,
      sku: inventoryItems.sku,
      quantity: inventoryItems.quantity,
      lowStockThreshold: inventoryItems.lowStockThreshold
    })
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.organizationId, organizationIdInt),
          sql`${inventoryItems.quantity} <= ${inventoryItems.lowStockThreshold}`
        )
      )
      .orderBy(sql`${inventoryItems.quantity} / NULLIF(${inventoryItems.lowStockThreshold}, 0)`)
      .limit(10);

    // 5. Get recent activity (last 10 entries with user and item info)
    const recentActivityRaw = await db.select({
      id: activityLog.id,
      action: activityLog.action,
      description: activityLog.description,
      createdAt: activityLog.createdAt,
      userName: users.name,
      userEmail: users.email,
      itemName: inventoryItems.name,
      itemSku: inventoryItems.sku
    })
      .from(activityLog)
      .innerJoin(users, eq(activityLog.userId, users.id))
      .leftJoin(inventoryItems, eq(activityLog.inventoryItemId, inventoryItems.id))
      .where(eq(activityLog.organizationId, organizationIdInt))
      .orderBy(desc(activityLog.createdAt))
      .limit(10);

    const recentActivity = recentActivityRaw.map(activity => ({
      id: activity.id,
      action: activity.action,
      description: activity.description,
      createdAt: activity.createdAt,
      user: {
        name: activity.userName,
        email: activity.userEmail
      },
      inventoryItem: activity.itemName && activity.itemSku ? {
        name: activity.itemName,
        sku: activity.itemSku
      } : null
    }));

    // 6. Get category counts
    const categoryCounts = await db.select({
      category: sql<string>`COALESCE(${inventoryItems.category}, 'Uncategorized')`,
      count: sql<number>`count(*)`
    })
      .from(inventoryItems)
      .where(eq(inventoryItems.organizationId, organizationIdInt))
      .groupBy(inventoryItems.category);

    const formattedCategoryCounts = categoryCounts.map(cat => ({
      category: cat.category,
      count: Number(cat.count)
    }));

    // 7. Calculate total distinct locations
    const totalLocationsResult = await db.select({ 
      count: sql<number>`count(distinct ${inventoryItems.location})` 
    })
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.organizationId, organizationIdInt),
          sql`${inventoryItems.location} IS NOT NULL`
        )
      );

    const totalLocations = Number(totalLocationsResult[0]?.count || 0);

    return NextResponse.json({
      totalItems,
      totalValue,
      lowStockCount,
      lowStockItems,
      recentActivity,
      categoryCounts: formattedCategoryCounts,
      totalLocations
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}