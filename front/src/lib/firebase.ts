import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBtd0IUR0GhwvdVXmxOTYjhqGc3Qo7Zh6A",
  authDomain: "ekpi-c0c31.firebaseapp.com",
  projectId: "ekpi-c0c31",
  storageBucket: "ekpi-c0c31.firebasestorage.app",
  messagingSenderId: "552249159553",
  appId: "1:552249159553:web:6159fbdbb7cdadd8d74280",
  measurementId: "G-GYFN8K2Z8F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;