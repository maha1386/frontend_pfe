"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera, Trash2, Phone, Mail, Calendar, Shield,
  CheckCircle2, XCircle, Pencil, Check, X, Loader2,
  User, BadgeCheck,
} from "lucide-react";
import { getRoleGradient, getRoleBadgeClass } from "../../lib/role-colors";

// ─── Types ────────────────────────────────────────────────────────────────────

type Profil = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  date_of_hire: string | null;
  active: boolean;
  role: string | null;
  signature_path: string | null;
  avatar_url: string | null;
};

// ─── API ──────────────────────────────────────────────────────────────────────

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

async function fetchProfil(): Promise<Profil> {
  const res = await fetch(`${API}/profil`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  if (!res.ok) throw new Error("Erreur chargement profil");
  const data = await res.json();
  return data.profil;
}

async function patchTelephone(phone: string): Promise<string> {
  const res = await fetch(`${API}/profil/telephone`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ phone_number: phone }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Erreur mise à jour téléphone");
  }
  const data = await res.json();
  return data.phone_number;
}

async function uploadAvatar(file: File): Promise<string> {
  const form = new FormData();
  form.append("avatar", file);
  const res = await fetch(`${API}/profil/avatar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    body: form,
  });
  if (!res.ok) throw new Error("Erreur upload avatar");
  const data = await res.json();
  return data.avatar_url;
}

async function removeAvatar(): Promise<void> {
  const res = await fetch(`${API}/profil/avatar`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  if (!res.ok) throw new Error("Erreur suppression avatar");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(first: string, last: string): string {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function roleLabel(role: string | null): string {
  if (!role) return "—";
  const map: Record<string, string> = {
    rh: "RH",
    manager: "Manager",
    designer: "Designer",
    comptable: "Comptable",
    "développeur backend": "Dev Backend",
    "développeur frontend": "Dev Frontend",
    new_collaborateur: "Nouveau collaborateur",
  };
  return map[role.toLowerCase()] ?? role;
}

// ─── Avatar Component ─────────────────────────────────────────────────────────

function AvatarSection({
  profil,
  onAvatarChange,
}: {
  profil: Profil;
  onAvatarChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const gradient = getRoleGradient(profil.role ?? "");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadAvatar(file);
      onAvatarChange(url);
    } catch {
      alert("Erreur lors de l'upload");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await removeAvatar();
      onAvatarChange(null);
    } catch {
      alert("Erreur suppression avatar");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="relative group w-fit">
      {/* Avatar */}
      <div
        className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden"
        style={{ background: profil.avatar_url ? undefined : gradient }}
      >
        {profil.avatar_url ? (
          <img
            src={profil.avatar_url}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          getInitials(profil.first_name, profil.last_name)
        )}
      </div>

      {/* Overlay actions */}
      <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-indigo-50 transition-colors"
          title="Changer la photo"
        >
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
          ) : (
            <Camera className="w-3.5 h-3.5 text-indigo-600" />
          )}
        </button>
        {profil.avatar_url && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors"
            title="Supprimer la photo"
          >
            {deleting ? (
              <Loader2 className="w-3.5 h-3.5 text-red-500 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

// ─── Phone Edit ───────────────────────────────────────────────────────────────

function PhoneField({
  value,
  onSave,
}: {
  value: string | null;
  onSave: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(value ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await patchTelephone(input);
      onSave(updated);
      setEditing(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-700">{value ?? "—"}</span>
        <button
          onClick={() => { setInput(value ?? ""); setEditing(true); }}
          className="w-6 h-6 rounded-md bg-slate-100 hover:bg-indigo-50 flex items-center justify-center transition-colors"
        >
          <Pencil className="w-3 h-3 text-slate-500 hover:text-indigo-600" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="+21612345678"
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 w-44 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors"
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5 text-white" />
          )}
        </button>
        <button
          onClick={() => { setEditing(false); setError(null); }}
          className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors"
        >
          <X className="w-3.5 h-3.5 text-slate-500" />
        </button>
      </div>
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 py-3.5 border-b border-slate-50 last:border-0">
      <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
        {children}
      </div>
    </div>
  );
}

// ─── Signature Status ─────────────────────────────────────────────────────────

function SignatureStatus({ path }: { path: string | null }) {
  const signed = !!path;
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${signed ? "bg-green-50" : "bg-amber-50"}`}>
      {signed ? (
        <>
          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-green-700">Signature enregistrée</p>
            <p className="text-[10px] text-green-600">Votre signature est active</p>
          </div>
        </>
      ) : (
        <>
          <XCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-amber-700">Aucune signature</p>
            <p className="text-[10px] text-amber-600">Signez via le lien reçu par email</p>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilPage() {
  const [profil, setProfil] = useState<Profil | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfil()
      .then(setProfil)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
          <p className="text-sm text-slate-400">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error || !profil) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-slate-600 font-medium">Erreur de chargement</p>
          <p className="text-xs text-slate-400 mt-1">{error ?? "Profil indisponible"}</p>
        </div>
      </div>
    );
  }

  const { light, text } = getRoleBadgeClass(profil.role?.toLowerCase() ?? "");
  const gradient = getRoleGradient(profil.role ?? "");

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <main className="flex-1 px-8 py-6 max-w-4xl mx-auto w-full">

        {/* Header card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden mb-5 shadow-sm">
          {/* Banner */}
          <div className="h-24 w-full" style={{ background: gradient }} />

          {/* Profile header */}
          <div className="px-6 pb-6">
            <div className="flex items-end gap-5 -mt-12 mb-4">
              <AvatarSection
                profil={profil}
                onAvatarChange={(url) =>
                  setProfil((p) => p ? { ...p, avatar_url: url } : p)
                }
              />
              <div className="mb-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-semibold text-slate-900">
                    {profil.first_name} {profil.last_name}
                  </h1>
                  {profil.active ? (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                      Actif
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                      Inactif
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${light} ${text}`}>
                    {roleLabel(profil.role)}
                  </span>
                  <span className="text-xs text-slate-400">{profil.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">

          {/* Informations personnelles */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <h2 className="text-sm font-semibold text-slate-800">Informations personnelles</h2>
            </div>

            <InfoRow icon={Mail} label="Adresse email">
              <p className="text-sm text-slate-700">{profil.email}</p>
            </InfoRow>

            <InfoRow icon={Phone} label="Téléphone">
              <PhoneField
                value={profil.phone_number}
                onSave={(v) => setProfil((p) => p ? { ...p, phone_number: v } : p)}
              />
            </InfoRow>

            <InfoRow icon={Calendar} label="Date d'embauche">
              <p className="text-sm text-slate-700">{formatDate(profil.date_of_hire)}</p>
            </InfoRow>

            <InfoRow icon={Shield} label="Rôle">
              <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${light} ${text}`}>
                {roleLabel(profil.role)}
              </span>
            </InfoRow>
          </div>

          {/* Signature & Sécurité */}
          <div className="flex flex-col gap-5">

            {/* Signature */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <BadgeCheck className="w-3.5 h-3.5 text-indigo-500" />
                </div>
                <h2 className="text-sm font-semibold text-slate-800">Signature</h2>
              </div>

              <SignatureStatus path={profil.signature_path} />

              {profil.signature_path && (
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 mb-2 font-medium uppercase tracking-wide">
                    Aperçu
                  </p>
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/storage/${profil.signature_path}`}
                    alt="signature"
                    className="max-h-16 object-contain"
                  />
                </div>
              )}
            </div>

            {/* Statut du compte */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-indigo-500" />
                </div>
                <h2 className="text-sm font-semibold text-slate-800">Statut du compte</h2>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-xs text-slate-500">Compte</span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${profil.active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                    {profil.active ? "Actif" : "Inactif"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-xs text-slate-500">Signature</span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${profil.signature_path ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                    {profil.signature_path ? "Enregistrée" : "En attente"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-slate-500">Téléphone</span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${profil.phone_number ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                    {profil.phone_number ? "Renseigné" : "Manquant"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}