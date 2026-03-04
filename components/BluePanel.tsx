"use client";

import { Zap, Shield, Users } from "lucide-react";
import Image from "next/image";

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
        Maison du Web est une agence d'ingénierie numérique spécialisée dans la création de solutions digitales innovantes et performantes.
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

export default BluePanel;