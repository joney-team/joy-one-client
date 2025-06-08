import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging } from "firebase/messaging";

export const firebaseConfig = {
  apiKey: "AIzaSyCtFkLfYYG5iXrWrm0WXn_DpJoHlixPEVM",
  authDomain: "withjoy-project.firebaseapp.com",
  projectId: "withjoy-project",
  storageBucket: "withjoy-project.appspot.com",
  messagingSenderId: "67644379679",
  appId: "1:67644379679:web:db91ba68eb8e11b5ab3b2a",
  measurementId: "G-B5623EPMZM"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);

export const getFirebaseMessaging = () => getMessaging(firebaseApp);