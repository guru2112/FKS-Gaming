import admin from "firebase-admin";

let initialized = false;

function ensureFirebaseInit() {
  if (initialized || admin.apps.length) {
    initialized = true;
    return;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    console.warn("Firebase env vars not set — push notifications disabled.");
    initialized = true;
    return;
  }

  const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: projectId,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
      : undefined,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  initialized = true;
}

export default admin;
export { ensureFirebaseInit };
