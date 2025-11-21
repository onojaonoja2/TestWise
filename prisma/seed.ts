import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Admin User
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            password: 'password123', // In a real app, hash this!
            role: 'ADMIN',
        },
    })

    // Teacher User
    const teacher = await prisma.user.upsert({
        where: { email: 'teacher@example.com' },
        update: {},
        create: {
            email: 'teacher@example.com',
            name: 'Teacher User',
            password: 'password123',
            role: 'TEACHER',
        },
    })

    // Student User
    const student = await prisma.user.upsert({
        where: { email: 'student@example.com' },
        update: {},
        create: {
            email: 'student@example.com',
            name: 'Student User',
            password: 'password123',
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
