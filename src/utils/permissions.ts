type ProfileRole =
  | "bishop"
  | "counselor"
  | "secretary"
  | "leader";

type Role = ProfileRole | null | undefined;

/**
 * Puede registrar o modificar la asistencia.
 */
export function canManageAttendance(role: Role): boolean {
  return (
    role === "bishop" ||
    role === "counselor" ||
    role === "secretary" ||
    role === "leader"
  );
}

/**
 * Puede agregar y editar información de miembros.
 */
export function canManageMembers(role: Role): boolean {
  return role === "bishop" || role === "counselor";
}

/**
 * Puede desactivar o reactivar miembros.
 */
export function canChangeMemberStatus(role: Role): boolean {
  return role === "bishop" || role === "counselor";
}

/**
 * Puede ver la información general de todos los miembros.
 */
export function canViewAllMembers(role: Role): boolean {
  return (
    role === "bishop" ||
    role === "counselor" ||
    role === "secretary"
  );
}

/**
 * Puede ver el panel general del obispado.
 */
export function canViewBishopDashboard(role: Role): boolean {
  return role === "bishop" || role === "counselor";
}

/**
 * Determina si el usuario es un líder de organización.
 */
export function isOrganizationLeader(role: Role): boolean {
  return role === "leader";
}