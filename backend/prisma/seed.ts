import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create package tiers
  // Per Milestone 3.1 requirements:
  // - Starter: 50 credits, $49, 30-day validity
  // - Growth: 150 credits, $99, 90-day validity
  // - Professional: 300 credits, $179, 120-day validity
  // - Enterprise: 500+ credits, custom (via Closer panel)
  const packageTiers = [
    {
      name: 'Starter',
      credits: 50,
      basePrice: 49.00,
      currency: 'USD',
      validityDays: 30,
      description: 'Perfect for testing the waters with your first book',
      displayOrder: 1,
      isPopular: false,
      features: JSON.stringify([
        '50 verified reviews',
        '30 days to activate',
        '~8-10 reviews per week',
        '20% overbooking buffer included',
        'Email support',
      ]),
    },
    {
      name: 'Growth',
      credits: 150,
      basePrice: 99.00,
      currency: 'USD',
      validityDays: 90,
      description: 'Ideal for authors launching a new book',
      displayOrder: 2,
      isPopular: true, // Mark as recommended package
      features: JSON.stringify([
        '150 verified reviews',
        '90 days to activate',
        '~20-25 reviews per week',
        '20% overbooking buffer included',
        'Priority support',
        'Dedicated account manager',
      ]),
    },
    {
      name: 'Professional',
      credits: 300,
      basePrice: 179.00,
      currency: 'USD',
      validityDays: 120,
      description: 'Great for building momentum and visibility',
      displayOrder: 3,
      isPopular: false,
      features: JSON.stringify([
        '300 verified reviews',
        '120 days to activate',
        '~20-25 reviews per week',
        '20% overbooking buffer included',
        'Priority support',
        'Dedicated account manager',
        'Amazon ranking optimization tips',
      ]),
    },
    {
      name: 'Enterprise',
      credits: 500,
      basePrice: 299.00,
      currency: 'USD',
      validityDays: 120,
      description: 'For publishers and high-volume authors (Custom packages available via sales)',
      displayOrder: 4,
      isPopular: false,
      features: JSON.stringify([
        '500 verified reviews',
        '120 days to activate',
        'Fully customizable distribution',
        '20% overbooking buffer included',
        '24/7 priority support',
        'Dedicated account manager',
        'Amazon ranking optimization tips',
        'Multi-book campaign planning',
        'Contact sales for custom packages',
      ]),
    },
  ];

  for (const tier of packageTiers) {
    const created = await prisma.packageTier.upsert({
      where: { credits: tier.credits },
      update: tier,
      create: tier,
    });
    console.log(`✓ Created/Updated package tier: ${created.name} (${created.credits} credits, $${tier.basePrice})`);
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
