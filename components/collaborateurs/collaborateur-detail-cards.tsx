// components/collaborateurs/collaborateur-detail-cards.tsx
"use client";

import { User, MapPin } from "lucide-react";
import { CollaborateurDetail } from "../../app/services/collaborateur.service";
import { formatDate } from "../../app/lib/utils";

interface CollaborateurDetailCardsProps {
  collaborateur: CollaborateurDetail;
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

export function CollaborateurDetailCards({ collaborateur }: CollaborateurDetailCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-5">
      {/* Card Identité */}
      <Card icon={User} title="Identité" color="bg-blue-100 text-blue-600">
        <InfoRow label="Nom" value={collaborateur.last_name} />
        <InfoRow label="Prénom" value={collaborateur.first_name} />
        <InfoRow label="Date de naissance" value="—" />
        <InfoRow label="N° Sécurité sociale" value="—" />
      </Card>

      {/* Card Adresse */}
      <Card icon={MapPin} title="Adresse" color="bg-emerald-100 text-emerald-600">
        <InfoRow label="Adresse complète" value="—" />
      </Card>
    </div>
  );
}