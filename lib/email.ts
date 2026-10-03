import { Resend } from "resend"

let resendClient: Resend | null = null

function getResend(): Resend | null {
    const key = process.env.RESEND_API_KEY
    if (!key) return null
    if (!resendClient) resendClient = new Resend(key)
    return resendClient
}

function getAppUrl(): string {
    return (
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.NEXTAUTH_URL ||
        "http://localhost:3000"
    ).replace(/\/$/, "")
}

export function isEmailConfigured(): boolean {
    return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM)
}

export async function sendPasswordResetEmail(to: string, token: string, name?: string | null) {
    const resetUrl = `${getAppUrl()}/auth/reset-password/${token}`
    const from = process.env.EMAIL_FROM!

    const html = `
    <div style="font-family:Inter,Arial,sans-serif;background:#FAF7F1;padding:32px;color:#1C1917">
      <div style="max-width:560px;margin:0 auto;background:#FFFDF9;border:1px solid rgba(28,25,23,0.1);border-radius:20px;padding:32px">
        <div style="display:inline-block;background:#C2410C;color:#fff;font-weight:800;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;padding:6px 12px;border-radius:999px">TestWise</div>
        <h1 style="font-size:24px;margin:16px 0 8px">Reset your password</h1>
        <p style="color:#57534E;font-size:15px;line-height:1.6">Hi ${name ? escapeHtml(name) : "there"}, we received a request to reset your TestWise password. This link expires in 1 hour and can only be used once.</p>
        <a href="${resetUrl}" style="display:inline-block;margin:20px 0;background:#1C1917;color:#FFF7ED;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:999px">Reset password</a>
        <p style="color:#78716C;font-size:13px;line-height:1.6">If the button doesn't work, copy this URL:<br/><span style="color:#9A3412">${resetUrl}</span></p>
        <p style="color:#A8A29E;font-size:12px;margin-top:24px">Didn't request this? You can safely ignore this email.</p>
      </div>
    </div>`

    const resend = getResend()
    if (!resend) throw new Error("Email not configured: missing RESEND_API_KEY")
    await resend.emails.send({
        from,
        to,
        subject: "Reset your TestWise password",
        html,
    })
}

function escapeHtml(s: string) {
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!))
}
