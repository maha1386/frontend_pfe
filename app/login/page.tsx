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
    document.title = "SmartOnboard – Plateforme intelligente d'intégration des collaborateurs";
  }, []);

  const redirectByRole = (
    role: string | undefined,
    signaturePath: string | null,
    cvData?: object | null
  ) => {
    console.log("=== redirectByRole ===", { role, signaturePath, cvData });

    const isCollaborateur = role === "new_collaborateur" || role === undefined;

    if (isCollaborateur) {
      if (!signaturePath) {
        router.push("/collaborateur/setup");  // 1ère fois : créer signature
      } else if (!cvData) {
        router.push("/collaborateur/cv");     // signature ok → upload CV
      } else {
        router.push("/dashboardc");           // tout ok → dashboard direct
      }
    } else if (role === "rh") {
      router.push("/dashboard");
    } else if (role === "manager") {
      router.push("/dashboardm");
    } else {
      router.push("/dashboard");
    }
  };

  const redirectAfterLogin = (data: {
    token: string;
    force_password_change: boolean;
    user: {
      role: { name: string } | string;
      signature_path: string | null;
      cv_data: object | null;
    };
  }) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    const role =
      typeof data.user.role === "string"
        ? data.user.role
        : data.user.role?.name;

    localStorage.setItem("role", role ?? "");

    console.log("=== redirectAfterLogin ROLE ===", role);
    console.log("=== force_password_change ===", data.force_password_change);
    console.log("=== signature_path ===", data.user.signature_path);
    console.log("=== cv_data ===", data.user.cv_data);

    if (data.force_password_change) {
      setIsPasswordChange(true);
      return;
    }

    redirectByRole(role, data.user.signature_path, data.user.cv_data);
  };

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
          Maison du Web est une agence d'ingénierie numérique spécialisée dans la création de
          solutions digitales innovantes et performantes.
        </p>
        <div className="space-y-6">
          {[
            { icon: Zap, title: "Performance optimale", desc: "Accédez à vos outils en un instant" },
            { icon: Shield, title: "Sécurité maximale", desc: "Vos données sont protégées 24/7" },
            { icon: Users, title: "Collaboration simplifiée", desc: "Travaillez en équipe efficacement" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#3d5aa3] flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg mb-1">{title}</h3>
                <p className="text-blue-200 text-sm">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="text-sm text-blue-300">© 2026 Maison du Web. Tous droits réservés.</div>
    </div>
  );

  const LoginForm = () => {
    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoginMessage("");
  const form = e.target as HTMLFormElement;
  const email = (form.elements.namedItem("email") as HTMLInputElement).value;
  const password = (form.elements.namedItem("password") as HTMLInputElement).value;

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (res.ok) {
      console.log("=== USER FROM LOGIN ===", data.user);
      console.log("=== ROLE (login) ===", data.user?.role);
      console.log("cv_data brut reçu :", JSON.stringify(data.user.cv_data)); 
      redirectAfterLogin(data);
    } else {
      setLoginMessage(data.message || "Email ou mot de passe incorrect");
    }
  } catch {
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

  const PasswordChangeForm = () => {
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const newPassword = (form.elements.namedItem("new_password") as HTMLInputElement).value;
      const confirm = (form.elements.namedItem("confirm_password") as HTMLInputElement).value;

      if (newPassword !== confirm) {
        setMsg("Les mots de passe ne correspondent pas");
        return;
      }
      if (newPassword.length < 8) {
        setMsg("Minimum 8 caractères");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/set-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            new_password: newPassword,
            new_password_confirmation: confirm,
          }),
        });
        const data = await res.json();

        if (res.ok) {
          const userRes = await fetch("/api/user", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          const freshUser = await userRes.json();

          console.log("=== FRESH USER (password) ===", freshUser);
          console.log("=== ROLE (password) ===", freshUser.role);
          console.log("=== signature_path (password) ===", freshUser.signature_path);
          console.log("=== cv_data (password) ===", freshUser.cv_data);

          localStorage.setItem("user", JSON.stringify(freshUser));

          const role =
            typeof freshUser.role === "string"
              ? freshUser.role
              : freshUser.role?.name;

          localStorage.setItem("role", role ?? "");
          redirectByRole(role, freshUser.signature_path, freshUser.cv_data);
        } else {
          setMsg(data.message || "Erreur lors du changement");
        }
      } catch {
        setMsg("Erreur serveur");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="w-1/2 bg-gray-50 flex flex-col items-center justify-center p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-4xl mb-2 text-gray-900">Nouveau mot de passe</h1>
            <p className="text-gray-500">Choisissez un mot de passe sécurisé pour continuer</p>
          </div>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                name="new_password"
                placeholder="Minimum 8 caractères"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                name="confirm_password"
                placeholder="Répétez le mot de passe"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1e293b] text-white py-3 rounded-lg hover:bg-[#0f172a] transition-colors disabled:opacity-60"
            >
              {loading ? "Enregistrement..." : "Valider"}
            </button>
            {msg && <p className="mt-3 text-center text-red-500 font-medium">{msg}</p>}
          </form>
        </div>
      </div>
    );
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