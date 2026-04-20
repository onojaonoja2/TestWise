const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const test = await prisma.test.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  console.log("Latest test:", test?.id, "visibility:", test?.visibility, "published:", test?.published);
}
main().catch(console.error).finally(() => prisma.$disconnect());
