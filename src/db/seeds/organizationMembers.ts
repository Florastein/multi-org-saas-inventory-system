import { db } from '@/db';
import { organizationMembers } from '@/db/schema';

async function main() {
    const sampleOrganizationMembers = [
        {
            organizationId: 1,
            userId: 1,
            role: 'owner',
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            organizationId: 1,
            userId: 2,
            role: 'admin',
            createdAt: new Date('2024-01-16').toISOString(),
        },
        {
            organizationId: 2,
            userId: 3,
            role: 'owner',
            createdAt: new Date('2024-01-20').toISOString(),
        },
        {
            organizationId: 3,
            userId: 4,
            role: 'owner',
            createdAt: new Date('2024-02-01').toISOString(),
        },
        {
            organizationId: 3,
            userId: 5,
            role: 'viewer',
            createdAt: new Date('2024-02-02').toISOString(),
        },
        {
            organizationId: 1,
            userId: 3,
            role: 'member',
            createdAt: new Date('2024-02-05').toISOString(),
        },
        {
            organizationId: 2,
            userId: 1,
            role: 'admin',
            createdAt: new Date('2024-02-10').toISOString(),
        },
    ];

    await db.insert(organizationMembers).values(sampleOrganizationMembers);
    
    console.log('✅ Organization members seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});