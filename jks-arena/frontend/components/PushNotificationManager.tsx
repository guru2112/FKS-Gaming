"use client";

import { useEffect, useRef } from "react";

import {
  requestNotificationPermission,
  listenForMessages,
} from "@/lib/firebase";

import {
  savePushToken,
} from "@/lib/auth";

export default function PushNotificationManager() {

  const didSetupRef = useRef(false);
  const swRegistrationPromiseRef = useRef<
    Promise<ServiceWorkerRegistration | undefined> | undefined
  >(undefined);

  useEffect(() => {

    // React StrictMode in dev can run effects twice.
    if (didSetupRef.current) return;
    didSetupRef.current = true;

    console.log(
      "🔥 PushNotificationManager Loaded"
    );

    async function initNotifications() {

      try {

        // =====================================================
        // 🔥 GET AUTH TOKEN
        // =====================================================

        const authToken =
          localStorage.getItem(
            "auth_token"
          );

        if (!authToken) {

          console.log(
            "❌ User not logged in."
          );

          return;

        }

        // =====================================================
        // 🔥 REQUEST NOTIFICATION PERMISSION
        // =====================================================

        const swRegistration =
          (await swRegistrationPromiseRef.current) ||
          undefined;

        const pushToken =
          await requestNotificationPermission(
            swRegistration
          );

        if (!pushToken) {

          console.log(
            "❌ Push token not generated."
          );

          return;

        }

        console.log(
          "🔥 PUSH TOKEN:",
          pushToken
        );

        // =====================================================
        // 🔥 SAVE TOKEN TO BACKEND
        // =====================================================

        await savePushToken(
          authToken,
          pushToken
        );

        // =====================================================
        // 🔥 FOREGROUND PUSH HANDLER
        // =====================================================

        listenForMessages(
          async (payload) => {
            try {
              if (
                typeof window ===
                  "undefined" ||
                !(
                  "Notification" in
                  window
                )
              ) {
                return;
              }

              if (
                Notification.permission !==
                "granted"
              ) {
                console.log(
                  "🔕 Foreground push received but permission is:",
                  Notification.permission
                );
                return;
              }

              const title =
                payload?.notification
                  ?.title ||
                "JKS Arena";

              const body =
                payload?.notification
                  ?.body ||
                "New notification";

              const options: NotificationOptions = {
                body,
                icon: "/favicon.ico",
                data: payload?.data || {},
              };

              const registration =
                (await swRegistrationPromiseRef.current) ||
                undefined;

              if (registration?.showNotification) {
                await registration.showNotification(title, options);
                console.log("✅ Foreground notification shown via SW.");
              } else {
                new Notification(title, options);
                console.log("✅ Foreground notification shown via Notification API.");
              }
            } catch (err) {
              console.error(
                err
              );
            }
          }
        );

        console.log(
          "✅ Push token saved successfully."
        );

      } catch (err) {

        console.error(
          "❌ Push setup error:",
          err
        );

      }

    }

    if (typeof window === "undefined") return;

    if (!("Notification" in window)) {
      console.log("❌ Notifications not supported in this browser.");
      return;
    }

    // Pre-register SW (doesn't require user gesture)
    if (!swRegistrationPromiseRef.current) {
      swRegistrationPromiseRef.current =
        "serviceWorker" in navigator
          ? navigator.serviceWorker
              .register("/firebase-messaging-sw.js")
              .catch((err) => {
                console.error("❌ SW registration failed:", err);
                return undefined;
              })
          : Promise.resolve(undefined);
    }

    const permission = Notification.permission;

    console.log("🔔 Current Notification.permission:", permission);

    if (permission === "granted") {
      initNotifications();
      return;
    }

    if (permission === "denied") {
      console.log("❌ Notification permission is denied.");
      return;
    }

    // permission === "default" -> must be requested via a user gesture
    console.log(
      "🔔 Waiting for user interaction to request notification permission..."
    );

    const onUserGesture = async () => {
      try {
        // IMPORTANT: call requestPermission immediately (no awaits before).
        const result = await Notification.requestPermission();
        console.log("🔔 Notification permission:", result);

        if (result !== "granted") {
          return;
        }

        await initNotifications();
      } catch (err) {
        console.error("❌ Permission prompt failed:", err);
      }
    };

    window.addEventListener("pointerdown", onUserGesture, {
      capture: true,
      once: true,
    });

    window.addEventListener("keydown", onUserGesture, {
      capture: true,
      once: true,
    });

    return () => {
      window.removeEventListener("pointerdown", onUserGesture, true);
      window.removeEventListener("keydown", onUserGesture, true);
    };

  }, []);

  return null;

}