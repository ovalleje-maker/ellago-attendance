import { supabase } from "@/lib/supabase";

export type MemberAttendanceSummary = {
  totalMeetings: number;
  attendanceCount: number;
  absenceCount: number;
  attendancePercentage: number;
};

export type MemberAttendanceHistoryItem = {
  meetingId: string;
  meetingDate: string;
  status: "present" | "absent";
};

export async function getMemberAttendanceSummary(
  memberId: string,
): Promise<MemberAttendanceSummary> {
  const {
    count: totalMeetings,
    error: meetingsError,
  } = await supabase
    .from("meetings")
    .select("id", {
      count: "exact",
      head: true,
    });

  if (meetingsError) {
    throw new Error(
      `No se pudieron obtener las reuniones: ${meetingsError.message}`,
    );
  }

  const {
    count: attendanceCount,
    error: attendanceError,
  } = await supabase
    .from("attendance")
    .select("member_id", {
      count: "exact",
      head: true,
    })
    .eq("member_id", memberId);

  if (attendanceError) {
    throw new Error(
      `No se pudo obtener la asistencia del miembro: ${attendanceError.message}`,
    );
  }

  const safeTotalMeetings =
    totalMeetings ?? 0;

  const safeAttendanceCount =
    attendanceCount ?? 0;

  const absenceCount = Math.max(
  safeTotalMeetings -
    safeAttendanceCount,
  0,
);

  const attendancePercentage =
    safeTotalMeetings > 0
      ? Math.round(
          (safeAttendanceCount /
            safeTotalMeetings) *
            100,
        )
      : 0;

 return {
  totalMeetings:
    safeTotalMeetings,
  attendanceCount:
    safeAttendanceCount,
  absenceCount,
  attendancePercentage,
};
}

export async function getMemberAttendanceHistory(
  memberId: string,
): Promise<MemberAttendanceHistoryItem[]> {
  const {
    data: meetings,
    error: meetingsError,
  } = await supabase
    .from("meetings")
    .select(`
      id,
      meeting_date
    `)
    .order("meeting_date", {
      ascending: false,
    });

  if (meetingsError) {
    throw new Error(
      `No se pudieron obtener las reuniones: ${meetingsError.message}`,
    );
  }

  const {
    data: attendanceRows,
    error: attendanceError,
  } = await supabase
    .from("attendance")
    .select("meeting_id")
    .eq("member_id", memberId);

  if (attendanceError) {
    throw new Error(
      `No se pudo obtener el historial del miembro: ${attendanceError.message}`,
    );
  }

  const attendedMeetingIds =
    new Set(
      (attendanceRows ?? [])
        .map(
          (attendanceRow) =>
            attendanceRow.meeting_id,
        )
        .filter(
          (
            meetingId,
          ): meetingId is string =>
            Boolean(meetingId),
        ),
    );

  return (meetings ?? [])
    .filter(
      (meeting) =>
        Boolean(
          meeting.id &&
            meeting.meeting_date,
        ),
    )
    .map((meeting) => ({
      meetingId: meeting.id,
      meetingDate:
        meeting.meeting_date,
      status:
        attendedMeetingIds.has(
          meeting.id,
        )
          ? "present"
          : "absent",
    }));
}