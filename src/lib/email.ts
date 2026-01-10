/**
 * Email service for sending notifications
 * Supports multiple email providers (Resend, SendGrid, SMTP, etc.)
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using the configured email service
 * Currently supports Resend API, but can be extended to support other providers
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const emailProvider = process.env.EMAIL_PROVIDER || "resend"; // Default to Resend

    switch (emailProvider) {
      case "resend":
        return await sendEmailViaResend(options);
      case "sendgrid":
        return await sendEmailViaSendGrid(options);
      case "smtp":
        return await sendEmailViaSMTP(options);
      default:
        console.warn(`⚠️ Unknown email provider: ${emailProvider}. Using Resend as fallback.`);
        return await sendEmailViaResend(options);
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error sending email",
    };
  }
}

/**
 * Send email via Resend API
 * Get your API key from: https://resend.com/api-keys
 */
async function sendEmailViaResend(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || process.env.RESEND_FROM_EMAIL || "noreply@manzelhelp.com";

  if (!resendApiKey) {
    console.warn("⚠️ RESEND_API_KEY not set. Email will not be sent. Set it in .env.local");
    return {
      success: false,
      error: "RESEND_API_KEY not configured",
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ""), // Strip HTML tags for text version
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Resend API error:", errorData);
      return {
        success: false,
        error: `Resend API error: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();
    console.log("✅ Email sent via Resend:", data.id);
    return { success: true };
  } catch (error) {
    console.error("Error sending email via Resend:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send email via SendGrid API
 * Get your API key from: https://app.sendgrid.com/settings/api_keys
 */
async function sendEmailViaSendGrid(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const sendGridApiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || process.env.SENDGRID_FROM_EMAIL || "noreply@manzelhelp.com";

  if (!sendGridApiKey) {
    console.warn("⚠️ SENDGRID_API_KEY not set. Email will not be sent.");
    return {
      success: false,
      error: "SENDGRID_API_KEY not configured",
    };
  }

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sendGridApiKey}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: options.to }],
          },
        ],
        from: { email: fromEmail },
        subject: options.subject,
        content: [
          {
            type: "text/html",
            value: options.html,
          },
          {
            type: "text/plain",
            value: options.text || options.html.replace(/<[^>]*>/g, ""),
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SendGrid API error:", errorText);
      return {
        success: false,
        error: `SendGrid API error: ${response.status} ${response.statusText}`,
      };
    }

    console.log("✅ Email sent via SendGrid");
    return { success: true };
  } catch (error) {
    console.error("Error sending email via SendGrid:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send email via SMTP (using a generic SMTP server)
 * This is a basic implementation - you may want to use a library like nodemailer
 */
async function sendEmailViaSMTP(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  // SMTP configuration
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const fromEmail = process.env.FROM_EMAIL || smtpUser;

  if (!smtpHost || !smtpUser || !smtpPassword) {
    console.warn("⚠️ SMTP configuration not set. Email will not be sent.");
    return {
      success: false,
      error: "SMTP configuration not complete",
    };
  }

  // Note: For a production SMTP implementation, you should use nodemailer
  // This is a placeholder that shows the structure
  console.warn("⚠️ SMTP implementation is not complete. Please install nodemailer or use Resend/SendGrid.");
  return {
    success: false,
    error: "SMTP implementation not available. Please use Resend or SendGrid.",
  };
}

/**
 * Generate HTML email template for wallet refund notifications
 */
export function generateWalletRefundEmailTemplate(
  type: "approved" | "rejected",
  taskerName: string,
  amount: number,
  referenceCode: string,
  adminNotes?: string
): { subject: string; html: string; text: string } {
  const isApproved = type === "approved";
  const statusText = isApproved ? "Approuvé" : "Rejeté";
  const statusTextEn = isApproved ? "Approved" : "Rejected";
  const color = isApproved ? "#10b981" : "#ef4444"; // Green for approved, red for rejected
  const icon = isApproved ? "✅" : "❌";

  const subject = `Wallet Refund ${statusTextEn} - ${referenceCode}`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">MANZE HELP</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="font-size: 48px; margin-bottom: 10px;">${icon}</div>
      <h2 style="color: ${color}; margin: 0;">Wallet Refund ${statusTextEn}</h2>
    </div>
    
    <p style="font-size: 16px;">Bonjour ${taskerName},</p>
    
    <p style="font-size: 16px;">
      Votre demande de remboursement wallet a été <strong style="color: ${color};">${statusText.toLowerCase()}</strong>.
    </p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid ${color}; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Référence:</strong> ${referenceCode}</p>
      <p style="margin: 5px 0;"><strong>Montant:</strong> ${amount} MAD</p>
      <p style="margin: 5px 0;"><strong>Statut:</strong> <span style="color: ${color};">${statusText}</span></p>
      ${adminNotes ? `<p style="margin: 5px 0;"><strong>Notes de l'admin:</strong> ${adminNotes}</p>` : ""}
    </div>
    
    ${isApproved ? (
      `<p style="font-size: 16px;">
        Le montant a été débité de votre wallet. Vous pouvez consulter votre solde actuel dans votre espace finance.
      </p>`
    ) : (
      `<p style="font-size: 16px;">
        Votre demande a été rejetée. Veuillez contacter le support si vous avez des questions.
      </p>`
    )}
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://manzelhelp.com"}/tasker/finance/refunds" 
         style="background: ${color}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
        Voir mes demandes
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    
    <p style="font-size: 14px; color: #6b7280; text-align: center;">
      Cet email a été envoyé automatiquement. Veuillez ne pas y répondre.<br>
      © ${new Date().getFullYear()} MANZE HELP. Tous droits réservés.
    </p>
  </div>
</body>
</html>
  `;

  const text = `
MANZE HELP
==========

Wallet Refund ${statusTextEn}

Bonjour ${taskerName},

Votre demande de remboursement wallet a été ${statusText.toLowerCase()}.

RÉFÉRENCE: ${referenceCode}
MONTANT: ${amount} MAD
STATUT: ${statusText}
${adminNotes ? `NOTES DE L'ADMIN: ${adminNotes}` : ""}

${isApproved ? (
  `Le montant a été débité de votre wallet. Vous pouvez consulter votre solde actuel dans votre espace finance.`
) : (
  `Votre demande a été rejetée. Veuillez contacter le support si vous avez des questions.`
)}

Consulter vos demandes: ${process.env.NEXT_PUBLIC_APP_URL || "https://manzelhelp.com"}/tasker/finance/refunds

---
Cet email a été envoyé automatiquement. Veuillez ne pas y répondre.
© ${new Date().getFullYear()} MANZE HELP. Tous droits réservés.
  `;

  return { subject, html, text };
}
