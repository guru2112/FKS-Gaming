const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, ".env") });

const { sendMail } = require("./src/utils/mailer");

async function run() {
  try {
    console.log("Testing email to", process.env.MAIL_USERNAME);
    const result = await sendMail({
      to: process.env.MAIL_USERNAME,
      subject: "Test Booking Email",
      html: "<h1>Testing Brevo SMTP</h1>",
    });
    console.log("Email sent successfully!", result);
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}

run();
