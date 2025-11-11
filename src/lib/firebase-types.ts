import { Timestamp } from 'firebase/firestore';

export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  organizationId: string;
  role: 'owner' | 'admin' | 'member';
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface InventoryItem {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  sku: string;
  quantity: number;
  lowStockThreshold: number;
  location: string;
  category: string;
  price: number;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface Activity {
  id: string;
  organizationId: string;
  userId: string;
  action: string;
  description: string;
  inventoryItemId: string | null;
  createdAt: Timestamp | Date;
}

export type WithId<T> = T & { id: string };
