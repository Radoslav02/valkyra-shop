import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCKUj5Q7tqoeg0y8_TvH74NzOMuubIz8Q4",
  authDomain: "valkyra-shop.firebaseapp.com",
  projectId: "valkyra-shop",
  storageBucket: "valkyra-shop.firebasestorage.app",
  messagingSenderId: "466092366326",
  appId: "1:466092366326:web:e174ec3e03a5cf0d448fd7",
  measurementId: "G-DJMZKFQM6G"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Inicijalizuj Storage
export const analytics = getAnalytics(app); 
