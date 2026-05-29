const PDFDocument = require("pdfkit");

function formatDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

function buildBookingPdf({ booking, user, qrPng }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 0 }); 
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Background color
    doc.rect(0, 0, 595.28, 841.89).fill("#FAFAFA");

    // Header Background
    doc.rect(0, 0, 595.28, 120).fill("#050505");

    // Logo / Title
    doc.fillColor("#FF6B35").fontSize(32).font("Helvetica-Bold").text("JKS ARENA", 40, 35, { characterSpacing: 2 });
    doc.fillColor("#FFFFFF").fontSize(14).font("Helvetica").text("PREMIUM GAMING LOUNGE", 40, 75, { characterSpacing: 1 });

    // Ticket Box
    doc.roundedRect(40, 160, 515.28, 480, 15).fillAndStroke("#FFFFFF", "#E5E7EB");

    doc.fillColor("#111827").fontSize(24).font("Helvetica-Bold").text("Booking Confirmed", 70, 200);
    doc.fillColor("#6B7280").fontSize(12).font("Helvetica").text("Present this pass at the front desk", 70, 230);

    // Separator line
    doc.moveTo(70, 260).lineTo(525.28, 260).lineWidth(1).stroke("#E5E7EB");

    // Details Left Column
    doc.fillColor("#9CA3AF").fontSize(10).font("Helvetica-Bold").text("BOOKING ID", 70, 290);
    doc.fillColor("#111827").fontSize(12).font("Helvetica").text(booking._id.toString(), 70, 305);

    doc.fillColor("#9CA3AF").fontSize(10).font("Helvetica-Bold").text("PLAYER NAME", 70, 340);
    doc.fillColor("#111827").fontSize(12).font("Helvetica").text(user?.name || "Member", 70, 355);

    doc.fillColor("#9CA3AF").fontSize(10).font("Helvetica-Bold").text("RIG / DEVICE", 70, 390);
    doc.fillColor("#111827").fontSize(12).font("Helvetica").text(booking.device, 70, 405);

    doc.fillColor("#9CA3AF").fontSize(10).font("Helvetica-Bold").text("PLAYERS", 70, 440);
    doc.fillColor("#111827").fontSize(12).font("Helvetica").text(booking.players.toString(), 70, 455);

    doc.fillColor("#9CA3AF").fontSize(10).font("Helvetica-Bold").text("DURATION", 70, 490);
    doc.fillColor("#111827").fontSize(12).font("Helvetica").text(`${formatDuration(booking.durationHours)}`, 70, 505);

    // Details Right Column
    doc.fillColor("#9CA3AF").fontSize(10).font("Helvetica-Bold").text("SLOT START", 230, 290);
    doc.fillColor("#111827").fontSize(12).font("Helvetica-Bold").text(formatDate(booking.slotStart), 230, 305);

    doc.fillColor("#9CA3AF").fontSize(10).font("Helvetica-Bold").text("SLOT END", 230, 340);
    doc.fillColor("#111827").fontSize(12).font("Helvetica").text(formatDate(booking.slotEnd), 230, 355);

    doc.fillColor("#9CA3AF").fontSize(10).font("Helvetica-Bold").text("GAME", 230, 390);
    doc.fillColor("#111827").fontSize(12).font("Helvetica").text(booking.game || "Decide on arrival", 230, 405);

    doc.fillColor("#9CA3AF").fontSize(10).font("Helvetica-Bold").text("TOTAL PRICE", 230, 440);
    doc.fillColor("#FF6B35").fontSize(18).font("Helvetica-Bold").text(`Rs ${booking.totalPrice}`, 230, 455);

    // QR Code Section
    doc.roundedRect(400, 290, 120, 120, 8).fillAndStroke("#F3F4F6", "#E5E7EB");
    doc.image(qrPng, 405, 295, { width: 110, height: 110 });
    doc.fillColor("#6B7280").fontSize(9).font("Helvetica-Bold").text("SCAN AT ENTRY", 400, 420, { width: 120, align: "center", characterSpacing: 1 });

    // Footer Text inside card
    doc.moveTo(70, 560).lineTo(525.28, 560).lineWidth(1).stroke("#E5E7EB");
    doc.fillColor("#9CA3AF").fontSize(10).font("Helvetica").text("For support, please contact JKS Arena at +91 93264 64645.", 70, 590, { width: 455.28, align: "center" });

    doc.end();
  });
}

module.exports = {
  buildBookingPdf,
};
