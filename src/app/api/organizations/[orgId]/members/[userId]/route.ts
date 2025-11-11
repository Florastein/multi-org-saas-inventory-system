import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { organizationMembers } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

const VALID_ROLES = ['owner', 'admin', 'member', 'viewer'] as const;

async function getRequestUserRole(orgId: number, requestUserId: number) {
  const requestUserMembership = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, orgId),
        eq(organizationMembers.userId, requestUserId)
      )
    )
    .limit(1);

  return requestUserMembership.length > 0 ? requestUserMembership[0] : null;
}

async function countOwnersInOrganization(orgId: number) {
  const owners = await db
    .select({ count: sql<number>`count(*)` })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, orgId),
        eq(organizationMembers.role, 'owner')
      )
    );

  return owners[0]?.count || 0;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; userId: string }> }
) {
  try {
    const { orgId, userId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const requestUserId = searchParams.get('requestUserId');

    if (!orgId || isNaN(parseInt(orgId))) {
      return NextResponse.json(
        { error: 'Valid organization ID is required', code: 'INVALID_ORG_ID' },
        { status: 400 }
      );
    }

    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json(
        { error: 'Valid user ID is required', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    if (!requestUserId || isNaN(parseInt(requestUserId))) {
      return NextResponse.json(
        { error: 'Valid request user ID is required', code: 'INVALID_REQUEST_USER_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json(
        { error: 'Role is required', code: 'MISSING_ROLE' },
        { status: 400 }
      );
    }

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json(
        {
          error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`,
          code: 'INVALID_ROLE'
        },
        { status: 400 }
      );
    }

    const orgIdNum = parseInt(orgId);
    const userIdNum = parseInt(userId);
    const requestUserIdNum = parseInt(requestUserId);

    const requestUserMembership = await getRequestUserRole(orgIdNum, requestUserIdNum);

    if (!requestUserMembership) {
      return NextResponse.json(
        { error: 'Request user is not a member of this organization', code: 'NOT_MEMBER' },
        { status: 403 }
      );
    }

    if (requestUserMembership.role !== 'owner' && requestUserMembership.role !== 'admin') {
      return NextResponse.json(
        { error: 'Permission denied. Only owners and admins can update member roles', code: 'PERMISSION_DENIED' },
        { status: 403 }
      );
    }

    const existingMember = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, orgIdNum),
          eq(organizationMembers.userId, userIdNum)
        )
      )
      .limit(1);

    if (existingMember.length === 0) {
      return NextResponse.json(
        { error: 'Member not found in this organization', code: 'MEMBER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const currentMember = existingMember[0];

    if (currentMember.role === 'owner' && role !== 'owner') {
      const ownerCount = await countOwnersInOrganization(orgIdNum);

      if (ownerCount <= 1) {
        return NextResponse.json(
          {
            error: 'Cannot remove the last owner from the organization',
            code: 'LAST_OWNER_PROTECTION'
          },
          { status: 400 }
        );
      }
    }

    const updated = await db
      .update(organizationMembers)
      .set({ role })
      .where(
        and(
          eq(organizationMembers.organizationId, orgIdNum),
          eq(organizationMembers.userId, userIdNum)
        )
      )
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update member role', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; userId: string }> }
) {
  try {
    const { orgId, userId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const requestUserId = searchParams.get('requestUserId');

    if (!orgId || isNaN(parseInt(orgId))) {
      return NextResponse.json(
        { error: 'Valid organization ID is required', code: 'INVALID_ORG_ID' },
        { status: 400 }
      );
    }

    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json(
        { error: 'Valid user ID is required', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    if (!requestUserId || isNaN(parseInt(requestUserId))) {
      return NextResponse.json(
        { error: 'Valid request user ID is required', code: 'INVALID_REQUEST_USER_ID' },
        { status: 400 }
      );
    }

    const orgIdNum = parseInt(orgId);
    const userIdNum = parseInt(userId);
    const requestUserIdNum = parseInt(requestUserId);

    const requestUserMembership = await getRequestUserRole(orgIdNum, requestUserIdNum);

    if (!requestUserMembership) {
      return NextResponse.json(
        { error: 'Request user is not a member of this organization', code: 'NOT_MEMBER' },
        { status: 403 }
      );
    }

    if (requestUserMembership.role !== 'owner' && requestUserMembership.role !== 'admin') {
      return NextResponse.json(
        { error: 'Permission denied. Only owners and admins can remove members', code: 'PERMISSION_DENIED' },
        { status: 403 }
      );
    }

    const existingMember = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, orgIdNum),
          eq(organizationMembers.userId, userIdNum)
        )
      )
      .limit(1);

    if (existingMember.length === 0) {
      return NextResponse.json(
        { error: 'Member not found in this organization', code: 'MEMBER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const memberToDelete = existingMember[0];

    if (memberToDelete.role === 'owner') {
      const ownerCount = await countOwnersInOrganization(orgIdNum);

      if (ownerCount <= 1) {
        return NextResponse.json(
          {
            error: 'Cannot remove the last owner from the organization',
            code: 'LAST_OWNER_PROTECTION'
          },
          { status: 400 }
        );
      }
    }

    const deleted = await db
      .delete(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, orgIdNum),
          eq(organizationMembers.userId, userIdNum)
        )
      )
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Failed to remove member', code: 'DELETE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Member successfully removed from organization',
        deletedMember: deleted[0]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}