// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: 'AIzaSyDfUoDRqp8_nbj5a4m8DNc7pnMOXgmWeWc',
  authDomain: 'joney-app.firebaseapp.com',
  projectId: 'joney-app',
  storageBucket: 'joney-app.appspot.com',
  messagingSenderId: '474228899131',
  appId: '1:474228899131:web:24d234af710bbe87e6cb1e',
  measurementId: 'G-WZ7GH3EP4Y',
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();