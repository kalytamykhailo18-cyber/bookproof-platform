const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const enterprise = await prisma.packageTier.findFirst({
    where: { name: 'Enterprise', isActive: true }
  });
  
  if (enterprise) {
    console.log('Enterprise package:');
    console.log(`  Credits: ${enterprise.credits}`);
    console.log(`  Base Price: $${enterprise.basePrice}`);
    console.log(`  Description: ${enterprise.description}`);
  }
  
  await prisma.$disconnect();
}

check();
