import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { randomBytes } from 'crypto'

const prisma = new PrismaClient()

function generateSecurePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    return randomBytes(16).toString('hex')
        .split('')
        .map(c => chars[Math.floor(Math.random() * chars.length)])
        .join('')
        .slice(0, 16) + 'A1!'
}

async function main() {
    const password = await hash(generateSecurePassword(), 12)

    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {
            password
        },
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            password,
            role: 'ADMIN',
        },
    })

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
    console.log('Note: Passwords are randomly generated. Reset them after first login.')
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
