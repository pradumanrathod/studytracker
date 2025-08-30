/* eslint-disable no-undef */
// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCb6SW4PqXVfC51w5yKzLMmfwEsSbTh1SU",
  authDomain: "studytracker-e7ae1.firebaseapp.com",
  projectId: "studytracker-e7ae1",
  storageBucket: "studytracker-e7ae1.appspot.com",
  messagingSenderId: "584135858072",
  appId: "1:584135858072:web:8ba63dcb1d9ec606953ded",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'StudyTracker';
  const options = {
    body: payload.notification?.body || 'Time to study! Start your session now.',
    icon: '/models/android-chrome-512x512.png',
    badge: '/favicon-96x96.png',
    data: payload.data || {},
  };
  self.registration.showNotification(title, options);
});
