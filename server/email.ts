import nodemailer from 'nodemailer';

interface SendOtpOptions {
  to: string;
  name?: string;
  otp: string;
  purpose?: 'signup' | 'login' | 'verify' | 'reset';
}

type MailTransporter = ReturnType<typeof nodemailer.createTransport>;

let transporterInstance: MailTransporter | null = null;

function getTransporter(): MailTransporter | null {
  if (transporterInstance) return transporterInstance;

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, '');

  if (user && pass) {
    try {
      transporterInstance = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
      });
      return transporterInstance;
    } catch (err) {
      console.warn('Failed to initialize Gmail SMTP transporter:', err);
      return null;
    }
  }

  return null;
}

export interface SendOtpResult {
  success: boolean;
  mode: 'smtp' | 'simulated';
  info?: any;
  error?: string;
  isAuthError?: boolean;
}

export async function sendGmailOtpEmail({
  to,
  name = 'Valued Client',
  otp,
  purpose = 'signup'
}: SendOtpOptions): Promise<SendOtpResult> {
  const cleanEmail = to.trim().toLowerCase();
  const transporter = getTransporter();

  const titleMap = {
    signup: 'Create Your Account - Gmail Verification Code',
    login: 'Two-Factor Login - Gmail Verification Code',
    verify: 'Verify Your Gmail Address',
    reset: 'Password Reset - Gmail OTP Code'
  };

  const actionTextMap = {
    signup: 'to verify your Gmail address and complete your account creation',
    login: 'to complete your secure two-factor sign in',
    verify: 'to verify and link your official Gmail account',
    reset: 'to securely reset your studio account password'
  };

  const subject = `[${otp}] ${titleMap[purpose]} - Ashish Wedding Film Studio`;
  const actionText = actionTextMap[purpose];

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e5e5e5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0a0a0a;padding:40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:540px;background-color:#141414;border:1px solid #262626;border-radius:16px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.8);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1f1607 0%,#0f0b03 100%);padding:32px 28px;text-align:center;border-bottom:1px solid #332408;">
              <div style="display:inline-block;padding:8px 16px;background-color:#2a1c07;border:1px solid #78480d;border-radius:20px;font-size:11px;font-weight:700;color:#f59e0b;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;">
                Ashish Wedding Film Studio
              </div>
              <h1 style="margin:0;font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                Gmail Account Verification
              </h1>
              <p style="margin:6px 0 0;font-size:13px;color:#a3a3a3;">
                Koderma & Jhumri Telaiya, Jharkhand • #1 Wedding Cinema & Karizma Albums
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 28px;">
              <p style="margin:0 0 16px;font-size:15px;color:#e5e5e5;line-height:1.6;">
                Hello <strong>${name}</strong>,
              </p>
              <p style="margin:0 0 24px;font-size:14px;color:#a3a3a3;line-height:1.6;">
                Please use the 6-digit One-Time Password (OTP) below ${actionText}:
              </p>

              <!-- OTP Code Display Box -->
              <div style="background-color:#1c1917;border:2px dashed #f59e0b;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
                <span style="display:block;font-size:11px;font-weight:700;color:#f59e0b;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">
                  YOUR 6-DIGIT GMAIL OTP
                </span>
                <span style="display:inline-block;font-size:36px;font-weight:900;letter-spacing:10px;color:#fbbf24;font-family:monospace;">
                  ${otp}
                </span>
                <span style="display:block;font-size:12px;color:#737373;margin-top:10px;">
                  ⏱️ Valid for <strong>10 minutes</strong> only
                </span>
              </div>

              <!-- Security Notice -->
              <div style="background-color:#18181b;border-left:3px solid #f59e0b;padding:14px 16px;border-radius:6px;margin:0 0 24px;">
                <p style="margin:0;font-size:12px;color:#d4d4d8;line-height:1.5;">
                  <strong>Security Note:</strong> Do not share this OTP with anyone, including studio staff. If you did not request this OTP, you can safely ignore this email.
                </p>
              </div>

              <p style="margin:0;font-size:13px;color:#737373;line-height:1.5;">
                For any immediate booking queries or photo shoot scheduling:
                <br>
                Direct Studio Helpline: <strong style="color:#f59e0b;">+91 87090 17294</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#0d0d0d;padding:20px 28px;text-align:center;border-top:1px solid #1f1f1f;">
              <p style="margin:0;font-size:11px;color:#525252;">
                © 2026 Ashish Wedding Film Studio. All rights reserved.
                <br>
                Ranchi-Patna Main Road, Near Jhumri Telaiya Station, Koderma, Jharkhand - 825409
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"Ashish Wedding Film Studio" <${process.env.GMAIL_USER}>`,
        to: cleanEmail,
        subject,
        html: htmlBody
      });
      console.log(`[GMAIL SMTP SUCCESS] Sent OTP to ${cleanEmail}: Message ID ${info.messageId}`);
      return { success: true, mode: 'smtp', info };
    } catch (err: any) {
      console.error(`[GMAIL SMTP ERROR] Failed to send to ${cleanEmail}:`, err?.message || err);
      const isAuthError = err?.code === 'EAUTH' || err?.responseCode === 535 || /Username and Password not accepted/i.test(err?.message || '');
      return {
        success: false,
        mode: 'smtp',
        error: isAuthError
          ? `Google Authentication Failed (535): Google ne password reject kar diya hai. Kripya apna sahi 16-digit Google App Password check karein.`
          : `Email delivery failed: ${err?.message || 'SMTP error'}`
      };
    }
  } else {
    console.log(`\n========================================`);
    console.log(`📧 [GMAIL OTP SIMULATOR - NO SMTP CREDENTIALS IN .ENV]`);
    console.log(`To: ${cleanEmail}`);
    console.log(`Purpose: ${purpose}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Valid For: 10 minutes`);
    console.log(`========================================\n`);
    return { success: true, mode: 'simulated' };
  }
}
