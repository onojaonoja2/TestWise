import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { uploadToS3, deleteFromS3 } from "@/lib/s3"
import { validateAvatarFile, buildAvatarKey, getS3PublicUrl, avatarKeyFromUrl } from "@/lib/avatar"

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
        const form = await req.formData()
        const file = form.get("file")

        if (!file || typeof file === "string") {
            return NextResponse.json({ message: "No image file provided" }, { status: 400 })
        }

        const mime = file.type
        const size = file.size
        const validationError = validateAvatarFile(mime, size)
        if (validationError) {
            return NextResponse.json({ message: validationError }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        // Minimal magic-byte check for common types
        if (mime === "image/png" && !(buffer[0] === 0x89 && buffer[1] === 0x50)) {
            return NextResponse.json({ message: "Invalid image file" }, { status: 400 })
        }
        if (mime === "image/jpeg" && !(buffer[0] === 0xff && buffer[1] === 0xd8)) {
            return NextResponse.json({ message: "Invalid image file" }, { status: 400 })
        }

        const key = buildAvatarKey(session.user.id, mime)
        await uploadToS3(key, buffer, mime)
        const publicUrl = getS3PublicUrl(key)

        const current = await prisma.user.findUnique({ where: { id: session.user.id }, select: { image: true } })
        const updated = await prisma.user.update({
            where: { id: session.user.id },
            data: { image: publicUrl },
            select: { id: true, image: true, name: true, email: true },
        })

        // Best-effort cleanup of previous avatar (don't block response on failure)
        const oldKey = avatarKeyFromUrl(current?.image)
        if (oldKey && oldKey !== key) {
            deleteFromS3(oldKey).catch((e) => console.warn("[AVATAR_CLEANUP]", e))
        }

        return NextResponse.json({ image: updated.image, user: updated })
    } catch (error) {
        console.error("[AVATAR_UPLOAD]", error)
        const message = error instanceof Error && /must be set|AWS_/i.test(error.message)
            ? "Avatar storage is not configured (S3 env missing)"
            : "Failed to upload avatar"
        return NextResponse.json({ message }, { status: 500 })
    }
}

export async function DELETE() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const current = await prisma.user.findUnique({ where: { id: session.user.id }, select: { image: true } })
    await prisma.user.update({ where: { id: session.user.id }, data: { image: null } })

    const oldKey = avatarKeyFromUrl(current?.image)
    if (oldKey) {
        try {
            await deleteFromS3(oldKey)
        } catch (e) {
            console.warn("[AVATAR_DELETE]", e)
        }
    }
    return NextResponse.json({ image: null })
}
