import jwt from "jsonwebtoken";
import QRCode from "qrcode";

export function createQrToken({ bookingId, userId, slotEnd }) {
  const secret = process.env.QR_TOKEN_SECRET || process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("QR_TOKEN_SECRET or JWT_SECRET is required to sign QR tokens.");
  }

  const expirySeconds = Math.floor(new Date(slotEnd).getTime() / 1000);
  const nowSeconds = Math.floor(Date.now() / 1000);
  const exp = expirySeconds > nowSeconds ? expirySeconds : nowSeconds + 60 * 60;

  return jwt.sign(
    {
      bid: String(bookingId),
      uid: String(userId),
      exp,
    },
    secret
  );
}

export async function createQrPngBuffer(token) {
  return QRCode.toBuffer(token, {
    type: "png",
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
  });
}
