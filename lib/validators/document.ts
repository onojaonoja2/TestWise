const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

const MAGIC_BYTES: Record<string, Uint8Array[]> = {
  "application/pdf": [new Uint8Array([0x25, 0x50, 0x44, 0x46])],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    new Uint8Array([0x50, 0x4b, 0x03, 0x04]),
  ],
}

export interface ValidationResult {
  valid: boolean
  error?: string
}

export function validateMimeType(mimeType: string): ValidationResult {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: `Unsupported file type: ${mimeType}. Allowed: PDF, DOCX, TXT`,
    }
  }
  return { valid: true }
}

export function validateFileSize(size: number): ValidationResult {
  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    }
  }
  if (size === 0) {
    return { valid: false, error: "File is empty" }
  }
  return { valid: true }
}

export function validateMagicBytes(
  buffer: Buffer,
  mimeType: string
): ValidationResult {
  const magicList = MAGIC_BYTES[mimeType]
  if (!magicList) return { valid: true } // Skip for TXT

  const matches = magicList.some((magic) =>
    magic.every((byte, i) => buffer[i] === byte)
  )

  if (!matches) {
    return {
      valid: false,
      error: "File content does not match its declared type",
    }
  }

  return { valid: true }
}
