import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDqvgRYibKWyBJrjXt1wv25qMX8tA85dMk",
  authDomain: "teblo-2.firebaseapp.com",
  projectId: "teblo-2",
  storageBucket: "teblo-2.firebasestorage.app",
  messagingSenderId: "440923986344",
  appId: "1:440923986344:web:f5d80f08055e6a4deca59d",
  measurementId: "G-1GD881LN8H"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); 