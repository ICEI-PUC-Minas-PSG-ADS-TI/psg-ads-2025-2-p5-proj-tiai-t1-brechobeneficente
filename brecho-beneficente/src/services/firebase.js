// Import the functions you need from the SDKs you need
// import { getAnalytics } from "firebase/analytics";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCkbjNW9T26J2B5kGYNGFwgyqNXqR2UuNA",
  authDomain: "brechobeneficente-40a41.firebaseapp.com",
  projectId: "brechobeneficente-40a41",
  storageBucket: "brechobeneficente-40a41.firebasestorage.app",
  messagingSenderId: "122186597813",
  appId: "1:122186597813:web:a875419b9da379a66785fc",
  measurementId: "G-WR6J5SJ0CR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
})

export { auth, db };