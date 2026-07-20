import { supabase } from "@/lib/supabase";
import type {
  HistoricalAttendanceRow,
  HistoricalMeeting,
  MemberAttendanceHistory,
} from "@/types/attendance";
import type { Member } from "@/types/member";
import {
  getPreviousSundayDates,
} from "@/utils/dates";

type GetAttendanceHistoryParams = {
  members: Member[];
  endDate: string;
  numberOfWeeks?: number;
};

type AttendanceHistoryResult = {
  meetings: HistoricalMeeting[];
  histories: MemberAttendanceHistory[];
};

export async function getAttendanceHistory({
  members,
  endDate,
  numberOfWeeks = 8,
}: GetAttendanceHistoryParams): Promise<AttendanceHistoryResult> {
  const requestedDates = getPreviousSundayDates(
    endDate,
    numberOfWeeks,
  );

  if (
    requestedDates.length === 0 ||
    members.length === 0
  ) {
    return {
      meetings: [],
      histories: members.map((member) => ({
        memberId: member.id,
        attendedMeetings: 0,
        totalMeetings: 0,
        percentage: 0,
        consecutiveAbsences: 0,
        lastAttendanceDate: null,
        attendanceByDate: {},
      })),
    };
  }

  const {
  data: meetingsData,
  error: meetingsError,
} = await supabase
  .from("meetings")
  .select("id, meeting_date")
  .in("meeting_date", requestedDates)
  .order("meeting_date", {
    ascending: false,
  });

  if (meetingsError) {
    throw new Error(meetingsError.message);
  }

  const meetings =
    (meetingsData ?? []) as HistoricalMeeting[];

  if (meetings.length === 0) {
    return {
      meetings: [],
      histories: members.map((member) => ({
        memberId: member.id,
        attendedMeetings: 0,
        totalMeetings: 0,
        percentage: 0,
        consecutiveAbsences: 0,
        lastAttendanceDate: null,
        attendanceByDate: {},
      })),
    };
  }

  const meetingIds = meetings.map(
    (meeting) => meeting.id,
  );

  const memberIds = members.map(
    (member) => member.id,
  );

console.log("Miembros visibles para historial:", memberIds);
console.log("Reuniones visibles:", meetingIds);

  const {
    data: attendanceData,
    error: attendanceError,
  } = await supabase
    .from("attendance")
    .select(
      `
        meeting_id,
        member_id,
        present
      `,
    )
    .in("meeting_id", meetingIds)
    .in("member_id", memberIds)
    .eq("present", true);

    console.log("Asistencia histórica recibida:", attendanceData);

  if (attendanceError) {
    throw new Error(attendanceError.message);
  }

  const attendanceRows =
    (attendanceData ??
      []) as HistoricalAttendanceRow[];

  const meetingDateById = new Map(
    meetings.map((meeting) => [
      meeting.id,
      meeting.meeting_date,
    ]),
  );

  const attendanceByMember = new Map<
    string,
    Set<string>
  >();

  attendanceRows.forEach((row) => {
    const meetingDate = meetingDateById.get(
      row.meeting_id,
    );

    if (!meetingDate) return;

    const currentDates =
      attendanceByMember.get(row.member_id) ??
      new Set<string>();

    currentDates.add(meetingDate);

    attendanceByMember.set(
      row.member_id,
      currentDates,
    );
  });

  const histories = members.map(
    (member): MemberAttendanceHistory => {
          const attendedDates =
        attendanceByMember.get(member.id) ??
        new Set<string>();

      const existingMeetingDates = meetings.map(
        (meeting) => meeting.meeting_date,
      );

      const attendanceByDate: Record<
        string,
        boolean
      > = {};

      existingMeetingDates.forEach((date) => {
        attendanceByDate[date] =
          attendedDates.has(date);
      });

      const attendedMeetings =
        existingMeetingDates.filter((date) =>
          attendedDates.has(date),
        ).length;

const totalMeetings =
  existingMeetingDates.length;

      const percentage =
        totalMeetings === 0
          ? 0
          : Math.round(
              (attendedMeetings /
                totalMeetings) *
                100,
            );

      let consecutiveAbsences = 0;

      for (const date of existingMeetingDates) {
        if (attendedDates.has(date)) {
          break;
        }

        consecutiveAbsences += 1;
      }

      const lastAttendanceDate =
        existingMeetingDates.find((date) =>
          attendedDates.has(date),
        ) ?? null;

      return {
        memberId: member.id,
        attendedMeetings,
        totalMeetings,
        percentage,
        consecutiveAbsences,
        lastAttendanceDate,
        attendanceByDate,
      };
    },
  );

  return {
    meetings,
    histories,
  };
}