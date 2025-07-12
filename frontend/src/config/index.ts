// Configuración de la aplicación
export const config = {
  // Firebase config
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDqvgRYibKWyBJrjXt1wv25qMX8tA85dMk",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "teblo-2.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "teblo-2",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "teblo-2.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "440923986344",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:440923986344:web:f5d80f08055e6a4deca59d",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-1GD881LN8H"
  },
  
  // Google OAuth
  google: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "440923986344-58v7n3q09l3kk9st5jub5d55ar3h0d7m.apps.googleusercontent.com"
  }
}; 