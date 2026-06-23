import nodemailer from "nodemailer"

// Transport SMTP universel. Par défaut : Mailhog (boîte locale, sans auth).
// Pour de vrais envois (Gmail/Resend), il suffit de renseigner SMTP_HOST/PORT/
// USER/PASS dans .env — aucun changement de code.
const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "localhost",
  port: Number(process.env.SMTP_PORT ?? 1025),
  secure: false, // Mailhog: aucun TLS ; Gmail:587 = STARTTLS auto
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
})

const FROM = process.env.SMTP_FROM ?? "FutureKawa <no-reply@futurekawa.local>"
const APP_URL = process.env.APP_PUBLIC_URL ?? "http://localhost:3000"

// Envoie l'email de vérification contenant le lien d'activation du compte.
export async function sendVerificationEmail(to: string, token: string) {
  const link = `${APP_URL}/verify?token=${encodeURIComponent(token)}`

  await transport.sendMail({
    from: FROM,
    to,
    subject: "Vérifiez votre compte FutureKawa",
    text:
      `Bienvenue sur FutureKawa !\n\n` +
      `Confirmez votre adresse email en ouvrant ce lien :\n${link}\n\n` +
      `Ce lien expire dans 24 heures.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
        <h2>Bienvenue sur FutureKawa</h2>
        <p>Confirmez votre adresse email pour activer votre compte.</p>
        <p style="margin:24px 0">
          <a href="${link}"
             style="background:#18181b;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">
            Vérifier mon email
          </a>
        </p>
        <p style="color:#71717a;font-size:13px">
          Ou copiez ce lien : <br>${link}<br><br>
          Ce lien expire dans 24 heures.
        </p>
      </div>`,
  })
}
