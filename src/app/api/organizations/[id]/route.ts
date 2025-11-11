import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { organizations, organizationMembers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Validate userId parameter
    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json(
        { error: 'Valid userId is required', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    const organizationId = parseInt(id);
    const userIdInt = parseInt(userId);

    // Check if user is a member of the organization
    const membership = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, userIdInt)
        )
      )
      .limit(1);

    if (membership.length === 0) {
      return NextResponse.json(
        { error: 'Access denied: User is not a member of this organization', code: 'ACCESS_DENIED' },
        { status: 403 }
      );
    }

    // Get organization details
    const organization = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (organization.length === 0) {
      return NextResponse.json(
        { error: 'Organization not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Return organization with user's role
    return NextResponse.json({
      ...organization[0],
      userRole: membership[0].role
    });
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
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Validate userId parameter
    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json(
        { error: 'Valid userId is required', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    const organizationId = parseInt(id);
    const userIdInt = parseInt(userId);

    // Check if user is a member and has required role
    const membership = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, userIdInt)
        )
      )
      .limit(1);

    if (membership.length === 0) {
      return NextResponse.json(
        { error: 'Access denied: User is not a member of this organization', code: 'ACCESS_DENIED' },
        { status: 403 }
      );
    }

    // Verify user has owner or admin role
    const userRole = membership[0].role;
    if (userRole !== 'owner' && userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Permission denied: Only owners and admins can update organizations', code: 'PERMISSION_DENIED' },
        { status: 403 }
      );
    }

    // Check if organization exists
    const existingOrg = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (existingOrg.length === 0) {
      return NextResponse.json(
        { error: 'Organization not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { name, slug } = body;

    // Build update object with only provided fields
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Name must be a non-empty string', code: 'INVALID_NAME' },
          { status: 400 }
        );
      }
      updates.name = name.trim();
    }

    if (slug !== undefined) {
      if (typeof slug !== 'string' || slug.trim().length === 0) {
        return NextResponse.json(
          { error: 'Slug must be a non-empty string', code: 'INVALID_SLUG' },
          { status: 400 }
        );
      }
      updates.slug = slug.trim().toLowerCase();
    }

    // Update organization
    const updated = await db
      .update(organizations)
      .set(updates)
      .where(eq(organizations.id, organizationId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update organization', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0]);
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
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Validate userId parameter
    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json(
        { error: 'Valid userId is required', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    const organizationId = parseInt(id);
    const userIdInt = parseInt(userId);

    // Check if user is a member and has owner role
    const membership = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, userIdInt)
        )
      )
      .limit(1);

    if (membership.length === 0) {
      return NextResponse.json(
        { error: 'Access denied: User is not a member of this organization', code: 'ACCESS_DENIED' },
        { status: 403 }
      );
    }

    // Verify user has owner role (only owners can delete)
    const userRole = membership[0].role;
    if (userRole !== 'owner') {
      return NextResponse.json(
        { error: 'Permission denied: Only owners can delete organizations', code: 'PERMISSION_DENIED' },
        { status: 403 }
      );
    }

    // Check if organization exists
    const existingOrg = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (existingOrg.length === 0) {
      return NextResponse.json(
        { error: 'Organization not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete all organization members first (due to foreign key constraints)
    await db
      .delete(organizationMembers)
      .where(eq(organizationMembers.organizationId, organizationId));

    // Delete the organization
    const deleted = await db
      .delete(organizations)
      .where(eq(organizations.id, organizationId))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete organization', code: 'DELETE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Organization deleted successfully',
      organization: deleted[0]
    });
  } catch (error: any) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}