const express = require("express");
const router = express.Router();

const { requireAdmin } = require("../middleware/auth");

// Controllers
const overviewController = require("../controllers/admin/overviewController");
const usersController = require("../controllers/admin/usersController");
const bookingsController = require("../controllers/admin/bookingsController");
const combosController = require("../controllers/admin/combosController");
const mediaController = require("../controllers/admin/mediaController");
const notificationsController = require("../controllers/admin/notificationsController");

// ================== MIDDLEWARE ==================
router.use(requireAdmin);

// ================== OVERVIEW ==================
router.get("/overview", overviewController.getOverview);

// ================== USERS ==================
router.get("/users", usersController.getUsers);
router.delete("/users/:id", usersController.deleteUser);

// ================== BOOKINGS & SESSIONS ==================
router.get("/bookings", bookingsController.getBookings);
router.delete("/bookings/:id", bookingsController.deleteBooking);

router.get("/sessions", bookingsController.getSessions);
router.post("/sessions/start", bookingsController.startOfflineSession);

router.patch("/bookings/:id/payment", bookingsController.updatePaymentMethod);
router.post("/bookings/:id/payments/add", bookingsController.addPartialPayment);
router.patch("/bookings/:id/payments/edit", bookingsController.editPaymentDetails);

router.patch("/bookings/:id/reschedule", bookingsController.rescheduleBooking);

router.post("/scan", bookingsController.scanQr);
router.get("/live", bookingsController.getLiveBookings);
router.post("/end-session/:id", bookingsController.endSession);
router.get("/availability-check", bookingsController.checkAvailability);
router.patch("/extend-session/:id", bookingsController.extendSession);
router.patch("/sessions/:id/pause", bookingsController.togglePauseSession);
router.patch("/sessions/:id/edit", bookingsController.editSession);

// ================== COMBOS ==================
router.get("/combos", combosController.getCombos);
router.post("/combos", combosController.createCombo);
router.delete("/combos/:id", combosController.deleteCombo);

// ================== MEDIA ==================
router.get("/media", mediaController.getMedia);
router.post("/media", mediaController.createMedia);
router.patch("/media/:id", mediaController.updateMedia);
router.delete("/media/:id", mediaController.deleteMedia);

// ================== NOTIFICATIONS ==================
router.post("/notifications/send", notificationsController.sendNotification);

module.exports = router;