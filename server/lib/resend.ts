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

export async function sendRequestStatusEmail(
  userEmail: string,
  requestName: string,
  requestType: string,
  status: "accepted" | "rejected"
) {
  try {
    const { client, fromEmail } = await getUncachableResendClient();

    const statusText = status === "accepted" ? "Accepted" : "Rejected";
    const statusColor = status === "accepted" ? "#22c55e" : "#ef4444";
    const typeText = requestType === "drink" ? "drink" : "coffee chain";

    const message = status === "accepted"
      ? `Great news! Your request to add "${requestName}" as a ${typeText} has been approved and will be added to CaffiTrack soon.`
      : `Thank you for your suggestion. Unfortunately, we're unable to add "${requestName}" to CaffiTrack at this time.`;

    await client.emails.send({
      from: fromEmail,
      to: userEmail,
      subject: `CaffiTrack Request ${statusText}: ${requestName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a1a2e; margin-bottom: 20px;">CaffiTrack</h1>
          <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
            <p style="font-size: 16px; color: #333; margin: 0 0 16px 0;">${message}</p>
            <div style="display: inline-block; background: ${statusColor}20; color: ${statusColor}; padding: 8px 16px; border-radius: 8px; font-weight: 600;">
              ${statusText}
            </div>
          </div>
          <p style="color: #666; font-size: 14px;">Thank you for helping make CaffiTrack better!</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to send request status email:', error);
  }
}
