import { supabase } from "@/lib/supabase";
import type { Meeting } from "@/types/navigation";

export async function getOrCreateMeeting(
  meetingDate: string,
): Promise<Meeting> {
  const {
    data: existingMeeting,
    error: searchError,
  } = await supabase
    .from("meetings")
    .select("id, meeting_date")
    .eq("meeting_date", meetingDate)
    .maybeSingle();

  if (searchError) {
    throw new Error(searchError.message);
  }

  if (existingMeeting) {
    return existingMeeting as Meeting;
  }

  const {
    data: createdMeeting,
    error: createError,
  } = await supabase
    .from("meetings")
    .insert({
      meeting_date: meetingDate,
      meeting_type: "sacrament",
    })
    .select("id, meeting_date")
    .single();

  if (createError || !createdMeeting) {
    throw new Error(
      createError?.message ||
        "Supabase no devolvió la reunión.",
    );
  }

  return createdMeeting as Meeting;
}