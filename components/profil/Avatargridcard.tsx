"use client";

import { useRef, useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Camera, Trash2, Loader2, Check, X } from "lucide-react";
import { getRoleGradient } from "../../app/lib/role-colors";

//  Types 

type Profil = {
  id: number;
  first_name: string;
  last_name: string;
  role: string | null;
  avatar_url: string | null;
};

//  API 

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

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

//  Helpers 

function getInitials(first: string, last: string): string {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

async function getCroppedImg(
  imageSrc: string,
  croppedAreaPixels: { x: number; y: number; width: number; height: number }
): Promise<File> {
  const image = new Image();
  image.src = imageSrc;
  await new Promise<void>((res) => { image.onload = () => res(); });
  const canvas = document.createElement("canvas");
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    image,
    croppedAreaPixels.x, croppedAreaPixels.y,
    croppedAreaPixels.width, croppedAreaPixels.height,
    0, 0,
    croppedAreaPixels.width, croppedAreaPixels.height
  );
  return new Promise((res) => {
    canvas.toBlob(
      (blob) => res(new File([blob!], "avatar.jpg", { type: "image/jpeg" })),
      "image/jpeg", 0.92
    );
  });
}

//  AvatarGridCard 

export function AvatarGridCard({
  profil,
  onAvatarChange,
}: {
  profil: Profil;
  onAvatarChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const gradient = getRoleGradient(profil.role ?? "");

  // Crop state
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number; y: number; width: number; height: number;
  } | null>(null);

  // Loading states
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imgError, setImgError] = useState(false);

  const showImage = profil.avatar_url && !imgError;

  // Fichier sélectionné → affiche le crop inline
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRawImage(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onCropComplete = useCallback(
    (_: unknown, pixels: { x: number; y: number; width: number; height: number }) => {
      setCroppedAreaPixels(pixels);
    },
    []
  );

  const handleConfirm = async () => {
    if (!rawImage || !croppedAreaPixels) return;
    setUploading(true);
    try {
      const file = await getCroppedImg(rawImage, croppedAreaPixels);
      const url = await uploadAvatar(file);
      onAvatarChange(url);
      setRawImage(null);
      setImgError(false);
    } catch {
      alert("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setRawImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await removeAvatar();
      onAvatarChange(null);
      setImgError(false);
    } catch {
      alert("Erreur suppression avatar");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">

      {/*  Titre  */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center">
            <Camera className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <h2 className="text-sm font-semibold text-slate-800">Photo de profil</h2>
        </div>

        {/* Actions (changer / supprimer) — visibles uniquement quand pas en mode crop */}
        {!rawImage && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading || deleting}
              className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
            >
              <Camera className="w-3 h-3" />
              {showImage ? "Changer" : "Ajouter"}
            </button>
            {showImage && (
              <button
                onClick={handleDelete}
                disabled={deleting || uploading}
                className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
              >
                {deleting
                  ? <Loader2 className="w-3 h-3 animate-spin" />
                  : <Trash2 className="w-3 h-3" />
                }
                Supprimer
              </button>
            )}
          </div>
        )}
      </div>

      {/*  Mode crop inline  */}
      {rawImage ? (
        <div className="flex flex-col gap-3">

          {/* Zone Cropper */}
          <div className="relative w-full h-56 rounded-xl overflow-hidden bg-slate-900">
            <Cropper
              image={rawImage}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          {/* Zoom slider */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide w-8">
              Zoom
            </span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-indigo-600"
            />
            <span className="text-[10px] text-slate-400 w-6 text-right">
              {zoom.toFixed(1)}×
            </span>
          </div>

          {/* Boutons Confirmer / Annuler */}
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={uploading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              disabled={uploading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-600 text-sm text-white hover:bg-indigo-700 transition-colors"
            >
              {uploading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Check className="w-3.5 h-3.5" />
              }
              Confirmer
            </button>
          </div>
        </div>

      ) : (

        /*  Aperçu avatar  */
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full border-2 border-slate-100 shadow overflow-hidden flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
            style={{ background: showImage ? "#e2e8f0" : gradient }}
          >
            {showImage ? (
              <img
                src={profil.avatar_url!}
                alt="avatar"
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <span>{getInitials(profil.first_name, profil.last_name)}</span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">
              {profil.first_name} {profil.last_name}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {showImage
                ? "Photo de profil active"
                : "Aucune photo — initiales affichées"}
            </p>
          </div>
        </div>
      )}

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