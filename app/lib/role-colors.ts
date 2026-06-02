// app/lib/role-colors.ts
// ─── Couleurs partagées entre dashboard et collaborateurs ─────────────────────

export const ROLE_COLORS: Record<string, {
  bg: string;        // Tailwind bg (badges, cards)
  text: string;      // Tailwind text
  light: string;     // Tailwind bg clair (hover, fond)
  hex: string;       // Hex pour recharts (graphiques)
  gradient: string;  // CSS gradient (header collaborateur)
}> = {
  rh: {
    bg:       "bg-blue-500",
    text:     "text-blue-700",
    light:    "bg-blue-100",
    hex:      "#3b82f6",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  },
  comptable: {
    bg:       "bg-amber-500",
    text:     "text-amber-700",
    light:    "bg-amber-100",
    hex:      "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  },
  designer: {
    bg:       "bg-pink-500",
    text:     "text-pink-700",
    light:    "bg-pink-100",
    hex:      "#ec4899",
    gradient: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
  },
  "développeur backend": {
    bg:       "bg-violet-500",
    text:     "text-violet-700",
    light:    "bg-violet-100",
    hex:      "#8b5cf6",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
  },
  "développeur frontend": {
    bg:       "bg-teal-500",
    text:     "text-teal-700",
    light:    "bg-teal-100",
    hex:      "#14b8a6",
    gradient: "linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)",
  },
  manager: {
    bg:       "bg-gray-700",
    text:     "text-gray-700",
    light:    "bg-gray-100",
    hex:      "#374151",
    gradient: "linear-gradient(135deg, #374151 0%, #111827 100%)",
  },
  // ✅ new_collaborateur — couleur rose/corail cohérente partout
  // (badge, pie chart, header collaborateur, activité récente)
  new_collaborateur: {
    bg:       "bg-rose-500",
    text:     "text-rose-700",
    light:    "bg-rose-100",
    hex:      "#f43f5e",
    gradient: "linear-gradient(135deg, #f43f5e 0%, #be123c 100%)",
  },
};

// ─── Fallback pour rôles inconnus ─────────────────────────────────────────────
const FALLBACK_HEXES = [
  "#6366f1", "#f97316", "#10b981", "#06b6d4",
  "#f43f5e", "#84cc16", "#a855f7", "#0ea5e9",
];

export function getRoleHex(role: string, index = 0): string {
  const key = role?.toLowerCase().trim();
  return ROLE_COLORS[key]?.hex ?? FALLBACK_HEXES[index % FALLBACK_HEXES.length];
}

export function getRoleGradient(role: string): string {
  const key = role?.toLowerCase().trim();
  if (ROLE_COLORS[key]) return ROLE_COLORS[key].gradient;

  // fallback hash-based pour rôles inconnus
  const hash = role.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hue  = hash % 360;
  return `linear-gradient(135deg, hsl(${hue}, 70%, 55%) 0%, hsl(${hue}, 60%, 40%) 100%)`;
}

export function getRoleBadgeClass(role: string): { bg: string; text: string; light: string } {
  const key = role?.toLowerCase().trim();
  if (ROLE_COLORS[key]) {
    return {
      bg:    ROLE_COLORS[key].bg,
      text:  ROLE_COLORS[key].text,
      light: ROLE_COLORS[key].light,
    };
  }
  return { bg: "bg-gray-400", text: "text-gray-600", light: "bg-gray-100" };
}