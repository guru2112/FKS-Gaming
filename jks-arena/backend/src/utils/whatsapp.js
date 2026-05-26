/**
 * Send an OTP via WhatsApp Business API
 */
async function sendWhatsAppOTP(phone, otpCode) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  if (!token || !phoneId) {
    throw new Error("WHATSAPP_TOKEN or WHATSAPP_PHONE_ID is missing from Environment Variables.");
  }

  // Make sure phone number doesn't have the + sign for WhatsApp API (it requires just country code + number)
  const cleanPhone = phone.replace("+", "").replace(/\s/g, "");

  const payload = {
    messaging_product: "whatsapp",
    to: cleanPhone,
    type: "template",
    template: {
      name: "auth_otp",
      language: {
        code: "en",
      },
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: otpCode,
            },
          ],
        },
      ],
    },
  };

  const response = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`WhatsApp API Error (${response.status}): ${errorData}`);
  }

  return await response.json();
}

module.exports = {
  sendWhatsAppOTP,
};
