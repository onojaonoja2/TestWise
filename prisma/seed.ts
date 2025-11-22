import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const password = await hash('password123', 12)

    // Admin User
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {
            password // Update password if user exists
        },
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            password,
            role: 'ADMIN',
        },
    })

    // Teacher User
    const teacher = await prisma.user.upsert({
        where: { email: 'teacher@example.com' },
        update: {
            password
        },
        create: {
            email: 'teacher@example.com',
            name: 'Teacher User',
            password,
            role: 'TEACHER',
        },
    })

    // Student User
    const student = await prisma.user.upsert({
        where: { email: 'student@example.com' },
        update: {
            password
        },
        create: {
            email: 'student@example.com',
            name: 'Student User',
            password,
            role: 'STUDENT',
        },
    })

    console.log({ admin, teacher, student })
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
