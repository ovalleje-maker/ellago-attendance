export type Meeting = {
  id: string;
  meeting_date: string;
};

export type AttendanceRow = {
  member_id: string;
};

export type AppTab =
  | "dashboard"
  | "attendance"
  | "summary"
  | "members";