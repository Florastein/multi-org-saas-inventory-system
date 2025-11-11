import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcrypt';

async function main() {
    const passwordHash = await bcrypt.hash('password123', 10);
    
    const sampleUsers = [
        {
            email: 'admin@acme.com',
            name: 'Admin User',
            passwordHash: passwordHash,
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            email: 'manager@acme.com',
            name: 'Manager User',
            passwordHash: passwordHash,
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString(),
        },
        {
            email: 'user@techstart.com',
            name: 'TechStart User',
            passwordHash: passwordHash,
            createdAt: new Date('2024-02-01').toISOString(),
            updatedAt: new Date('2024-02-01').toISOString(),
        },
        {
            email: 'owner@global.com',
            name: 'Global Owner',
            passwordHash: passwordHash,
            createdAt: new Date('2024-02-10').toISOString(),
            updatedAt: new Date('2024-02-10').toISOString(),
        },
        {
            email: 'viewer@global.com',
            name: 'Global Viewer',
            passwordHash: passwordHash,
            createdAt: new Date('2024-02-15').toISOString(),
            updatedAt: new Date('2024-02-15').toISOString(),
        }
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});