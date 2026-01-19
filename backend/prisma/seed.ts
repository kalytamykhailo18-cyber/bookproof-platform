import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create package tiers
  const packageTiers = [
    {
      name: 'Starter',
      credits: 25,
      basePrice: 49.99,
      currency: 'USD',
      validityDays: 30,
      description: 'Perfect for testing the waters with your first book',
      displayOrder: 1,
      features: JSON.stringify([
        '25 verified reviews',
        '30 days to activate',
        '~5 reviews per week',
        '20% overbooking buffer included',
      ]),
    },
    {
      name: 'Professional',
      credits: 50,
      basePrice: 89.99,
      currency: 'USD',
      validityDays: 30, // Up to 200 credits = 30 days
      description: 'Ideal for authors launching a new book',
      displayOrder: 2,
      features: JSON.stringify([
        '50 verified reviews',
        '30 days to activate',
        '~10 reviews per week',
        '20% overbooking buffer included',
        'Priority support',
      ]),
    },
    {
      name: 'Growth',
      credits: 100,
      basePrice: 159.99,
      currency: 'USD',
      validityDays: 30, // Up to 200 credits = 30 days
      description: 'Great for building momentum and visibility',
      displayOrder: 3,
      features: JSON.stringify([
        '100 verified reviews',
        '30 days to activate',
        '~20 reviews per week',
        '20% overbooking buffer included',
        'Priority support',
        'Dedicated account manager',
      ]),
    },
    {
      name: 'Bestseller',
      credits: 200,
      basePrice: 299.99,
      currency: 'USD',
      validityDays: 30, // Up to 200 credits = 30 days
      description: 'Maximum impact for serious authors',
      displayOrder: 4,
      features: JSON.stringify([
        '200 verified reviews',
        '30 days to activate',
        'Flexible weekly distribution',
        '20% overbooking buffer included',
        'Priority support',
        'Dedicated account manager',
        'Amazon ranking optimization tips',
      ]),
    },
    {
      name: 'Enterprise',
      credits: 500,
      basePrice: 649.99,
      currency: 'USD',
      validityDays: 90, // 201-500 credits = 90 days
      description: 'For publishers and high-volume authors',
      displayOrder: 5,
      features: JSON.stringify([
        '500 verified reviews',
        '90 days to activate',
        'Fully customizable distribution',
        '20% overbooking buffer included',
        '24/7 priority support',
        'Dedicated account manager',
        'Amazon ranking optimization tips',
        'Multi-book campaign planning',
      ]),
    },
    {
      name: 'Ultimate',
      credits: 1000,
      basePrice: 1199.99,
      currency: 'USD',
      validityDays: 120,
      description: 'Ultimate package for maximum reach',
      displayOrder: 6,
      features: JSON.stringify([
        '1000 verified reviews',
        '120 days to activate',
        'Fully customizable distribution',
        '20% overbooking buffer included',
        '24/7 VIP support',
        'Dedicated account manager',
        'Amazon ranking optimization tips',
        'Multi-book campaign planning',
        'Quarterly strategy sessions',
      ]),
    },
  ];

  for (const tier of packageTiers) {
    const created = await prisma.packageTier.upsert({
      where: { credits: tier.credits },
      update: tier,
      create: tier,
    });
    console.log(`✓ Created/Updated package tier: ${created.name} (${created.credits} credits)`);
  }

  console.log('\n✨ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
