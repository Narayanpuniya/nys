import "server-only";
import nodemailer from "nodemailer";

/**
 * Gmail SMTP से email भेजें।
 *
 * Hostinger Environment Variables में set करें:
 *   GMAIL_USER         = naraynjat.njnj@gmail.com
 *   GMAIL_APP_PASSWORD = (Gmail App Password — 16 अक्षर)
 */

function createTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("GMAIL_USER और GMAIL_APP_PASSWORD environment variables set नहीं हैं।");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function sendOtpEmail(otp: string): Promise<void> {
  const to = process.env.GMAIL_USER!;

  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"NYS Website" <${process.env.GMAIL_USER}>`,
    to,
    subject: "🔐 NYS Emergency Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
        <div style="text-align:center; margin-bottom: 24px;">
          <h1 style="color: #1a1a2e; font-size: 22px; margin: 0;">🔐 NYS Emergency Reset</h1>
          <p style="color: #6b7280; margin-top: 6px; font-size: 14px;">Super Admin पासवर्ड reset OTP</p>
        </div>

        <div style="background: white; border: 2px solid #e5e7eb; border-radius: 10px; padding: 28px; text-align: center;">
          <p style="color: #374151; margin: 0 0 16px; font-size: 15px;">आपका One-Time Password (OTP):</p>
          <div style="font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #1a1a2e; font-family: monospace; padding: 16px 0;">
            ${otp}
          </div>
          <p style="color: #6b7280; font-size: 13px; margin: 16px 0 0;">यह OTP <strong>10 मिनट</strong> तक valid है</p>
        </div>

        <div style="margin-top: 20px; padding: 14px; background: #fff3cd; border-radius: 8px;">
          <p style="color: #856404; font-size: 13px; margin: 0;">
            ⚠️ अगर आपने यह request नहीं की, तो इसे ignore करें।
            आपका website password safe है।
          </p>
        </div>

        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
          NYS — Nathdwara Youth Society
        </p>
      </div>
    `,
  });
}

/** Member पासवर्ड reset OTP email */
export async function sendMemberOtpEmail(
  to: string,
  memberName: string,
  otp: string
): Promise<void> {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"NYS Website" <${process.env.GMAIL_USER}>`,
    to,
    subject: "🔑 NYS सदस्य पासवर्ड Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
        <div style="text-align:center; margin-bottom: 24px;">
          <h1 style="color: #c2410c; font-size: 22px; margin: 0;">🔑 पासवर्ड Reset OTP</h1>
          <p style="color: #6b7280; margin-top: 6px; font-size: 14px;">नारायणपुरी यूथ सोसाइटी — सदस्य पोर्टल</p>
        </div>

        <div style="background: white; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
          <p style="color: #374151; margin: 0 0 4px; font-size: 15px;">नमस्ते, <strong>${memberName}</strong>!</p>
          <p style="color: #6b7280; font-size: 13px; margin: 0;">आपका पासवर्ड reset OTP:</p>
        </div>

        <div style="background: white; border: 2px solid #fed7aa; border-radius: 10px; padding: 28px; text-align: center;">
          <div style="font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #c2410c; font-family: monospace; padding: 16px 0;">
            ${otp}
          </div>
          <p style="color: #6b7280; font-size: 13px; margin: 8px 0 0;">यह OTP <strong>10 मिनट</strong> तक valid है</p>
        </div>

        <div style="margin-top: 20px; padding: 14px; background: #fff3cd; border-radius: 8px;">
          <p style="color: #856404; font-size: 13px; margin: 0;">
            ⚠️ अगर आपने यह request नहीं की, तो इसे ignore करें।
          </p>
        </div>

        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
          NYS — Nathdwara Youth Society
        </p>
      </div>
    `,
  });
}
