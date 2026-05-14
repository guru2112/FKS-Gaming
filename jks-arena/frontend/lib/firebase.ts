"use client";

import { initializeApp } from "firebase/app";

import {
  getMessaging,
  getToken,
  onMessage,
} from "firebase/messaging";

// =========================================================
// FIREBASE CONFIG
// =========================================================

const firebaseConfig = {

  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY,

  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,

  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,

  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,

  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,

  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID,

};

// =========================================================
// INIT FIREBASE
// =========================================================

const app =
  initializeApp(
    firebaseConfig
  );

// =========================================================
// FIREBASE MESSAGING
// =========================================================

export const messaging =
  typeof window !== "undefined"
    ? getMessaging(app)
    : null;

// =========================================================
// VAPID KEY
// =========================================================

export const FIREBASE_VAPID_KEY =
  process.env
    .NEXT_PUBLIC_FIREBASE_VAPID_KEY || "";

// =========================================================
// REQUEST PERMISSION
// =========================================================

export async function requestNotificationPermission(
  serviceWorkerRegistration?: ServiceWorkerRegistration
) {

  try {

    if (
      typeof window ===
      "undefined"
    ) {

      return null;

    }

    if (
      !("Notification" in window)
    ) {

      return null;

    }

    // =====================================================
    // REQUEST PERMISSION
    // =====================================================

    const existingPermission = Notification.permission;

    const permission =
      existingPermission === "default"
        ? await Notification.requestPermission()
        : existingPermission;

    if (
      permission !== "granted"
    ) {

      console.log(
        "Notification permission denied."
      );

      return null;

    }

    if (!messaging) {

      return null;

    }

    // =====================================================
    // GET DEVICE TOKEN
    // =====================================================

    const token =
      await getToken(
        messaging,
        {
          vapidKey:
            FIREBASE_VAPID_KEY,
          ...(serviceWorkerRegistration
            ? {
                serviceWorkerRegistration,
              }
            : {}),
        }
      );

    console.log(
      "🔥 DEVICE TOKEN:",
      token
    );

    return token;

  } catch (err) {

    console.error(
      "Firebase notification error:",
      err
    );

    return null;

  }

}

// =========================================================
// FOREGROUND LISTENER
// =========================================================

export function listenForMessages(
  callback: (
    payload: any
  ) => void
) {

  if (!messaging) return;

  onMessage(
    messaging,
    (payload) => {

      console.log(
        "🔥 Foreground notification:",
        payload
      );

      callback(payload);

    }
  );

}