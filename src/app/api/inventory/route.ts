import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { inventoryItems, organizationMembers } from '@/db/schema';
import { eq, and, or, like, lte, desc, asc } from 'drizzle-orm';

async function validateOrganizationMember(userId: string, organizationId: string) {
  const userIdInt = parseInt(userId);
  const organizationIdInt = parseInt(organizationId);

  if (isNaN(userIdInt) || isNaN(organizationIdInt)) {
    return { valid: false, status: 400, error: 'Invalid userId or organizationId' };
  }

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
    return { valid: false, status: 403, error: 'User is not a member of this organization' };
  }

  return { valid: true, role: membership[0].role, userId: userIdInt, organizationId: organizationIdInt };
}

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const organizationId = searchParams.get('organizationId');

    if (!userId || !organizationId) {
      return NextResponse.json({
        error: 'userId and organizationId query parameters are required',
        code: 'MISSING_REQUIRED_PARAMS'
      }, { status: 400 });
    }

    const memberValidation = await validateOrganizationMember(userId, organizationId);
    if (!memberValidation.valid) {
      return NextResponse.json({
        error: memberValidation.error,
        code: 'PERMISSION_DENIED'
      }, { status: memberValidation.status });
    }

    if (memberValidation.role === 'viewer') {
      return NextResponse.json({
        error: 'Viewers do not have permission to create inventory items',
        code: 'INSUFFICIENT_PERMISSIONS'
      }, { status: 403 });
    }

    const body = await request.json();
    const { name, sku, description, category, quantity, unitPrice, lowStockThreshold } = body;

    if (!name || !sku) {
      return NextResponse.json({
        error: 'name and sku are required fields',
        code: 'MISSING_REQUIRED_FIELDS'
      }, { status: 400 });
    }

    if (typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({
        error: 'name must be a non-empty string',
        code: 'INVALID_NAME'
      }, { status: 400 });
    }

    if (typeof sku !== 'string' || sku.trim() === '') {
      return NextResponse.json({
        error: 'sku must be a non-empty string',
        code: 'INVALID_SKU'
      }, { status: 400 });
    }

    const existingSku = await db.select()
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.organizationId, memberValidation.organizationId),
          eq(inventoryItems.sku, sku.trim())
        )
      )
      .limit(1);

    if (existingSku.length > 0) {
      return NextResponse.json({
        error: 'SKU already exists in this organization',
        code: 'DUPLICATE_SKU'
      }, { status: 400 });
    }

    const now = new Date().toISOString();

    const newItem = await db.insert(inventoryItems)
      .values({
        organizationId: memberValidation.organizationId,
        name: name.trim(),
        sku: sku.trim(),
        description: description ? description.trim() : null,
        category: category ? category.trim() : null,
        quantity: quantity !== undefined ? parseInt(quantity) : 0,
        unitPrice: unitPrice !== undefined ? parseFloat(unitPrice) : null,
        lowStockThreshold: lowStockThreshold !== undefined ? parseInt(lowStockThreshold) : 10,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return NextResponse.json(newItem[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const organizationId = searchParams.get('organizationId');

    if (!userId || !organizationId) {
      return NextResponse.json({
        error: 'userId and organizationId query parameters are required',
        code: 'MISSING_REQUIRED_PARAMS'
      }, { status: 400 });
    }

    const memberValidation = await validateOrganizationMember(userId, organizationId);
    if (!memberValidation.valid) {
      return NextResponse.json({
        error: memberValidation.error,
        code: 'PERMISSION_DENIED'
      }, { status: memberValidation.status });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const lowStock = searchParams.get('lowStock');
    const sortField = searchParams.get('sort') || 'createdAt';
    const sortOrder = searchParams.get('order') || 'desc';

    let conditions = [eq(inventoryItems.organizationId, memberValidation.organizationId)];

    if (search) {
      conditions.push(
        or(
          like(inventoryItems.name, `%${search}%`),
          like(inventoryItems.sku, `%${search}%`),
          like(inventoryItems.category, `%${search}%`)
        )!
      );
    }

    if (category) {
      conditions.push(eq(inventoryItems.category, category));
    }

    if (lowStock === 'true') {
      conditions.push(lte(inventoryItems.quantity, inventoryItems.lowStockThreshold));
    }

    let query = db.select()
      .from(inventoryItems)
      .where(and(...conditions));

    let sortColumn;
    switch (sortField) {
      case 'name':
        sortColumn = inventoryItems.name;
        break;
      case 'quantity':
        sortColumn = inventoryItems.quantity;
        break;
      case 'unitPrice':
        sortColumn = inventoryItems.unitPrice;
        break;
      default:
        sortColumn = inventoryItems.createdAt;
    }

    if (sortOrder === 'asc') {
      query = query.orderBy(asc(sortColumn));
    } else {
      query = query.orderBy(desc(sortColumn));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}