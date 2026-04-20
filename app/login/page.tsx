"use client";

import { useState, useEffect } from "react";
import { Zap, Shield, Users } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [isPasswordChange, setIsPasswordChange] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");

  useEffect(() => {
    document.title =
      "SmartOnboard – Plateforme intelligente d'intégration des collaborateurs";
  }, []);

  // Composant BluePanel
  const BluePanel = () => (
    <div className="w-1/2 bg-[#2c4a8f] text-white p-12 flex flex-col justify-between">
      {/* Header */}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center max-w-md">
        <h2 className="text-4xl mb-6 leading-tight">
          Bienvenue chez Maison du Web
        </h2>
        <p className="text-lg text-blue-200 mb-12">
          Maison du Web est une agence d'ingénierie numérique spécialisée dans
          la création de solutions digitales innovantes et performantes.
        </p>

        {/* Features */}
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

      {/* Footer */}
      <div className="text-sm text-blue-300">
        © 2026 Maison du Web. Tous droits réservés.
      </div>
    </div>
  );


  const LoginForm = () => (
    <div className="w-1/2 bg-gray-50 flex flex-col items-center justify-center p-12">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-4xl mb-2 text-gray-900">Connexion</h1>
          <p className="text-gray-500">Accédez à votre espace de travail</p>
        </div>

        <form
          className="space-y-5"
          onSubmit={async (e) => {
            e.preventDefault();

            const form = e.target as HTMLFormElement;
            const email = (form.elements.namedItem("email") as HTMLInputElement).value;
            const password = (form.elements.namedItem("password") as HTMLInputElement).value;

            try {
              await fetch("http://localhost:8000/sanctum/csrf-cookie", {
                credentials: "include",
              });

              const res = await fetch("http://localhost:8000/api/login", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify({ email, password }),
                credentials: "include",
              });

              const data = await res.json();

              if (res.ok) {

                localStorage.setItem("token", data.token);
                localStorage.setItem("role", data.user.role);

                  if (data.force_password_change) {
                    setIsPasswordChange(true);
                  } else {
                    const role = data.user.role;
                    if (role === "MANAGER") {
                      window.location.href = "/dashboard/RH";
                    } else if (role === "rh") {
                      window.location.href = "/dashboard/document";
                    } else {
                      window.location.href = "/dashboardc/mesdocuments"; 
                    }
                  }
              } else {
                setLoginMessage(data.message || "Email ou mot de passe incorrect");
              }
            } catch (err) {
              alert("Erreur de connexion, vérifiez le serveur.");
              console.error(err);
            }
          }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse e-mail
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </span>
              <input
                type="email"
                name="email"
                placeholder="Entrez votre adresse email"
                className="w-full pl-10 px-4 py-3 bg-white border border-gray-200 rounded-lg
                  placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <input
                type="password"
                name="password"
                placeholder="Entrez votre mot de passe"
                className="w-full px-4 py-3 pl-10 bg-white border border-gray-200 rounded-lg
                  placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#1e293b] text-white py-3 rounded-lg hover:bg-[#0f172a] transition-colors flex items-center justify-center gap-2"
          >
            Se connecter
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>

          {loginMessage && (
            <p className="mt-3 text-center text-red-500 font-medium">
              {loginMessage}
            </p>
          )}
        </form>
      </div>
    </div>
  );


  const PasswordChangeForm = () => (
    <div className="w-1/2 bg-white flex flex-col items-center justify-center p-12">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-3xl mb-2 text-gray-900">Changer le mot de passe</h1>
          <p className="text-gray-500">Définissez votre nouveau mot de passe</p>
        </div>

        <form
          className="space-y-5"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const newPassword = (form.elements.namedItem("newPassword") as HTMLInputElement).value;
            const confirmPassword = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value;

            if (!newPassword || !confirmPassword) {
              alert("Veuillez remplir tous les champs");
              return;
            }

            if (newPassword !== confirmPassword) {
              alert("Les mots de passe ne correspondent pas !");
              return;
            }

            try {

              const token = localStorage.getItem("token");

              if (!token) {
                alert("Session expirée, veuillez vous reconnecter.");
                setIsPasswordChange(false);
                return;
              }

              await fetch("http://localhost:8000/sanctum/csrf-cookie", {
                credentials: "include",
              });


              const res = await fetch("http://localhost:8000/api/set-password", {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                  Authorization: `Bearer ${token}`, 
                },
                body: JSON.stringify({ 
                  new_password: newPassword, 
                  new_password_confirmation: confirmPassword  
                }),
              });

              const text = await res.text();
              console.log("Status:", res.status);
              console.log("Response text:", text);

              if (!res.ok) {
                alert("Erreur: " + text);
                return;
              }

              alert("Mot de passe changé avec succès !");
              localStorage.removeItem("token");
              window.location.href = "/dashboard/document";
            } catch (err) {
              console.error("Erreur complète:", err);
              alert("Erreur serveur, réessayez plus tard.");
            }
          }}
        >
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <input
                type="password"
                name="newPassword"
                placeholder="Entrez votre nouveau mot de passe"
                className="w-full px-4 py-3 pl-10 bg-gray-50 border border-gray-200 rounded-lg
                  placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirmez votre mot de passe"
                className="w-full px-4 py-3 pl-10 bg-gray-50 border border-gray-200 rounded-lg
                  placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#1e293b] text-white py-3 rounded-lg hover:bg-[#0f172a] transition-colors flex items-center justify-center gap-2"
          >
            Changer le mot de passe


            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );

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