export type Organization =
  | "Cuórum de Élderes"
  | "Sociedad de Socorro"
  | "Hombres Jóvenes"
  | "Mujeres Jóvenes"
  | "Primaria"
  | "Otro";

export type Member = {
  id: string;
  full_name: string;
  family_name: string | null;
  organization: Organization;
  recent_convert: boolean;
  active: boolean;
  created_at: string;
};

export const ORGANIZATIONS: Organization[] = [
  "Cuórum de Élderes",
  "Sociedad de Socorro",
  "Hombres Jóvenes",
  "Mujeres Jóvenes",
  "Primaria",
  "Otro",
];