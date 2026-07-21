import { supabase } from "@/lib/supabase";
import type { AttendanceRow } from "@/types/navigation";

export async function getPresentMemberIds(
  meetingId: string,
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("attendance")
    .select("member_id")
    .eq("meeting_id", meetingId)
    .eq("present", true);

  if (error) {
    throw new Error(error.message);
  }

  const rows =
    (data ?? []) as AttendanceRow[];

  return new Set(
    rows.map((row) => row.member_id),
  );
}

export async function addAttendance(
  meetingId: string,
  memberId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from("attendance")
    .upsert(
      {
        meeting_id: meetingId,
        member_id: memberId,
        present: true,
        recorded_by: userId,
      },
      {
        onConflict:
          "meeting_id,member_id",
      },
    );

  if (error) {
    throw new Error(error.message);
  }
}

export async function addFamilyAttendance(
  meetingId: string,
  memberIds: string[],
  userId: string,
): Promise<void> {
  if (memberIds.length === 0) return;

  const records = memberIds.map(
    (memberId) => ({
      meeting_id: meetingId,
      member_id: memberId,
      present: true,
      recorded_by: userId,
    }),
  );

  const { error } = await supabase
  .from("attendance")
  .upsert(records, {
    onConflict:
      "meeting_id,member_id",
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function removeAttendance(
  meetingId: string,
  memberId: string,
): Promise<void> {
  const { error } = await supabase
    .from("attendance")
    .delete()
    .eq("meeting_id", meetingId)
    .eq("member_id", memberId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function removeFamilyAttendance(
  meetingId: string,
  memberIds: string[],
): Promise<void> {
  if (memberIds.length === 0) return;

  const { error } = await supabase
    .from("attendance")
    .delete()
    .eq("meeting_id", meetingId)
    .in("member_id", memberIds);

  if (error) {
    throw new Error(error.message);
  }
}

export async function clearAttendance(
  meetingId: string,
): Promise<void> {
  const { error } = await supabase
    .from("attendance")
    .delete()
    .eq("meeting_id", meetingId);

  if (error) {
    throw new Error(error.message);
  }
}