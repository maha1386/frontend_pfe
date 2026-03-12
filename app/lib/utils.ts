
export function formatDate(date: string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-FR");
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function getRoleColor(role: string): {
  gradient: string;
  light: string;
  text: string;
} {
  switch (role?.toLowerCase()) {
    case "manager":
      return {
        gradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
        light: "#fff7ed",
        text: "#ea580c",
      };
    case "rh":
      return {
        gradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
        light: "#fdf2f8",
        text: "#db2777",
      };
    case "new_collaborateur":
      return {
        gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
        light: "#eff6ff",
        text: "#2563eb",
      };
    case "designer":
      return {
        gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
        light: "#f5f3ff",
        text: "#7c3aed",
      };
    case "dev":
      return {
        gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        light: "#ecfdf5",
        text: "#059669",
      };
    default:
      return {
        gradient: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
        light: "#f9fafb",
        text: "#4b5563",
      };
  }
}