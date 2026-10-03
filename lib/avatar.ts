import { randomUUID } from "crypto"

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024 // 2MB
export const AVATAR_ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"] as const
export const AVATAR_ALLOWED_EXT: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}

export function validateAvatarFile(mime: string, size: number): string | null {
    if (!(AVATAR_ALLOWED_MIME as readonly string[]).includes(mime)) {
        return "Only JPG, PNG or WebP images are allowed"
    }
    if (size <= 0) return "Empty file"
    if (size > AVATAR_MAX_BYTES) return "Image must be under 2MB"
    return null
}

export function buildAvatarKey(userId: string, mime: string): string {
    const ext = AVATAR_ALLOWED_EXT[mime] ?? "jpg"
    return `avatars/${userId}/${randomUUID()}.${ext}`
}

export function getS3PublicUrl(key: string): string {
    const base =
        process.env.S3_PUBLIC_URL ||
        (process.env.S3_BUCKET_NAME && process.env.AWS_REGION
            ? `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`
            : "")
    if (!base) return key
    return `${base.replace(/\/$/, "")}/${key}`
}

export function avatarKeyFromUrl(image: string | null | undefined): string | null {
    if (!image) return null
    // Stored values may be a full URL or a raw key.
    // Only treat S3-hosted avatar keys as deletable.
    try {
        if (image.startsWith("http")) {
            const url = new URL(image)
            const key = url.pathname.replace(/^\//, "")
            return key.startsWith("avatars/") ? key : null
        }
    } catch {
        return null
    }
    return image.startsWith("avatars/") ? image : null
}
