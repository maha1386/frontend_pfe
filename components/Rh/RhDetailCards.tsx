"use client";

import { User, Mail, Phone, Calendar } from "lucide-react";
import { RH } from "../../app/types/rh.types";
import { formatDate } from "../../app/lib/utils";

interface RhDetailCardsProps {
  rh: RH;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1 rounded-lg">
        {value || "—"}
      </span>
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  color,
  children,
}: {
  icon: React.ElementType;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-base font-bold text-gray-800">{title}</h3>
      </div>
      <div className="h-px bg-gray-100 mb-2" />
      {children}
    </div>
  );
}

export function RhDetailCards({ rh }: RhDetailCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-5">
      {/* Card Identité */}
      <Card icon={User} title="Identité" color="bg-pink-100 text-pink-600">
        <InfoRow label="Nom" value={rh.last_name} />
        <InfoRow label="Prénom" value={rh.first_name} />
        <InfoRow label="Email" value={rh.email} />
        <InfoRow label="Téléphone" value={rh.phone_number || "—"} />
      </Card>

      {/* Card Poste */}
      <Card icon={Calendar} title="Poste" color="bg-rose-100 text-rose-600">
        <InfoRow label="Date d'embauche" value={formatDate(rh.date_of_hire)} />
        <InfoRow label="Statut" value={rh.active ? "Actif" : "Inactif"} />
      </Card>
    </div>
  );
}