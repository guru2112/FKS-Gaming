import Booking from "../../models/Booking.js";

const NO_SHOW_GRACE_MS = 30 * 60 * 1000;

export async function cancelExpiredBookings() {
  const cutoff = new Date(Date.now() - NO_SHOW_GRACE_MS);

  const result = await Booking.updateMany(
    {
      status: "upcoming",
      slotStart: { $lt: cutoff },
    },
    {
      $set: {
        status: "no-show",
        sessionStatus: "cancelled",
      },
    }
  );

  if (result.modifiedCount > 0) {
    console.log(`No-show cleanup: ${result.modifiedCount} booking(s) marked no-show`);
  }

  return result.modifiedCount;
}

export async function completeExpiredSessions() {
  const now = new Date();

  const result = await Booking.updateMany(
    {
      status: "active",
      slotEnd: { $lt: now },
    },
    {
      $set: {
        status: "completed",
        sessionStatus: "completed",
      },
    }
  );

  if (result.modifiedCount > 0) {
    console.log(`Auto-complete: ${result.modifiedCount} session(s) marked completed`);
  }

  return result.modifiedCount;
}
