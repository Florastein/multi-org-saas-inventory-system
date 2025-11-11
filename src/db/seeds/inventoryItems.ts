import { db } from '@/db';
import { inventoryItems } from '@/db/schema';

async function main() {
    const sampleInventoryItems = [
        {
            organizationId: 1,
            name: 'Laptop Dell XPS 15',
            sku: 'LAP-001',
            description: null,
            category: 'Electronics',
            quantity: 25,
            unitPrice: 1299.99,
            lowStockThreshold: 10,
            location: 'Warehouse A',
            createdAt: new Date('2024-01-16').toISOString(),
            updatedAt: new Date('2024-01-16').toISOString(),
        },
        {
            organizationId: 1,
            name: 'Office Chair Ergonomic',
            sku: 'FUR-001',
            description: null,
            category: 'Furniture',
            quantity: 8,
            unitPrice: 299.99,
            lowStockThreshold: 10,
            location: 'Warehouse B',
            createdAt: new Date('2024-01-16').toISOString(),
            updatedAt: new Date('2024-01-16').toISOString(),
        },
        {
            organizationId: 1,
            name: 'Wireless Mouse Logitech',
            sku: 'ACC-001',
            description: null,
            category: 'Accessories',
            quantity: 150,
            unitPrice: 29.99,
            lowStockThreshold: 10,
            location: 'Warehouse A',
            createdAt: new Date('2024-01-17').toISOString(),
            updatedAt: new Date('2024-01-17').toISOString(),
        },
        {
            organizationId: 1,
            name: 'USB-C Cable',
            sku: 'ACC-002',
            description: null,
            category: 'Accessories',
            quantity: 5,
            unitPrice: 15.99,
            lowStockThreshold: 20,
            location: 'Warehouse A',
            createdAt: new Date('2024-01-17').toISOString(),
            updatedAt: new Date('2024-01-17').toISOString(),
        },
        {
            organizationId: 2,
            name: 'MacBook Pro 16',
            sku: 'MAC-001',
            description: null,
            category: 'Electronics',
            quantity: 15,
            unitPrice: 2499.99,
            lowStockThreshold: 10,
            location: 'Storage Room',
            createdAt: new Date('2024-01-18').toISOString(),
            updatedAt: new Date('2024-01-18').toISOString(),
        },
        {
            organizationId: 2,
            name: 'Standing Desk',
            sku: 'DSK-001',
            description: null,
            category: 'Furniture',
            quantity: 3,
            unitPrice: 599.99,
            lowStockThreshold: 5,
            location: 'Storage Room',
            createdAt: new Date('2024-01-18').toISOString(),
            updatedAt: new Date('2024-01-18').toISOString(),
        },
    ];

    await db.insert(inventoryItems).values(sampleInventoryItems);
    
    console.log('✅ Inventory items seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});