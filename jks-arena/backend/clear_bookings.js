const mongoose = require('mongoose');
const Booking = require('./src/models/Booking');
require('dotenv').config();

async function clearBookings() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected successfully.");

    const count = await Booking.countDocuments();
    console.log(`Found ${count} bookings in the database.`);

    if (count > 0) {
      console.log("Deleting all bookings...");
      const result = await Booking.deleteMany({});
      console.log(`Successfully deleted ${result.deletedCount} bookings.`);
    } else {
      console.log("No bookings to delete.");
    }

    console.log("Database is ready for production!");
  } catch (error) {
    console.error("Error clearing bookings:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  }
}

clearBookings();
