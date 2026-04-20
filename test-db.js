const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const test = await prisma.test.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  console.log("Latest test ID:", test?.id);
  
  if (test) {
    const res = await fetch(`http://localhost:3000/api/tests/${test.id}`);
    console.log("Status:", res.status);
    if (res.status === 500) {
      console.log(await res.text());
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
