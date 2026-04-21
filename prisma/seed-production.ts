import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
})

async function main() {
    const adminPassword = process.env.ADMIN_SEED_PASSWORD

    if (!adminPassword) {
        console.error('ERROR: ADMIN_SEED_PASSWORD environment variable is required')
        console.error('Set it before running: export ADMIN_SEED_PASSWORD="your-secure-password"')
        process.exit(1)
    }

    if (adminPassword.length < 8) {
        console.error('ERROR: Password must be at least 8 characters')
        process.exit(1)
    }

    const hashedPassword = await hash(adminPassword, 12)

    const admin = await prisma.user.upsert({
        where: { email: 'adminsamuel@testwise.com' },
        update: {
            password: hashedPassword,
            role: 'ADMIN',
            name: 'Admin Samuel'
        },
        create: {
            email: 'adminsamuel@testwise.com',
            name: 'Admin Samuel',
            password: hashedPassword,
            role: 'ADMIN',
        },
    })

    console.log('Production Admin created/updated:', admin.email)
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