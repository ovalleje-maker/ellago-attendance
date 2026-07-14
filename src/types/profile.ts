export type UserRole =
  | "bishop"
  | "counselor"
  | "secretary"
  | "leader";

export type UserProfile = {
  id: string;
  full_name: string;
  role: UserRole;
  organization: string | null;
  created_at: string;
};

export function getRoleLabel(
  role: UserRole,
): string {
  const labels: Record<UserRole, string> = {
    bishop: "Obispo",
    counselor: "Consejero del Obispado",
    secretary: "Secretario",
    leader:
      "Líder de Organización",
  };

  return labels[role];
}