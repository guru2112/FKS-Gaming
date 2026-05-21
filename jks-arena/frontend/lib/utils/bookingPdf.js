import PDFDocument from "pdfkit";

function formatDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function buildBookingPdf({ booking, user, qrPng }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 48 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(22).text("JKS Arena Booking Confirmation", { align: "left" });
    doc.moveDown(0.6);
    doc.fontSize(12).text("Keep this QR ready at check-in.");

    doc.moveDown();
    doc.fontSize(14).text("Booking details", { underline: true });
    doc.moveDown(0.4);

    doc.fontSize(11);
    doc.text(`Booking ID: ${booking._id}`);
    doc.text(`Name: ${user?.name || "Member"}`);
    doc.text(`Email: ${user?.email || ""}`);
    doc.text(`Game: ${booking.game || "TBD"}`);
    doc.text(`Device: ${booking.device}`);
    doc.text(`Players: ${booking.players}`);
    doc.text(`Duration: ${booking.durationHours} hour(s)`);
    doc.text(`Slot start: ${formatDate(booking.slotStart)}`);
    doc.text(`Slot end: ${formatDate(booking.slotEnd)}`);
    doc.text(`Total price: Rs ${booking.totalPrice}`);

    doc.moveDown(1.2);
    doc.fontSize(14).text("QR Code", { underline: true });
    doc.moveDown(0.6);

    const qrSize = 180;
    const currentX = doc.x;
    const currentY = doc.y;
    doc.image(qrPng, currentX, currentY, { fit: [qrSize, qrSize] });

    doc.moveDown(9);
    doc.fontSize(10).text("If you have issues, contact JKS Arena support.");

    doc.end();
  });
}
