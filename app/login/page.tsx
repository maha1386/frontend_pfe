"use client";

import { useState, useEffect } from "react";
import { Zap, Shield, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [isPasswordChange, setIsPasswordChange] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    document.title =
      "SmartOnboard – Plateforme intelligente d'intégration des collaborateurs";
  }, []);

  // BluePanel
  const BluePanel = () => (
    <div className="w-1/2 bg-[#2c4a8f] text-white p-12 flex flex-col justify-between">
      <div className="flex items-center gap-3">
        <div className="relative w-14 h-14">
          <Image
            src="/images/maisonduweb_logo.jpg"
            alt="Logo"
            fill
            className="rounded-lg object-cover"
          />
        </div>
        <span className="text-xl">Maison du Web</span>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md">
        <h2 className="text-4xl mb-6 leading-tight">Bienvenue chez Maison du Web</h2>
        <p className="text-lg text-blue-200 mb-12">
          Maison du Web est une agence d'ingénierie numérique spécialisée dans la création de solutions digitales innovantes et performantes.
        </p>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#3d5aa3] flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg mb-1">Performance optimale</h3>
              <p className="text-blue-200 text-sm">Accédez à vos outils en un instant</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#3d5aa3] flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg mb-1">Sécurité maximale</h3>
              <p className="text-blue-200 text-sm">Vos données sont protégées 24/7</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#3d5aa3] flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg mb-1">Collaboration simplifiée</h3>
              <p className="text-blue-200 text-sm">Travaillez en équipe efficacement</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-sm text-blue-300">© 2026 Maison du Web. Tous droits réservés.</div>
    </div>
  );

  // LoginForm
  const LoginForm = () => {
    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoginMessage("");

      const form = e.target as HTMLFormElement;
      const email = (form.elements.namedItem("email") as HTMLInputElement).value;
      const password = (form.elements.namedItem("password") as HTMLInputElement).value;

      try {
        const res = await fetch("http://127.0.0.1:8000/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

       
        const data = await res.json();

        if (res.ok) {
          // Stockage du token
          localStorage.setItem("token", data.token);

          // Redirection ou affichage formulaire changement mot de passe
          if (data.force_password_change) {
            setIsPasswordChange(true);
          } else {
             router.push("/dashboard"); // Redirection vers le dashboard
          }
        } else {
          setLoginMessage(data.message || "Email ou mot de passe incorrect");
        }
      } catch (err) {
        console.error("Erreur lors du login :", err);
        setLoginMessage("Erreur serveur, réessayez plus tard.");
      }
    };

    return (
      <div className="w-1/2 bg-gray-50 flex flex-col items-center justify-center p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-4xl mb-2 text-gray-900">Connexion</h1>
            <p className="text-gray-500">Accédez à votre espace de travail</p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse e-mail
              </label>
              <input
                type="email"
                name="email"
                placeholder="Entrez votre adresse email"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Mot de passe</label>
              <input
                type="password"
                name="password"
                placeholder="Entrez votre mot de passe"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#1e293b] text-white py-3 rounded-lg hover:bg-[#0f172a] transition-colors"
            >
              Se connecter
            </button>

            {loginMessage && (
              <p className="mt-3 text-center text-red-500 font-medium">{loginMessage}</p>
            )}
          </form>
        </div>
      </div>
    );
  };

  // PasswordChangeForm
  const PasswordChangeForm = () => {
    return <div>…</div>;
  };

  return (
    <div className="flex min-h-screen">
      {!isPasswordChange ? (
        <>
          <BluePanel />
          <LoginForm />
        </>
      ) : (
        <>
          <PasswordChangeForm />
          <BluePanel />
        </>
      )}
    </div>
  );
}