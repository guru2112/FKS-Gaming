/* eslint-disable no-undef */

// =========================================================
// 🔥 FIREBASE IMPORTS
// =========================================================

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

// =========================================================
// 🔥 FIREBASE CONFIG
// =========================================================

firebase.initializeApp({

  apiKey:
    "AIzaSyATibCY7cJiu9lVXnRpfy9AM9TCO0MPriY",

  authDomain:
    "jks-arena.firebaseapp.com",

  projectId:
    "jks-arena",

  storageBucket:
    "jks-arena.firebasestorage.app",

  messagingSenderId:
    "402771475927",

  appId:
    "1:402771475927:web:390de2e598a9cf79dd5f92",

});

// =========================================================
// 🔥 FIREBASE MESSAGING
// =========================================================

const messaging =
  firebase.messaging();

// =========================================================
// 🔥 BACKGROUND NOTIFICATIONS
// =========================================================

messaging.onBackgroundMessage(
  (payload) => {

    console.log(
      "🔥 Background notification:",
      payload
    );

    const title =
      payload.notification?.title ||
      "JKS Arena";

    const options = {

      body:
        payload.notification?.body ||
        "New notification",

      icon:
        "/favicon.ico",

    };

    self.registration.showNotification(
      title,
      options
    );

  }
);