import { randomBytes, createHash, timingSafeEqual } from "crypto"
import { prisma } from "@/lib/prisma"

export const RESET_TOKEN_BYTES = 32
export const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000 // 1 hour

export function generateResetToken(): { token: string; tokenHash: string } {
    const token = randomBytes(RESET_TOKEN_BYTES).toString("hex")
    const tokenHash = hashResetToken(token)
    return { token, tokenHash }
}

export function hashResetToken(token: string): string {
    return createHash("sha256").update(token).digest("hex")
}

export async function createPasswordResetToken(userId: string) {
    // Invalidate older unused tokens for this user (keep table tidy)
    await prisma.passwordResetToken.updateMany({
        where: { userId, usedAt: null },
        data: { usedAt: new Date() },
    })

    const { token, tokenHash } = generateResetToken()
    await prisma.passwordResetToken.create({
        data: {
            userId,
            tokenHash,
            expiresAt: new Date(Date.now() + RESET_TOKEN_EXPIRY_MS),
        },
    })
    return token
}

export async function verifyPasswordResetToken(token: string) {
    const tokenHash = hashResetToken(token)
    const record = await prisma.passwordResetToken.findUnique({
        where: { tokenHash },
        include: { user: true },
    })
    if (!record) return null
    if (record.usedAt) return null
    if (record.expiresAt.getTime() < Date.now()) return null

    // constant-time compare on hashes
    const a = Buffer.from(record.tokenHash, "hex")
    const b = Buffer.from(tokenHash, "hex")
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null

    return record
}

export async function consumePasswordResetToken(id: string) {
    await prisma.passwordResetToken.update({
        where: { id },
        data: { usedAt: new Date() },
    })
}
