// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "aniket-s-blog.firebaseapp.com",
  projectId: "aniket-s-blog",
  // Firebase storage bucket uses the appspot.com domain
  storageBucket: "aniket-s-blog.appspot.com",
  messagingSenderId: "67559833778",
  appId: "1:67559833778:web:3b42c250133459351149ab"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);