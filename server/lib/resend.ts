import { Resend } from 'resend';

async function getCredentials(): Promise<{ apiKey: string; fromEmail: string }> {
  if (process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL) {
    return {
      apiKey: process.env.RESEND_API_KEY,
      fromEmail: process.env.RESEND_FROM_EMAIL,
    };
  }
  throw new Error(
    'Resend not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL environment variables.'
  );
}

export async function getUncachableResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail: fromEmail
  };
}

export async function sendContactEmail(name: string, email: string, message: string) {
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    const toEmail = process.env.RESEND_CONTACT_TO || fromEmail;

    await client.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `New CaffiTrack Contact: ${name}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    });
  } catch (error) {
    console.error('Failed to send contact email:', error);
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendFeatureRequestEmail(data: {
  type: "drink" | "chain";
  name: string;
  details?: string;
  submitterEmail?: string;
}) {
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    const toEmail = process.env.RESEND_CONTACT_TO || fromEmail;
    const typeLabel = data.type === "drink" ? "Drink" : "Coffee chain";
    const detailsText = data.details?.trim()
      ? escapeHtml(data.details)
      : "(none)";

    await client.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `CaffiTrack feature request: ${typeLabel} — ${data.name}`,
      html: `
        <h2>New feature request</h2>
        <p><strong>Type:</strong> ${typeLabel}</p>
        <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
        <p><strong>Details:</strong></p>
        <p>${detailsText}</p>
        <p><strong>Submitter email:</strong> ${data.submitterEmail?.trim() ? escapeHtml(data.submitterEmail.trim()) : "(not provided)"}</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send feature request email:", error);
  }
}
