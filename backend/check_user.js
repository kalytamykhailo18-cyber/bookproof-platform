const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'deborahdecarvalholirio27@gmail.com' },
    select: {
      email: true,
      name: true,
      preferredLanguage: true,
      preferredCurrency: true,
      role: true
    }
  });
  console.log('User data:', JSON.stringify(user, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
