import admin, { ensureFirebaseInit } from "./firebaseAdmin.js";
import PushToken from "../../models/PushToken.js";

async function pruneInvalidTokens(tokensToDelete) {
  if (!tokensToDelete.length) return;

  try {
    await PushToken.deleteMany({
      token: { $in: tokensToDelete },
    });
  } catch (err) {
    console.error("Failed to prune invalid push tokens:", err);
  }
}

function asStringRecord(input) {
  if (!input || typeof input !== "object") return {};

  const out = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null) continue;
    out[key] = String(value);
  }
  return out;
}

export async function sendPushToUser(userId, { title, body, data } = {}) {
  if (!userId) return;

  ensureFirebaseInit();

  const pushTokens = await PushToken.find({ userId }).select("token").lean();
  const tokens = pushTokens.map((t) => t.token).filter(Boolean);

  if (!tokens.length) return;

  const message = {
    tokens,
    notification: {
      title: title || "JKS Arena",
      body: body || "New notification",
    },
    data: asStringRecord(data),
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);

    const invalidTokens = [];
    response.responses.forEach((r, idx) => {
      if (r.success) return;

      const code = r.error?.code;
      if (
        code === "messaging/registration-token-not-registered" ||
        code === "messaging/invalid-registration-token"
      ) {
        invalidTokens.push(tokens[idx]);
      }
    });

    await pruneInvalidTokens(invalidTokens);
  } catch (err) {
    console.error("Failed to send push notification:", err);
  }
}
