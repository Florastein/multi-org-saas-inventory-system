import { NextRequest } from 'next/server';

export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: number;
  name: string;
  slug: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  const userId = request.cookies.get('userId')?.value;
  
  if (!userId) {
    return null;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/me?userId=${userId}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}
