// backend/src/utils/mailer.js

/**
 * Send an email using the Brevo (formerly Sendinblue) HTTP API.
 * This completely bypasses Render's SMTP port blocking by using Port 443 (HTTPS).
 */
async function sendMail(message) {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    throw new Error("BREVO_API_KEY is missing from Environment Variables.");
  }

  const senderEmail = process.env.MAIL_FROM || process.env.MAIL_USERNAME;

  if (!senderEmail) {
    throw new Error("MAIL_FROM or MAIL_USERNAME must be set for the sender email.");
  }

  // Translate Nodemailer attachments to Brevo format (base64)
  const attachments = message.attachments
    ? message.attachments.map((att) => ({
        name: att.filename,
        content: att.content.toString("base64"),
      }))
    : undefined;

  const payload = {
    sender: {
      name: "JKS Arena",
      email: senderEmail,
    },
    to: [
      {
        email: message.to,
      },
    ],
    subject: message.subject,
    htmlContent: message.html,
    attachment: attachments,
  };

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Brevo API Error (${response.status}): ${errorData}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Verify API connection on startup.
 */
async function verifyConnection() {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      return { ok: false, error: "Missing BREVO_API_KEY environment variable." };
    }

    // Ping the account endpoint to verify the API key
    const response = await fetch("https://api.brevo.com/v3/account", {
      method: "GET",
      headers: {
        "api-key": apiKey,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return { ok: false, error: "Invalid BREVO_API_KEY." };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

module.exports = {
  sendMail,
  verifyConnection,
};
