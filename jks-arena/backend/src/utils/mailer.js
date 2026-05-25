const nodemailer = require("nodemailer");

// Singleton transporter — created once, reused for all emails
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const user = process.env.MAIL_USERNAME;
  const pass = process.env.MAIL_PASSWORD;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secureEnv = String(process.env.SMTP_SECURE || "").toLowerCase();
  const secure = secureEnv === "true" || port === 465;

  if (!user || !pass) {
    throw new Error("MAIL_USERNAME and MAIL_PASSWORD are required for SMTP.");
  }

  if (host && !host.includes("gmail.com")) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  } else {
    // If it's gmail or host isn't set, use port 587 (STARTTLS)
    // Add timeouts so it throws an error instead of hanging indefinitely
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user, pass },
      family: 4, // Force IPv4
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }

  return transporter;
}

/**
 * Verify SMTP connection on startup.
 * Returns { ok: true } or { ok: false, error }.
 */
async function verifyConnection() {
  try {
    const t = getTransporter();
    await t.verify();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function sendMail(message) {
  const t = getTransporter();
  return t.sendMail(message);
}

module.exports = {
  sendMail,
  verifyConnection,
};
