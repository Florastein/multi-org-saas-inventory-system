import { db } from '@/db';
import { organizations } from '@/db/schema';

async function main() {
    const sampleOrganizations = [
        {
            name: 'Acme Corp',
            slug: 'acme-corp',
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            name: 'TechStart Inc',
            slug: 'techstart-inc',
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString(),
        },
        {
            name: 'Global Retail',
            slug: 'global-retail',
            createdAt: new Date('2024-02-01').toISOString(),
            updatedAt: new Date('2024-02-01').toISOString(),
        }
    ];

    await db.insert(organizations).values(sampleOrganizations);
    
    console.log('✅ Organizations seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});