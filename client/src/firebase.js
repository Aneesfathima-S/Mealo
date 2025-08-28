// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "Your_Api_key",
  authDomain: "mealo-6be5e.firebaseapp.com",
  projectId: "mealo-6be5e",
  storageBucket: "mealo-6be5e.firebasestorage.app",
  messagingSenderId: "663253424472",
  appId: "1:663253424472:web:2b440d8e736c0b05e26d2d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export default app;
