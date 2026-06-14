const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
})

const sendApprovalEmail = async (toEmail, userName) => {
  await transporter.sendMail({
    from: `"DocuSense" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'Votre compte DocuSense a été approuvé !',
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #F8FAFF; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0C447C, #185FA5); padding: 32px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 800;">
            Docu<span style="color: #F39C12;">Sense</span>
          </h1>
        </div>
        <div style="padding: 36px 32px; background: #fff;">
          <h2 style="color: #0C2340; font-size: 20px; margin-top: 0;">Bonjour ${userName} 👋</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.7;">
            Votre demande d'inscription sur <strong>DocuSense</strong> a été <strong style="color: #27AE60;">approuvée</strong> par un administrateur.
          </p>
          <div style="background: #F0FFF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 18px 20px; margin: 24px 0; color: #166534; font-size: 14px;">
            ✅ Votre compte est maintenant actif. Vous pouvez vous connecter dès maintenant.
          </div>
          <div style="text-align: center; margin-top: 28px;">
            <a href="${process.env.FRONTEND_URL || 'https://docusense.vercel.app'}/login"
              style="display: inline-block; background: linear-gradient(135deg, #185FA5, #378ADD); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 15px; font-weight: 700;">
              Se connecter
            </a>
          </div>
        </div>
        <div style="padding: 20px 32px; text-align: center; color: #94A3B8; font-size: 12px;">
          DocuSense © 2026 — Plateforme de documentation intelligente
        </div>
      </div>
    `,
  })
}

module.exports = { sendApprovalEmail }
