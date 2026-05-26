const User = require("../../models/User");
const Notification = require("../../models/Notification");
const { sendPushToAll, sendPushToUser } = require("../../utils/pushNotifications");

exports.sendNotification = async (req, res, next) => {
  try {
    const { targetType, userIds, title, message, type } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required." });
    }

    const notifType = type || "promo";

    if (targetType === "all") {
      // Find all users who haven't opted out of promos
      const users = await User.find({ "notifications.promotions": { $ne: false } }).select("_id");
      
      const notificationsToInsert = users.map(u => ({
        userId: u._id,
        title,
        message,
        type: notifType,
        link: "/",
      }));

      if (notificationsToInsert.length > 0) {
        await Notification.insertMany(notificationsToInsert);
      }

      await sendPushToAll({ title, body: message, data: { url: "/" } });

      return res.json({ message: `Notification sent to all users (${users.length}).` });
    } else if (targetType === "specific") {
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: "No users selected." });
      }

      const users = await User.find({ _id: { $in: userIds }, "notifications.promotions": { $ne: false } }).select("_id");
      
      const notificationsToInsert = users.map(u => ({
        userId: u._id,
        title,
        message,
        type: notifType,
        link: "/",
      }));

      if (notificationsToInsert.length > 0) {
        await Notification.insertMany(notificationsToInsert);
      }

      for (const u of users) {
        await sendPushToUser(u._id, { title, body: message, data: { url: "/" } });
      }

      return res.json({ message: `Notification sent to ${users.length} users.` });
    }

    res.status(400).json({ message: "Invalid target type." });
  } catch (err) {
    next(err);
  }
};
