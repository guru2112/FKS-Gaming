const User = require("../../models/User");
const Booking = require("../../models/Booking");
const Combo = require("../../models/Combo");
const EmailLog = require("../../models/EmailLog");

exports.getOverview = async (req, res, next) => {
  try {
    const [users, bookings, combos, emails] = await Promise.all([
      User.countDocuments(),
      Booking.countDocuments(),
      Combo.countDocuments(),
      EmailLog.countDocuments(),
    ]);

    res.json({ users, bookings, combos, emails });
  } catch (err) {
    next(err);
  }
};
