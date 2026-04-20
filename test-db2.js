const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const test = await prisma.test.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  console.log("Latest test CreatorId:", test?.creatorId);
  const user = await prisma.user.findUnique({ where: { id: test?.creatorId } });
  console.log("Creator ID from User:", user?.id);
}
main().catch(console.error).finally(() => prisma.$disconnect());
