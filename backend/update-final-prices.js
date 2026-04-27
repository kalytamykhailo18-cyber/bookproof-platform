const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Final MVP pricing from Deborah
  const pricing = [
    { name: 'Starter', credits: 25, usd: 197, brl: 247 },
    { name: 'Basic', credits: 50, usd: 367, brl: 467 },
    { name: 'Growth', credits: 100, usd: 667, brl: 867 },
    { name: 'Professional', credits: 200, usd: 1197, brl: 1597 },
    { name: 'Premium', credits: 500, usd: 2747, brl: 3747 },
  ];
  
  console.log('Updating package prices to FINAL MVP pricing...\n');
  
  for (const pkg of pricing) {
    const tier = await prisma.packageTier.findFirst({
      where: { name: pkg.name, isActive: true }
    });
    
    if (tier) {
      // Update USD base price
      await prisma.packageTier.update({
        where: { id: tier.id },
        data: { 
          basePrice: pkg.usd,
          credits: pkg.credits
        }
      });
      console.log(`✅ ${pkg.name}: ${pkg.credits} credits, $${pkg.usd} USD`);
      
      // Update BRL price
      const brlPrice = await prisma.packageTierPrice.findFirst({
        where: { packageTierId: tier.id, currency: 'BRL' }
      });
      
      if (brlPrice) {
        await prisma.packageTierPrice.update({
          where: { id: brlPrice.id },
          data: { price: pkg.brl }
        });
        console.log(`   BRL: R$ ${pkg.brl}`);
      }
    }
  }
  
  // Mark Growth as most popular
  const growth = await prisma.packageTier.findFirst({
    where: { name: 'Growth', isActive: true }
  });
  
  if (growth) {
    await prisma.packageTier.updateMany({
      where: { isActive: true },
      data: { isPopular: false }
    });
    
    await prisma.packageTier.update({
      where: { id: growth.id },
      data: { isPopular: true }
    });
    console.log('\n✅ Growth marked as Most Popular');
  }
  
  console.log('\nDone!');
  await prisma.$disconnect();
}

main().catch(console.error);
