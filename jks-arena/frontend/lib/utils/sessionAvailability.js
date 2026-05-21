import Booking from "../../models/Booking.js";

const BUFFER_MS = 20 * 60 * 1000;

export function normalizeDevice(device) {
  return String(device || "")
    .replace(/\s+/g, "")
    .toUpperCase();
}

export function computeSlotEnd(slotStart, durationHours) {
  const start = new Date(slotStart);
  const duration = Number(durationHours);
  return new Date(start.getTime() + duration * 60 * 60 * 1000);
}

export async function assertDeviceAvailable({ device, slotStart, slotEnd, excludeBookingId = undefined }) {
  const normalizedDevice = normalizeDevice(device);
  const start = new Date(slotStart);
  const end = new Date(slotEnd);

  const query = {
    device: normalizedDevice,
    status: { $in: ["upcoming", "active"] },
    slotStart: { $lt: new Date(end.getTime() + BUFFER_MS) },
    slotEnd: { $gt: new Date(start.getTime() - BUFFER_MS) },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflict = await Booking.findOne(query).lean();

  if (conflict) {
    const error = new Error("Slot unavailable. Please leave a 20-minute gap.");
    error.status = 409;
    error.code = "SLOT_UNAVAILABLE";
    error.conflict = conflict;
    throw error;
  }

  return { normalizedDevice };
}
