import nodemailer from "nodemailer";

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

  if (host) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  } else {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }

  return transporter;
}

export async function verifyConnection() {
  try {
    const t = getTransporter();
    await t.verify();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function sendMail(message) {
  const t = getTransporter();
  return t.sendMail(message);
}
