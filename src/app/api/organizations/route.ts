import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { organizations, organizationMembers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json(
        { error: 'Valid userId is required', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, slug } = body;

    // Validate required fields
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required and must be a string', code: 'INVALID_NAME' },
        { status: 400 }
      );
    }

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { error: 'Slug is required and must be a string', code: 'INVALID_SLUG' },
        { status: 400 }
      );
    }

    // Validate name length
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters long', code: 'NAME_TOO_SHORT' },
        { status: 400 }
      );
    }

    // Validate slug format (lowercase, URL-friendly)
    const trimmedSlug = slug.trim().toLowerCase();
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(trimmedSlug)) {
      return NextResponse.json(
        {
          error: 'Slug must be lowercase and URL-friendly (only lowercase letters, numbers, and hyphens)',
          code: 'INVALID_SLUG_FORMAT',
        },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingOrg = await db
      .select()
      .from(organizations)
      .where(eq(organizations.slug, trimmedSlug))
      .limit(1);

    if (existingOrg.length > 0) {
      return NextResponse.json(
        { error: 'An organization with this slug already exists', code: 'SLUG_EXISTS' },
        { status: 400 }
      );
    }

    // Create organization
    const timestamp = new Date().toISOString();
    const newOrganization = await db
      .insert(organizations)
      .values({
        name: trimmedName,
        slug: trimmedSlug,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .returning();

    if (newOrganization.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create organization', code: 'CREATION_FAILED' },
        { status: 500 }
      );
    }

    // Add creating user as owner in organization_members
    await db.insert(organizationMembers).values({
      organizationId: newOrganization[0].id,
      userId: parseInt(userId),
      role: 'owner',
      createdAt: timestamp,
    });

    return NextResponse.json(newOrganization[0], { status: 201 });
  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json(
        { error: 'Valid userId is required', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Query organizations where the user is a member
    const results = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
        createdAt: organizations.createdAt,
        updatedAt: organizations.updatedAt,
        role: organizationMembers.role,
      })
      .from(organizations)
      .innerJoin(
        organizationMembers,
        eq(organizations.id, organizationMembers.organizationId)
      )
      .where(eq(organizationMembers.userId, parseInt(userId)))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}