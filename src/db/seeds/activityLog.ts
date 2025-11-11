import { db } from '@/db';
import { activityLog } from '@/db/schema';

async function main() {
    const sampleActivityLogs = [
        // ACME CORP - January activities
        {
            organizationId: 1,
            userId: 1,
            inventoryItemId: 1,
            action: 'created',
            description: 'Initial inventory item created',
            createdAt: new Date('2024-01-16T09:15:00').toISOString(),
        },
        {
            organizationId: 1,
            userId: 1,
            inventoryItemId: 2,
            action: 'created',
            description: 'Initial inventory item created',
            createdAt: new Date('2024-01-16T09:30:00').toISOString(),
        },
        {
            organizationId: 1,
            userId: 3,
            inventoryItemId: 3,
            action: 'created',
            description: 'Initial inventory item created',
            createdAt: new Date('2024-01-18T10:20:00').toISOString(),
        },
        {
            organizationId: 1,
            userId: 3,
            inventoryItemId: 4,
            action: 'created',
            description: 'Initial inventory item created',
            createdAt: new Date('2024-01-18T11:00:00').toISOString(),
        },
        {
            organizationId: 1,
            userId: 1,
            inventoryItemId: 1,
            action: 'stock_adjusted',
            description: 'Stock adjusted: added 50 units',
            createdAt: new Date('2024-01-22T14:30:00').toISOString(),
        },
        {
            organizationId: 1,
            userId: 3,
            inventoryItemId: 2,
            action: 'stock_adjusted',
            description: 'Stock adjusted: added 30 units',
            createdAt: new Date('2024-01-25T10:15:00').toISOString(),
        },
        // ACME CORP - February activities
        {
            organizationId: 1,
            userId: 1,
            inventoryItemId: 1,
            action: 'updated',
            description: 'Price updated from $999.99 to $949.99',
            createdAt: new Date('2024-02-05T09:45:00').toISOString(),
        },
        {
            organizationId: 1,
            userId: 3,
            inventoryItemId: 3,
            action: 'stock_adjusted',
            description: 'Stock adjusted: added 100 units',
            createdAt: new Date('2024-02-08T11:20:00').toISOString(),
        },
        {
            organizationId: 1,
            userId: 1,
            inventoryItemId: 2,
            action: 'updated',
            description: 'Updated low stock threshold from 10 to 15',
            createdAt: new Date('2024-02-12T13:30:00').toISOString(),
        },
        {
            organizationId: 1,
            userId: 3,
            inventoryItemId: 1,
            action: 'stock_adjusted',
            description: 'Stock adjusted: removed 10 units for order fulfillment',
            createdAt: new Date('2024-02-15T16:00:00').toISOString(),
        },
        {
            organizationId: 1,
            userId: 1,
            inventoryItemId: 4,
            action: 'updated',
            description: 'Updated item details and pricing',
            createdAt: new Date('2024-02-18T10:30:00').toISOString(),
        },
        {
            organizationId: 1,
            userId: 3,
            inventoryItemId: 2,
            action: 'updated',
            description: 'Item location changed to Warehouse B',
            createdAt: new Date('2024-02-22T14:15:00').toISOString(),
        },
        // TECHSTART INC - February activities
        {
            organizationId: 2,
            userId: 3,
            inventoryItemId: 5,
            action: 'created',
            description: 'Initial inventory item created',
            createdAt: new Date('2024-02-01T09:00:00').toISOString(),
        },
        {
            organizationId: 2,
            userId: 3,
            inventoryItemId: 6,
            action: 'created',
            description: 'Initial inventory item created',
            createdAt: new Date('2024-02-01T09:30:00').toISOString(),
        },
        {
            organizationId: 2,
            userId: 3,
            inventoryItemId: 5,
            action: 'stock_adjusted',
            description: 'Stock adjusted: added 5 units',
            createdAt: new Date('2024-02-10T11:00:00').toISOString(),
        },
        {
            organizationId: 2,
            userId: 3,
            inventoryItemId: 6,
            action: 'updated',
            description: 'Updated item description',
            createdAt: new Date('2024-02-15T13:45:00').toISOString(),
        },
        // ACME CORP - March activities (recent)
        {
            organizationId: 1,
            userId: 3,
            inventoryItemId: 3,
            action: 'stock_adjusted',
            description: 'Stock adjusted: removed 25 units for order fulfillment',
            createdAt: new Date('2024-03-01T09:30:00').toISOString(),
        },
        {
            organizationId: 1,
            userId: 1,
            inventoryItemId: 1,
            action: 'updated',
            description: 'Updated item details and pricing',
            createdAt: new Date('2024-03-03T10:15:00').toISOString(),
        },
        {
            organizationId: 1,
            userId: 3,
            inventoryItemId: 4,
            action: 'stock_adjusted',
            description: 'Stock adjusted: added 200 units',
            createdAt: new Date('2024-03-05T14:20:00').toISOString(),
        },
        {
            organizationId: 1,
            userId: 1,
            inventoryItemId: 2,
            action: 'stock_adjusted',
            description: 'Stock adjusted: removed 5 units for office relocation',
            createdAt: new Date('2024-03-07T11:00:00').toISOString(),
        },
        // TECHSTART INC - March activities (recent)
        {
            organizationId: 2,
            userId: 3,
            inventoryItemId: 5,
            action: 'updated',
            description: 'Price adjustment applied',
            createdAt: new Date('2024-03-02T10:30:00').toISOString(),
        },
        {
            organizationId: 2,
            userId: 3,
            inventoryItemId: 6,
            action: 'stock_adjusted',
            description: 'Stock adjusted: added 3 units',
            createdAt: new Date('2024-03-05T15:00:00').toISOString(),
        },
        // ACME CORP - Most recent activities
        {
            organizationId: 1,
            userId: 3,
            inventoryItemId: 1,
            action: 'updated',
            description: 'Updated low stock threshold from 15 to 20',
            createdAt: new Date('2024-03-08T09:00:00').toISOString(),
        },
        {
            organizationId: 1,
            userId: 1,
            inventoryItemId: 3,
            action: 'updated',
            description: 'Price updated from $29.99 to $24.99',
            createdAt: new Date('2024-03-09T13:45:00').toISOString(),
        },
        {
            organizationId: 1,
            userId: 3,
            inventoryItemId: 2,
            action: 'stock_adjusted',
            description: 'Stock adjusted: added 15 units',
            createdAt: new Date('2024-03-10T10:30:00').toISOString(),
        },
    ];

    await db.insert(activityLog).values(sampleActivityLogs);
    
    console.log('✅ Activity log seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});