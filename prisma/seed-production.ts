import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
})

async function main() {
    const password = await hash('Smoot784!38BD', 12)

    // Specific Admin User for Production
    const admin = await prisma.user.upsert({
        where: { email: 'adminsamuel@testwise.com' },
        update: {
            password, // Ensure password is correct
            role: 'ADMIN', // Ensure role is ADMIN
            name: 'Admin Samuel' // Set a default name
        },
        create: {
            email: 'adminsamuel@testwise.com',
            name: 'Admin Samuel',
            password,
            role: 'ADMIN',
        },
    })

    console.log('Production Admin created:', admin)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
