import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const organizations = sqliteTable('organizations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const organizationMembers = sqliteTable('organization_members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  userId: integer('user_id').notNull().references(() => users.id),
  role: text('role').notNull(),
  createdAt: text('created_at').notNull(),
});

export const inventoryItems = sqliteTable('inventory_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  sku: text('sku').notNull(),
  description: text('description'),
  category: text('category'),
  quantity: integer('quantity').default(0),
  unitPrice: real('unit_price'),
  lowStockThreshold: integer('low_stock_threshold').default(10),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const activityLog = sqliteTable('activity_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  userId: integer('user_id').notNull().references(() => users.id),
  inventoryItemId: integer('inventory_item_id').references(() => inventoryItems.id),
  action: text('action').notNull(),
  description: text('description'),
  createdAt: text('created_at').notNull(),
});import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const organizations = sqliteTable('organizations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const organizationMembers = sqliteTable('organization_members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  userId: integer('user_id').notNull().references(() => users.id),
  role: text('role').notNull(),
  createdAt: text('created_at').notNull(),
});

export const inventoryItems = sqliteTable('inventory_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  sku: text('sku').notNull(),
  description: text('description'),
  category: text('category'),
  quantity: integer('quantity').default(0),
  unitPrice: real('unit_price'),
  lowStockThreshold: integer('low_stock_threshold').default(10),
  location: text('location'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});