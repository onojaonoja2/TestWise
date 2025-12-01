import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

async function main() {
    const tests = await prisma.test.findMany({
        include: {
            creator: true
        }
    })

    let output = 'TEST_ID | TITLE | CREATOR_ID | CREATOR_NAME | PUBLIC | PUBLISHED\n'
    tests.forEach(t => {
        output += `${t.id} | ${t.title} | ${t.creatorId} | ${t.creator?.name} | ${t.visibility} | ${t.published}\n`
    })
    fs.writeFileSync('debug-output.txt', output)
    console.log('Done writing to debug-output.txt')
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
