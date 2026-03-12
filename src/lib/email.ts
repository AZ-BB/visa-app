const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME ?? "Visa App";

type BasicEmailParams = {
  to: string;
  subject: string;
  html: string;
};

async function sendRawEmail({ to, subject, html }: BasicEmailParams): Promise<void> {
  if (!BREVO_API_KEY || !BREVO_SENDER_EMAIL) {
    console.warn(
      "[email] BREVO_API_KEY or BREVO_SENDER_EMAIL not set; skipping email send.",
    );
    return;
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
      "api-key": BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        email: BREVO_SENDER_EMAIL,
        name: BREVO_SENDER_NAME,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(
      "[email] Failed to send email via Brevo:",
      res.status,
      res.statusText,
      text,
    );
  }
}

export async function sendApplicationCreatedEmail(params: {
  to: string;
  applicationId: string;
  destinationName: string;
  visaTypeName: string;
  arrivalDate: string;
}) {
  const { to, applicationId, destinationName, visaTypeName, arrivalDate } = params;

  const subject = `Your visa application has been created (${destinationName})`;
  const html = `
    <p>Hi,</p>
    <p>We have received your visa application.</p>
    <ul>
      <li><strong>Application ID:</strong> ${applicationId}</li>
      <li><strong>Destination:</strong> ${destinationName}</li>
      <li><strong>Visa type:</strong> ${visaTypeName}</li>
      <li><strong>Arrival date:</strong> ${arrivalDate}</li>
    </ul>
    <p>We will notify you once your application is completed.</p>
  `;

  await sendRawEmail({ to, subject, html });
}

export async function sendApplicationCompletedEmail(params: {
  to: string;
  applicationId: string;
  destinationName?: string;
}) {
  const { to, applicationId, destinationName } = params;
  const subject = `Your visa application is completed`;
  const html = `
    <p>Hi,</p>
    <p>Your visa application${
      destinationName ? ` for <strong>${destinationName}</strong>` : ""
    } is now <strong>completed</strong>.</p>
    <p>Application ID: <strong>${applicationId}</strong></p>
  `;

  await sendRawEmail({ to, subject, html });
}

export async function sendPasswordResetEmail(params: {
  to: string;
  resetUrl: string;
}) {
  const { to, resetUrl } = params;
  const subject = "Reset your password";
  const html = `
    <p>Hi,</p>
    <p>You requested to reset your password. Click the link below to proceed:</p>
    <p><a href="${resetUrl}">Reset your password</a></p>
    <p>If you did not request this, you can safely ignore this email.</p>
  `;

  await sendRawEmail({ to, subject, html });
}

export async function sendRefundEmail(params: {
  to: string;
  applicationId: string;
  amountRefundedDollars: string;
  destinationName?: string;
  isFullRefund: boolean;
}) {
  const { to, applicationId, amountRefundedDollars, destinationName, isFullRefund } = params;
  const subject = `Refund processed for your visa application${destinationName ? ` (${destinationName})` : ""}`;
  const html = `
    <p>Hi,</p>
    <p>A refund of <strong>$${amountRefundedDollars}</strong> has been processed for your visa application${
    destinationName ? ` for <strong>${destinationName}</strong>` : ""
  }.</p>
    <p>Application ID: <strong>${applicationId}</strong></p>
    ${isFullRefund ? "<p>This was a full refund of the amount paid.</p>" : "<p>This was a partial refund. If you have questions about the remaining balance, please contact us.</p>"}
    <p>Funds may take a few business days to appear in your account.</p>
  `;

  await sendRawEmail({ to, subject, html });
}

