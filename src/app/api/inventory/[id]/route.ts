import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { inventoryItems, organizationMembers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

async function validateUserAccess(userId: string, itemId: number, requiredRoles?: string[]) {
  if (!userId || isNaN(parseInt(userId))) {
    return { error: 'Valid user ID is required', status: 400 };
  }

  const item = await db.select()
    .from(inventoryItems)
    .where(eq(inventoryItems.id, itemId))
    .limit(1);

  if (item.length === 0) {
    return { error: 'Inventory item not found', status: 404 };
  }

  const membership = await db.select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, item[0].organizationId),
        eq(organizationMembers.userId, parseInt(userId))
      )
    )
    .limit(1);

  if (membership.length === 0) {
    return { error: 'Access denied: You are not a member of this organization', status: 403 };
  }

  if (requiredRoles && !requiredRoles.includes(membership[0].role)) {
    return { error: 'Access denied: Insufficient permissions', status: 403 };
  }

  return { item: item[0], membership: membership[0] };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    const validation = await validateUserAccess(userId, parseInt(id));

    if ('error' in validation) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      );
    }

    return NextResponse.json(validation.item, { status: 200 });
  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    const validation = await validateUserAccess(
      userId,
      parseInt(id),
      ['owner', 'admin', 'member']
    );

    if ('error' in validation) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      );
    }

    const body = await request.json();
    const {
      name,
      sku,
      description,
      category,
      quantity,
      unitPrice,
      lowStockThreshold
    } = body;

    const updates: any = {};

    if (name !== undefined) updates.name = name.trim();
    if (sku !== undefined) {
      const trimmedSku = sku.trim();
      
      const existingSku = await db.select()
        .from(inventoryItems)
        .where(
          and(
            eq(inventoryItems.organizationId, validation.item.organizationId),
            eq(inventoryItems.sku, trimmedSku)
          )
        )
        .limit(1);

      if (existingSku.length > 0 && existingSku[0].id !== parseInt(id)) {
        return NextResponse.json(
          { error: 'SKU already exists in this organization', code: 'SKU_CONFLICT' },
          { status: 400 }
        );
      }
      
      updates.sku = trimmedSku;
    }
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (quantity !== undefined) {
      if (typeof quantity !== 'number' || quantity < 0) {
        return NextResponse.json(
          { error: 'Quantity must be a non-negative number', code: 'INVALID_QUANTITY' },
          { status: 400 }
        );
      }
      updates.quantity = quantity;
    }
    if (unitPrice !== undefined) {
      if (typeof unitPrice !== 'number' || unitPrice < 0) {
        return NextResponse.json(
          { error: 'Unit price must be a non-negative number', code: 'INVALID_UNIT_PRICE' },
          { status: 400 }
        );
      }
      updates.unitPrice = unitPrice;
    }
    if (lowStockThreshold !== undefined) {
      if (typeof lowStockThreshold !== 'number' || lowStockThreshold < 0) {
        return NextResponse.json(
          { error: 'Low stock threshold must be a non-negative number', code: 'INVALID_THRESHOLD' },
          { status: 400 }
        );
      }
      updates.lowStockThreshold = lowStockThreshold;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided for update', code: 'NO_UPDATES' },
        { status: 400 }
      );
    }

    updates.updatedAt = new Date().toISOString();

    const updated = await db.update(inventoryItems)
      .set(updates)
      .where(eq(inventoryItems.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update inventory item' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    const validation = await validateUserAccess(
      userId,
      parseInt(id),
      ['owner', 'admin', 'member']
    );

    if ('error' in validation) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      );
    }

    const deleted = await db.delete(inventoryItems)
      .where(eq(inventoryItems.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete inventory item' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Inventory item deleted successfully',
        deletedItem: deleted[0]
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}