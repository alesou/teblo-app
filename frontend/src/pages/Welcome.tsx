import { useEffect, useRef } from "react";
import { auth } from "../firebase";
import { signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { config } from "../config";

// @ts-ignore
declare global { interface Window { google: any; } }

export default function Welcome() {
  const buttonDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!document.getElementById('google-one-tap')) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.id = 'google-one-tap';
      document.body.appendChild(script);
      script.onload = () => {
        window.google?.accounts.id.initialize({
          client_id: config.google.clientId,
          callback: async (response: any) => {
            const credential = GoogleAuthProvider.credential(response.credential);
            await signInWithCredential(auth, credential);
          },
          auto_select: false,
          cancel_on_tap_outside: false,
        });
        window.google?.accounts.id.prompt();
        // Renderizar el botón clásico
        if (buttonDiv.current) {
          window.google?.accounts.id.renderButton(buttonDiv.current, {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'pill',
            width: 280,
          });
        }
      };
    } else {
      window.google?.accounts.id.prompt();
      if (buttonDiv.current) {
        window.google?.accounts.id.renderButton(buttonDiv.current, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'pill',
          width: 280,
        });
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-blue-300 to-blue-500">
      <div className="bg-white/80 rounded-2xl shadow-xl px-10 py-12 flex flex-col items-center">
        <h1 className="text-4xl font-poppins font-extrabold text-primary-700 mb-2 tracking-tight">Teblo</h1>
        <p className="mb-8 text-gray-700 text-lg text-center max-w-xs">Gestiona tus facturas de forma profesional y sencilla.</p>
        <div ref={buttonDiv} className="mb-2" />
        {/* El widget de One Tap aparece automáticamente */}
        <div id="g_id_onload"
          data-client_id={config.google.clientId}
          data-context="signin"
          data-ux_mode="popup"
          data-callback=""
          data-auto_prompt="true"
        ></div>
      </div>
    </div>
  );
} 