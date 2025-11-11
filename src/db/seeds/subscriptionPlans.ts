import { db } from '@/db';
import { subscriptionPlans } from '@/db/schema';

async function main() {
    const samplePlans = [
        {
            name: 'Starter',
            price: 150.00,
            pricePesewas: 15000,
            interval: 'monthly',
            maxUsers: 5,
            maxOrganizations: 1,
            features: JSON.stringify([
                'Up to 5 users',
                '1 organization',
                'Basic inventory tracking',
                'Activity logs',
                'Email support'
            ]),
            paystackPlanCode: 'PLN_starter_monthly',
            isActive: true,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
            name: 'Professional',
            price: 275.00,
            pricePesewas: 27500,
            interval: 'monthly',
            maxUsers: 15,
            maxOrganizations: 3,
            features: JSON.stringify([
                'Up to 15 users',
                '3 organizations',
                'Advanced inventory tracking',
                'Activity logs',
                'Low stock alerts',
                'Priority email support',
                'Export reports'
            ]),
            paystackPlanCode: 'PLN_professional_monthly',
            isActive: true,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
            name: 'Enterprise',
            price: 400.00,
            pricePesewas: 40000,
            interval: 'monthly',
            maxUsers: 50,
            maxOrganizations: 10,
            features: JSON.stringify([
                'Up to 50 users',
                '10 organizations',
                'Advanced inventory tracking',
                'Activity logs',
                'Low stock alerts',
                'Custom reports',
                'API access',
                'Priority phone & email support',
                'Dedicated account manager'
            ]),
            paystackPlanCode: 'PLN_enterprise_monthly',
            isActive: true,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
        }
    ];

    await db.insert(subscriptionPlans).values(samplePlans);
    
    console.log('✅ Subscription plans seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});