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
    // If it's gmail or host isn't set, use the built-in gmail service
    // This perfectly bypasses Render's IPv6 routing bugs
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
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
