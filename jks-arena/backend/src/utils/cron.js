const cron = require("node-cron");
const Booking = require("../models/Booking");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { sendPushToUser } = require("./pushNotifications");
const { sendMail } = require("./mailer");

function startCronJobs() {
  console.log("🔥 Initializing Cron Jobs...");

  // Run every minute
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      // Look ahead up to 30 mins (using 30 minutes + 1 minute buffer to catch everything exactly 30 mins out)
      // Actually we just want everything that starts <= 30 mins from now that hasn't had a reminder
      const thirtyMinsFromNow = new Date(now.getTime() + 30 * 60000);

      const upcomingBookings = await Booking.find({
        slotStart: { $gt: now, $lte: thirtyMinsFromNow },
        status: { $in: ["upcoming", "active"] },
        reminderSent: false,
        source: "online", // only care about online users for notifications usually, but we can do all if user is linked
      }).populate("userId");

      for (const booking of upcomingBookings) {
        // Mark as sent immediately to avoid duplicate processing
        booking.reminderSent = true;
        await booking.save();

        if (!booking.userId) continue;
        const user = booking.userId;

        const diffMs = new Date(booking.slotStart).getTime() - now.getTime();
        let diffMins = Math.round(diffMs / 60000);
        if (diffMins < 1) diffMins = 1;
        const timeRemainingText = diffMins === 1 ? "1 minute" : `${diffMins} minutes`;

        const timeString = new Date(booking.slotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
        
        const title = "🎮 Session Starting Soon!";
        const message = `Hey ${user.name.split(" ")[0]}, your gaming session for ${booking.device} starts in ${timeRemainingText} at ${timeString}. Get ready to dominate!`;

        // 1. In-App Notification
        await Notification.create({
          userId: user._id,
          title,
          message,
          type: "reminder",
          link: "/dashboard",
        });

        // 2. Push Notification
        if (user.notifications?.reminders !== false) {
          await sendPushToUser(user._id, {
            title,
            body: message,
            data: { url: "/dashboard" }
          });
        }

        // 3. Email Notification (Professional format)
        if (user.notifications?.reminders !== false && user.email) {
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #050505; color: #ffffff; padding: 0; border-radius: 12px; overflow: hidden; border: 1px solid #333;">
              <div style="background-color: #ff6b35; padding: 20px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: 2px;">JKS ARENA</h1>
              </div>
              <div style="padding: 30px 20px;">
                <p style="color: #ff6b35; font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">Reminder</p>
                <h2 style="margin-top: 5px; font-size: 22px;">Your session is starting soon! 🎮</h2>
                <p style="color: #cccccc; line-height: 1.6; font-size: 15px;">
                  Hi ${user.name.split(" ")[0]},<br><br>
                  This is a quick reminder that your premium gaming session at JKS ARENA is starting in ${timeRemainingText}. 
                  Make sure you are at the arena slightly early to get settled in!
                </p>
                <div style="background-color: #1a1a1a; padding: 15px; border-radius: 8px; margin: 25px 0; border: 1px solid #333;">
                  <p style="margin: 0; color: #aaa; font-size: 12px; text-transform: uppercase;">Console / Rig</p>
                  <p style="margin: 5px 0 15px 0; font-size: 18px; font-weight: bold;">${booking.device}</p>
                  <p style="margin: 0; color: #aaa; font-size: 12px; text-transform: uppercase;">Start Time</p>
                  <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #ff6b35;">${timeString}</p>
                </div>
                <a href="${process.env.FRONTEND_URL || 'https://jks-gaming-arena.vercel.app'}/dashboard" style="display: inline-block; background-color: #ff6b35; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">View Booking Details</a>
              </div>
              <div style="background-color: #111; padding: 20px; text-align: center; border-top: 1px solid #333;">
                <p style="margin: 0; color: #666; font-size: 12px;">© ${new Date().getFullYear()} JKS ARENA. All rights reserved.</p>
              </div>
            </div>
          `;
          
          await sendMail({
            from: '"JKS ARENA" <' + process.env.MAIL_USERNAME + '>',
            to: user.email,
            subject: `Your Gaming Session Starts in ${timeRemainingText}! 🎮`,
            html: emailHtml,
          }).catch(err => console.error("Email reminder failed:", err));
        }
      }
    } catch (err) {
      console.error("Cron Job Error (Reminders):", err);
    }
  });
}

module.exports = { startCronJobs };
