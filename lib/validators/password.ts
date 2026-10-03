export const MIN_PASSWORD_LENGTH = 8

export function validatePassword(password: string): string | null {
    if (!password || password.length < MIN_PASSWORD_LENGTH) {
        return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
    }
    if (!/[A-Z]/.test(password)) {
        return "Password must contain at least one uppercase letter"
    }
    if (!/[a-z]/.test(password)) {
        return "Password must contain at least one lowercase letter"
    }
    if (!/\d/.test(password)) {
        return "Password must contain at least one number"
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return "Password must contain at least one special character"
    }
    return null
}

export function passwordStrength(password: string): { score: number; label: string } {
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++
    const normalized = Math.min(4, Math.floor((score / 5) * 4))
    const labels = ["Weak", "Fair", "Good", "Strong", "Excellent"]
    return { score: normalized, label: labels[normalized] ?? "Weak" }
}
