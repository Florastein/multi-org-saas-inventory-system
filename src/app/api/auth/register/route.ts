import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { 
          error: 'Email is required',
          code: 'MISSING_EMAIL' 
        },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { 
          error: 'Name is required',
          code: 'MISSING_NAME' 
        },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { 
          error: 'Password is required',
          code: 'MISSING_PASSWORD' 
        },
        { status: 400 }
      );
    }

    // Validate email format (basic regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          error: 'Invalid email format',
          code: 'INVALID_EMAIL' 
        },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { 
          error: 'Password must be at least 8 characters long',
          code: 'PASSWORD_TOO_SHORT' 
        },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedName = name.trim();

    // Check if email already exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.email, sanitizedEmail))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { 
          error: 'Email already registered',
          code: 'EMAIL_EXISTS' 
        },
        { status: 400 }
      );
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // Create timestamps
    const now = new Date().toISOString();

    // Insert new user
    const newUser = await db.insert(users)
      .values({
        email: sanitizedEmail,
        name: sanitizedName,
        passwordHash: passwordHash,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    // Return user without passwordHash
    const { passwordHash: _, ...userResponse } = newUser[0];

    return NextResponse.json(userResponse, { status: 201 });

  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error.message 
      },
      { status: 500 }
    );
  }
}