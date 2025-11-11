import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { organizationMembers, users, organizations } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const VALID_ROLES = ['owner', 'admin', 'member', 'viewer'] as const;

async function validateRequestUser(organizationId: number, requestUserId: number, requiredRoles?: string[]) {
  const membership = await db.select()
    .from(organizationMembers)
    .where(and(
      eq(organizationMembers.organizationId, organizationId),
      eq(organizationMembers.userId, requestUserId)
    ))
    .limit(1);

  if (membership.length === 0) {
    return { valid: false, membership: null };
  }

  if (requiredRoles && !requiredRoles.includes(membership[0].role)) {
    return { valid: false, membership: membership[0], insufficientPermissions: true };
  }

  return { valid: true, membership: membership[0] };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = parseInt(params.id);
    if (!organizationId || isNaN(organizationId)) {
      return NextResponse.json({ 
        error: "Valid organization ID is required",
        code: "INVALID_ORGANIZATION_ID" 
      }, { status: 400 });
    }

    const searchParams = request.nextUrl.searchParams;
    const requestUserId = searchParams.get('requestUserId');

    if (!requestUserId) {
      return NextResponse.json({ 
        error: "requestUserId is required",
        code: "MISSING_REQUEST_USER_ID" 
      }, { status: 400 });
    }

    const requestUserIdInt = parseInt(requestUserId);
    if (isNaN(requestUserIdInt)) {
      return NextResponse.json({ 
        error: "Valid requestUserId is required",
        code: "INVALID_REQUEST_USER_ID" 
      }, { status: 400 });
    }

    const orgExists = await db.select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (orgExists.length === 0) {
      return NextResponse.json({ 
        error: "Organization not found",
        code: "ORGANIZATION_NOT_FOUND" 
      }, { status: 404 });
    }

    const validation = await validateRequestUser(organizationId, requestUserIdInt);
    if (!validation.valid) {
      return NextResponse.json({ 
        error: "You must be a member of this organization to view members",
        code: "PERMISSION_DENIED" 
      }, { status: 403 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const members = await db.select({
      id: organizationMembers.id,
      userId: organizationMembers.userId,
      role: organizationMembers.role,
      createdAt: organizationMembers.createdAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email
      }
    })
      .from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.userId, users.id))
      .where(eq(organizationMembers.organizationId, organizationId))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(members, { status: 200 });

  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = parseInt(params.id);
    if (!organizationId || isNaN(organizationId)) {
      return NextResponse.json({ 
        error: "Valid organization ID is required",
        code: "INVALID_ORGANIZATION_ID" 
      }, { status: 400 });
    }

    const searchParams = request.nextUrl.searchParams;
    const requestUserId = searchParams.get('requestUserId');

    if (!requestUserId) {
      return NextResponse.json({ 
        error: "requestUserId is required",
        code: "MISSING_REQUEST_USER_ID" 
      }, { status: 400 });
    }

    const requestUserIdInt = parseInt(requestUserId);
    if (isNaN(requestUserIdInt)) {
      return NextResponse.json({ 
        error: "Valid requestUserId is required",
        code: "INVALID_REQUEST_USER_ID" 
      }, { status: 400 });
    }

    const orgExists = await db.select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (orgExists.length === 0) {
      return NextResponse.json({ 
        error: "Organization not found",
        code: "ORGANIZATION_NOT_FOUND" 
      }, { status: 404 });
    }

    const validation = await validateRequestUser(organizationId, requestUserIdInt, ['owner', 'admin']);
    if (!validation.valid) {
      if (validation.insufficientPermissions) {
        return NextResponse.json({ 
          error: "Only owners and admins can add members",
          code: "INSUFFICIENT_PERMISSIONS" 
        }, { status: 403 });
      }
      return NextResponse.json({ 
        error: "You must be an owner or admin of this organization to add members",
        code: "PERMISSION_DENIED" 
      }, { status: 403 });
    }

    const body = await request.json();
    const { userId, role } = body;

    if (!userId) {
      return NextResponse.json({ 
        error: "userId is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    if (!role) {
      return NextResponse.json({ 
        error: "role is required",
        code: "MISSING_ROLE" 
      }, { status: 400 });
    }

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ 
        error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`,
        code: "INVALID_ROLE" 
      }, { status: 400 });
    }

    const userIdInt = parseInt(userId);
    if (isNaN(userIdInt)) {
      return NextResponse.json({ 
        error: "Valid userId is required",
        code: "INVALID_USER_ID" 
      }, { status: 400 });
    }

    const userExists = await db.select()
      .from(users)
      .where(eq(users.id, userIdInt))
      .limit(1);

    if (userExists.length === 0) {
      return NextResponse.json({ 
        error: "User not found",
        code: "USER_NOT_FOUND" 
      }, { status: 400 });
    }

    const existingMembership = await db.select()
      .from(organizationMembers)
      .where(and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.userId, userIdInt)
      ))
      .limit(1);

    if (existingMembership.length > 0) {
      return NextResponse.json({ 
        error: "User is already a member of this organization",
        code: "DUPLICATE_MEMBERSHIP" 
      }, { status: 400 });
    }

    const newMember = await db.insert(organizationMembers)
      .values({
        organizationId,
        userId: userIdInt,
        role,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newMember[0], { status: 201 });

  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}