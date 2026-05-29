// backend/src/controllers/aiController.js
const { streamText, tool } = require("ai");
const { google } = require("@ai-sdk/google");
const { z } = require("zod");
const Booking = require("../models/Booking");
const { assertDeviceAvailable } = require("../utils/sessionAvailability");

async function handleChat(req, res) {
  try {
    const { messages } = req.body;
    const userId = req.userId || null;

    const systemPrompt = `You are the AI Customer Support Agent for JKS Arena (a premium gaming lounge). 
Your goal is to help users book sessions, check availability, and answer questions about the arena.
Be polite, energetic, and professional. 
The user's ID is ${userId ? userId : "unknown (guest)"}. 
If they ask for their specific bookings and their ID is unknown, politely ask them to log in to see their bookings.
If checking availability, you can use the checkSlotAvailability tool.

Here is some context about devices:
- SIM1 is our racing simulator (used for Forza, F1, etc)
- PS1, PS2, PS3 are our PlayStation rigs
Always ask for date/time if checking availability if they haven't provided it.
`;

    const result = streamText({
      model: google("gemini-1.5-flash"),
      system: systemPrompt,
      messages,
      tools: {
        checkSlotAvailability: tool({
          description: "Check if a specific gaming rig/device is available for a given time.",
          parameters: z.object({
            device: z.string().describe("The device to check (e.g. SIM1, PS1, PS2)"),
            slotStart: z.string().describe("ISO timestamp of when they want to start (e.g. 2026-05-29T19:00:00.000Z)"),
            durationHours: z.number().describe("How many hours they want to play"),
          }),
          execute: async ({ device, slotStart, durationHours }) => {
            try {
              const start = new Date(slotStart);
              const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
              await assertDeviceAvailable({ device, slotStart: start, slotEnd: end });
              return { status: "available", message: `${device} is available for the requested time.` };
            } catch (err) {
              return { status: "busy", message: err.message };
            }
          },
        }),
        getUserBookings: tool({
          description: "Get the active and upcoming bookings for the current logged-in user.",
          parameters: z.object({}),
          execute: async () => {
            if (!userId) return { error: "User is not logged in." };
            const bookings = await Booking.find({ userId, status: { $ne: "cancelled" } })
              .sort({ slotStart: -1 })
              .limit(5)
              .lean();
            return { bookings };
          }
        }),
      },
    });

    result.pipeDataStreamToResponse(res);
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ error: "Failed to process chat" });
  }
}

module.exports = { handleChat };
