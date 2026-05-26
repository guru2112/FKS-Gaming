const Booking = require("../models/Booking");

const NO_SHOW_GRACE_MS = 20 * 60 * 1000; // 20 minutes after slotStart

/**
 * Mark upcoming bookings as no-show if they passed their grace period.
 * Runs every 5 minutes via server.js background job.
 */
async function cancelExpiredBookings() {
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
    console.log(
      `✅ No-show cleanup: ${result.modifiedCount} booking(s) marked no-show`
    );
  }

  return result.modifiedCount;
}

/**
 * Auto-complete active sessions whose slotEnd has passed.
 * Catches cases where admin forgot to end a session.
 */
async function completeExpiredSessions() {
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
    console.log(
      `✅ Auto-complete: ${result.modifiedCount} session(s) marked completed`
    );
  }

  return result.modifiedCount;
}

module.exports = {
  cancelExpiredBookings,
  completeExpiredSessions,
};
