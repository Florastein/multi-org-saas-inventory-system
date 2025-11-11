import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth, adminDb } from './firebase-admin';
import type { User, Organization } from './firebase-types';

// Verify session from cookies
export const verifySession = cache(async () => {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('__session')?.value;

  if (!authCookie) {
    return null;
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(authCookie);
    return decodedToken;
  } catch (error) {
    console.error('Session verification failed:', error);
    return null;
  }
});

// Get authenticated user
export const getAuthenticatedUser = cache(async () => {
  const token = await verifySession();
  
  if (!token) {
    redirect('/login');
  }

  try {
    const userDoc = await adminDb.collection('users').doc(token.uid).get();
    if (!userDoc.exists) {
      redirect('/register');
    }
    return { id: userDoc.id, ...userDoc.data() } as User;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    redirect('/login');
  }
});

// Get user's organization
export const getUserOrganization = cache(async () => {
  const user = await getAuthenticatedUser();
  
  try {
    const orgDoc = await adminDb
      .collection('organizations')
      .doc(user.organizationId)
      .get();
    
    if (!orgDoc.exists) {
      throw new Error('Organization not found');
    }
    
    return { id: orgDoc.id, ...orgDoc.data() } as Organization;
  } catch (error) {
    console.error('Failed to fetch organization:', error);
    throw error;
  }
});

// Verify user has access to organization
export const verifyOrgAccess = cache(async (orgId: string) => {
  const user = await getAuthenticatedUser();
  
  if (user.organizationId !== orgId) {
    throw new Error('Unauthorized: Access denied to this organization');
  }
  
  return true;
});
