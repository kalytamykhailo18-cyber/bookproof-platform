const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const correctPrices = {
    'Starter': 147,
    'Growth': 297,
    'Professional': 497
  };
  
  for (const [name, price] of Object.entries(correctPrices)) {
    const tier = await prisma.packageTier.findFirst({
      where: { name, isActive: true }
    });
    
    if (tier) {
      const existingPrice = await prisma.packageTierPrice.findFirst({
        where: { packageTierId: tier.id, currency: 'BRL' }
      });
      
      if (existingPrice) {
        await prisma.packageTierPrice.update({
          where: { id: existingPrice.id },
          data: { price }
        });
        console.log(`✅ ${name}: R$ ${price}`);
      }
    }
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
