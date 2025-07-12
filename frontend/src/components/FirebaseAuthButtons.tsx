import { useEffect, useState } from "react";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebase";

export default function FirebaseAuthButtons() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (!user) {
    return (
      <button
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded shadow hover:bg-gray-50 transition"
        onClick={handleLogin}
        style={{ fontWeight: 500 }}
      >
        <svg width="20" height="20" viewBox="0 0 48 48">
          <g>
            <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.5l6.4-6.4C34.1 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 19.5-7.6 21-18h-21v-9z"/>
            <path fill="#34A853" d="M6.3 14.7l7 5.1C15.5 16.1 19.4 13 24 13c2.7 0 5.2.9 7.2 2.5l6.4-6.4C34.1 5.1 29.3 3 24 3c-6.6 0-12 5.4-12 12 0 2.1.5 4.1 1.3 5.7z"/>
            <path fill="#FBBC05" d="M24 45c5.8 0 10.7-2.9 13.7-7.4l-7-5.1C29.5 39.9 25.6 43 21 43c-2.7 0-5.2-.9-7.2-2.5l-6.4 6.4C13.9 42.9 18.7 45 24 45z"/>
            <path fill="#EA4335" d="M44.5 20H24v8.5h11.7C34.7 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.5l6.4-6.4C34.1 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 19.5-7.6 21-18h-21v-9z"/>
          </g>
        </svg>
        Iniciar sesión con Google
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-700">Hola, {user.displayName || user.email}</span>
      <button className="btn btn-secondary" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </div>
  );
} 