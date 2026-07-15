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

export type Meeting = {
  id: string;
  meeting_date: string;
};

export type AttendanceRow = {
  member_id: string;
};

export type HistoricalMeeting = {
  id: string;
  meeting_date: string;
};

export type HistoricalAttendanceRow = {
  meeting_id: string;
  member_id: string;
  present: boolean;
};

export type MemberAttendanceHistory = {
  memberId: string;
  attendedMeetings: number;
  totalMeetings: number;
  percentage: number;
  consecutiveAbsences: number;
  lastAttendanceDate: string | null;
  attendanceByDate: Record<string, boolean>;
};