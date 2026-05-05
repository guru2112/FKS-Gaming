const nodemailer = require("nodemailer");

function getTransporter() {
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
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
}

async function sendMail(message) {
  const transporter = getTransporter();
  return transporter.sendMail(message);
}

module.exports = {
  sendMail,
};
