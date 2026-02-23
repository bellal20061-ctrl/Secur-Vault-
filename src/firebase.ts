// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAe96yS4GDgQ_7OL-ohSmlcHkbDKGya6sA",
  authDomain: "vault-1a686.firebaseapp.com",
  databaseURL: "https://vault-1a686-default-rtdb.firebaseio.com",
  projectId: "vault-1a686",
  storageBucket: "vault-1a686.firebasestorage.app",
  messagingSenderId: "89647642006",
  appId: "1:89647642006:web:658c1ef1a6397c037a99b7",
  measurementId: "G-ZECP17LP91"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
