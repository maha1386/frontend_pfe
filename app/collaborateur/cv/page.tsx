"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload, FileText, CheckCircle, Loader2,
  User, Briefcase, GraduationCap, Wrench,
  Award, ChevronRight, X, Mail, Phone, Briefcase as BriefcaseIcon, Tag
} from "lucide-react";
import Image from "next/image";

type ExtractionStatus = "idle" | "uploading" | "extracting" | "done" | "error";

interface CvData {
  nom: string;
  email: string;
  telephone: string;
  poste: string;
  skills: string[];
  experience: string;
  education: string;
  interests: string[];
  projects: string[];
  certificat: string;
}

export default function CvUploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<ExtractionStatus>("idle");
  const [cvData, setCvData] = useState<CvData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status === "extracting") {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 90) { clearInterval(interval); return 90; }
          return p + Math.random() * 6;
        });
      }, 800);
      return () => clearInterval(interval);
    }
    if (status === "done") setProgress(100);
  }, [status]);

  const handleFile = (f: File) => {
    if (f.type !== "application/pdf") { setErrorMsg("Seuls les fichiers PDF sont acceptés."); return; }
    if (f.size > 10 * 1024 * 1024) { setErrorMsg("Le fichier ne doit pas dépasser 10 MB."); return; }
    setFile(f);
    setErrorMsg("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus("uploading");
    setErrorMsg("");
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      setStatus("extracting");
      const res = await fetch("http://127.0.0.1:5000/extract", { method: "POST", body: formData });
      if (!res.ok) { const err = await res.json().catch(() => null); throw new Error(err?.error || "Erreur extraction"); }
      const data = await res.json();
      setCvData(data);
      setStatus("done");
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur serveur");
      setStatus("error");
    }
  };

  const handleValidate = async () => {
    if (!cvData) return;
    setSaving(true);
    try {
      const res = await fetch("http://localhost:8000/api/cv/validate", {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ cv_data: cvData }),
      });
      if (!res.ok) throw new Error("Erreur sauvegarde");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.cv_data = cvData;
      localStorage.setItem("user", JSON.stringify(user));
      router.push("/dashboardc");
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  // ── IDLE / ERROR ────────────────────────────────────────────────────────────
  if (status === "idle" || status === "error") return (
    <div className="cv-bg cv-center" style={{ minHeight: "100vh", padding: "24px" }}>
      <style>{styles}</style>
      <div style={{ width: "100%", maxWidth: "500px" }}>
        <Logo />
        <Stepper />
        <div className="cv-card" style={{ padding: "40px" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div className="cv-icon-box" style={{ margin: "0 auto 16px" }}>
              <FileText size={26} color="white" />
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: "0 0 8px", fontFamily: "'DM Serif Display', Georgia, serif" }}>
              Importez votre CV
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0, lineHeight: 1.6 }}>
              Notre IA extrait automatiquement vos informations professionnelles
            </p>
          </div>

          <div
            className={`cv-dropzone ${dragOver ? "over" : ""} ${file ? "has-file" : ""}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input ref={inputRef} type="file" accept=".pdf" style={{ display: "none" }}
              onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
            {file ? (
              <div style={{ textAlign: "center" }}>
                <CheckCircle size={36} color="#10b981" style={{ margin: "0 auto 10px", display: "block" }} />
                <p style={{ fontWeight: 600, color: "#10b981", margin: "0 0 4px", fontSize: "14px" }}>{file.name}</p>
                <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>{(file.size / 1024).toFixed(0)} KB · Cliquez pour changer</p>
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <Upload size={32} color="#94a3b8" style={{ margin: "0 auto 10px", display: "block" }} />
                <p style={{ fontWeight: 600, color: "#334155", margin: "0 0 4px", fontSize: "14px" }}>Glissez votre CV ici</p>
                <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>PDF uniquement · max 10 MB</p>
              </div>
            )}
          </div>

          {errorMsg && <p style={{ color: "#ef4444", fontSize: "13px", textAlign: "center", marginBottom: "12px" }}>{errorMsg}</p>}

          <button className={`cv-btn-primary ${!file ? "disabled" : ""}`} onClick={handleUpload} disabled={!file}>
            Extraire avec l'IA
            <ChevronRight size={16} />
          </button>

          <button className="cv-btn-ghost" onClick={() => router.push("/dashboardc")}>
            Passer cette étape →
          </button>
        </div>
        <p style={{ textAlign: "center", fontSize: "11px", color: "#cbd5e1", marginTop: "20px" }}>© 2026 Maison du Web</p>
      </div>
    </div>
  );

  // ── EXTRACTING ──────────────────────────────────────────────────────────────
  if (status === "uploading" || status === "extracting") return (
    <div className="cv-bg cv-center" style={{ minHeight: "100vh" }}>
      <style>{styles}</style>
      <div className="cv-card" style={{ padding: "52px 44px", textAlign: "center", maxWidth: "400px", width: "100%", margin: "24px" }}>
        <div className="cv-spinner" style={{ margin: "0 auto 28px" }}>
          <Loader2 size={32} color="white" />
        </div>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a", margin: "0 0 8px", fontFamily: "'DM Serif Display', Georgia, serif" }}>
          {status === "uploading" ? "Envoi du fichier..." : "Analyse en cours..."}
        </h2>
        <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 32px", lineHeight: 1.6 }}>
          {status === "uploading" ? "Téléversement de votre CV..." : "YOLO détecte les zones · PaddleOCR lit le texte"}
        </p>
        <div className="cv-progress-track">
          <div className="cv-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "10px" }}>{Math.round(progress)}%</p>
      </div>
    </div>
  );

  // ── DONE ────────────────────────────────────────────────────────────────────
  if (status === "done" && cvData) return (
    <div className="cv-bg" style={{ minHeight: "100vh", padding: "32px 24px" }}>
      <style>{styles}</style>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
          <Logo />
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "20px", padding: "6px 16px" }}>
            <CheckCircle size={14} color="#10b981" />
            <span style={{ fontSize: "12px", color: "#10b981", fontWeight: 600 }}>Extraction réussie</span>
          </div>
        </div>

        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#0f172a", margin: "0 0 4px", fontFamily: "'DM Serif Display', Georgia, serif" }}>
          Vérifiez vos informations
        </h1>
        <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 28px" }}>
          Corrigez si nécessaire avant de valider
        </p>

        {/* ── GRILLE PRINCIPALE ── */}
        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "20px", alignItems: "start" }}>

          {/* Colonne gauche */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Carte identité */}
            <div className="cv-card" style={{ padding: "24px" }}>
              <SectionHeader icon={<User size={14} />} title="Identité" color="#4f46e5" />
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                <FieldEdit label="Nom complet" value={cvData.nom} icon="👤"
                  onChange={v => setCvData({ ...cvData, nom: v })} />
                <FieldEdit label="Poste" value={cvData.poste} icon="💼"
                  onChange={v => setCvData({ ...cvData, poste: v })} />
                <FieldEdit label="Email" value={cvData.email} icon="✉️"
                  onChange={v => setCvData({ ...cvData, email: v })} />
                <FieldEdit label="Téléphone" value={cvData.telephone} icon="📞"
                  onChange={v => setCvData({ ...cvData, telephone: v })} />
              </div>
            </div>

            {/* Compétences */}
            <div className="cv-card" style={{ padding: "24px" }}>
              <SectionHeader icon={<Wrench size={14} />} title="Compétences" color="#7c3aed" />
              <div style={{ marginTop: "16px" }}>
                <TagsEdit tags={cvData.skills} onChange={tags => setCvData({ ...cvData, skills: tags })} color="#7c3aed" />
              </div>
            </div>

            {/* Certifications */}
            {cvData.certificat && (
              <div className="cv-card" style={{ padding: "24px" }}>
                <SectionHeader icon={<Award size={14} />} title="Certifications" color="#d97706" />
                <div style={{ marginTop: "16px" }}>
                  <TextAreaEdit value={cvData.certificat} onChange={v => setCvData({ ...cvData, certificat: v })} rows={4} />
                </div>
              </div>
            )}

            {/* Intérêts */}
            {cvData.interests && cvData.interests.length > 0 && (
              <div className="cv-card" style={{ padding: "24px" }}>
                <SectionHeader icon={<Tag size={14} />} title="Intérêts" color="#0891b2" />
                <div style={{ marginTop: "16px" }}>
                  <TagsEdit tags={cvData.interests} onChange={tags => setCvData({ ...cvData, interests: tags })} color="#0891b2" />
                </div>
              </div>
            )}
          </div>

          {/* Colonne droite */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Expérience */}
            <div className="cv-card" style={{ padding: "24px" }}>
              <SectionHeader icon={<Briefcase size={14} />} title="Expérience professionnelle" color="#2563eb" />
              <div style={{ marginTop: "16px" }}>
                <TextAreaEdit value={cvData.experience} onChange={v => setCvData({ ...cvData, experience: v })} rows={10} />
              </div>
            </div>

            {/* Formation */}
            <div className="cv-card" style={{ padding: "24px" }}>
              <SectionHeader icon={<GraduationCap size={14} />} title="Formation" color="#059669" />
              <div style={{ marginTop: "16px" }}>
                <TextAreaEdit value={cvData.education} onChange={v => setCvData({ ...cvData, education: v })} rows={6} />
              </div>
            </div>

            {/* Projets */}
            {cvData.projects && cvData.projects.length > 0 && (
              <div className="cv-card" style={{ padding: "24px" }}>
                <SectionHeader icon={<FileText size={14} />} title="Projets" color="#7c3aed" />
                <div style={{ marginTop: "16px" }}>
                  <TagsEdit tags={cvData.projects} onChange={tags => setCvData({ ...cvData, projects: tags })} color="#7c3aed" />
                </div>
              </div>
            )}

            {/* Bouton valider */}
            {errorMsg && <p style={{ color: "#ef4444", fontSize: "13px", textAlign: "center" }}>{errorMsg}</p>}

            <button className={`cv-btn-primary ${saving ? "disabled" : ""}`} onClick={handleValidate} disabled={saving}
              style={{ marginTop: "4px" }}>
              {saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <CheckCircle size={16} />}
              {saving ? "Sauvegarde en cours..." : "Valider et accéder au tableau de bord"}
              {!saving && <ChevronRight size={16} />}
            </button>

          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: "11px", color: "#cbd5e1", margin: "28px 0 0" }}>© 2026 Maison du Web</p>
      </div>
    </div>
  );

  return null;
}

// ── Sous-composants ────────────────────────────────────────────────────────────

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
      <Image src="/images/maisonduweb_logo.jpg" alt="Logo" width={38} height={38} style={{ borderRadius: "10px" }} />
      <div>
        <p style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a", margin: 0 }}>Maison du Web</p>
        <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0 }}>Extraction intelligente de CV</p>
      </div>
    </div>
  );
}

function Stepper() {
  const steps = [
    { label: "Mot de passe", done: true },
    { label: "Signature", done: true },
    { label: "CV", done: false, active: true },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "24px" }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{
            width: "26px", height: "26px", borderRadius: "50%",
            background: step.done ? "#10b981" : step.active ? "#4f46e5" : "#e2e8f0",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            {step.done
              ? <CheckCircle size={14} color="white" />
              : <span style={{ fontSize: "11px", color: step.active ? "white" : "#94a3b8", fontWeight: 700 }}>{i + 1}</span>
            }
          </div>
          <span style={{ fontSize: "12px", color: step.active ? "#4f46e5" : step.done ? "#10b981" : "#94a3b8", fontWeight: step.active ? 600 : 400 }}>
            {step.label}
          </span>
          {i < 2 && <div style={{ width: "24px", height: "2px", background: step.done ? "#10b981" : "#e2e8f0", borderRadius: "2px" }} />}
        </div>
      ))}
    </div>
  );
}

function SectionHeader({ icon, title, color }: { icon: React.ReactNode; title: string; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>
      <div style={{
        width: "28px", height: "28px", borderRadius: "8px",
        background: `${color}15`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color,
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", margin: 0, letterSpacing: "0.3px" }}>{title}</h3>
    </div>
  );
}

function FieldEdit({ label, value, icon, onChange }: { label: string; value: string; icon: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label style={{ fontSize: "10px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
        <span>{icon}</span> {label}
      </label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        className="cv-input"
      />
    </div>
  );
}

function TextAreaEdit({ value, onChange, rows = 5 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={rows}
      className="cv-textarea"
    />
  );
}

function TagsEdit({ tags, onChange, color }: { tags: string[]; onChange: (tags: string[]) => void; color: string }) {
  const [input, setInput] = useState("");
  const addTag = () => {
    const t = input.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput("");
  };
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
        {tags.map((tag, i) => (
          <span key={i} style={{
            display: "inline-flex", alignItems: "center", gap: "4px",
            background: `${color}10`, border: `1px solid ${color}25`,
            borderRadius: "20px", padding: "3px 10px 3px 12px",
            fontSize: "12px", color, fontWeight: 500,
          }}>
            {tag}
            <button onClick={() => onChange(tags.filter((_, j) => j !== i))}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0, display: "flex", lineHeight: 1 }}>
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: "6px" }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
          placeholder="Ajouter..."
          className="cv-input"
          style={{ flex: 1, fontSize: "12px" }}
        />
        <button onClick={addTag} style={{
          padding: "8px 14px", borderRadius: "8px",
          background: color, color: "white", border: "none",
          fontSize: "12px", cursor: "pointer", fontWeight: 600, flexShrink: 0,
        }}>+</button>
      </div>
    </div>
  );
}

// ── CSS ────────────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  * { box-sizing: border-box; }

  .cv-bg {
    background: linear-gradient(145deg, #f8fafc 0%, #eef2ff 50%, #f0fdf4 100%);
    font-family: 'DM Sans', system-ui, sans-serif;
  }

  .cv-center {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cv-card {
    background: white;
    border-radius: 20px;
    box-shadow: 0 2px 20px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03);
  }

  .cv-icon-box {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 20px rgba(79,70,229,0.3);
  }

  .cv-dropzone {
    border: 2px dashed #e2e8f0;
    border-radius: 14px;
    padding: 32px 20px;
    cursor: pointer;
    background: #fafafa;
    transition: all 0.2s ease;
    margin-bottom: "18px";
  }

  .cv-dropzone:hover, .cv-dropzone.over {
    border-color: #4f46e5;
    background: #f5f3ff;
  }

  .cv-dropzone.has-file {
    border-color: #10b981;
    background: #f0fdf4;
  }

  .cv-btn-primary {
    width: 100%;
    padding: 14px 20px;
    border-radius: 12px;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: white;
    font-weight: 600;
    font-size: 14px;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 4px 16px rgba(79,70,229,0.3);
    transition: opacity 0.2s, transform 0.1s;
    font-family: 'DM Sans', sans-serif;
    margin-top: 16px;
  }

  .cv-btn-primary:hover:not(.disabled) {
    opacity: 0.92;
    transform: translateY(-1px);
  }

  .cv-btn-primary.disabled {
    background: #e2e8f0;
    color: #94a3b8;
    box-shadow: none;
    cursor: not-allowed;
  }

  .cv-btn-ghost {
    width: 100%;
    padding: 10px;
    background: none;
    border: none;
    color: #94a3b8;
    font-size: 13px;
    cursor: pointer;
    margin-top: 8px;
    font-family: 'DM Sans', sans-serif;
    transition: color 0.2s;
  }

  .cv-btn-ghost:hover { color: #64748b; }

  .cv-input {
    width: 100%;
    padding: 9px 12px;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    font-size: 13px;
    color: #0f172a;
    outline: none;
    font-family: 'DM Sans', sans-serif;
    transition: border-color 0.2s;
    background: #fafafa;
  }

  .cv-input:focus {
    border-color: #4f46e5;
    background: white;
  }

  .cv-textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    font-size: 13px;
    color: #334155;
    outline: none;
    resize: vertical;
    font-family: 'DM Sans', sans-serif;
    line-height: 1.7;
    background: #fafafa;
    transition: border-color 0.2s;
  }

  .cv-textarea:focus {
    border-color: #4f46e5;
    background: white;
  }

  .cv-spinner {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: spin 2s linear infinite;
    box-shadow: 0 6px 24px rgba(79,70,229,0.35);
  }

  .cv-progress-track {
    width: 100%;
    height: 6px;
    background: #f1f5f9;
    border-radius: 6px;
    overflow: hidden;
  }

  .cv-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #4f46e5, #7c3aed);
    border-radius: 6px;
    transition: width 0.8s ease;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;