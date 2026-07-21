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
    .upsert(
      {
        meeting_date: meetingDate,
        meeting_type: "sacrament",
      },
      {
        onConflict: "meeting_date",
        ignoreDuplicates: true,
      },
    )
    .select("id, meeting_date")
    .maybeSingle();

  if (createError) {
    throw new Error(createError.message);
  }

  if (createdMeeting) {
    return createdMeeting as Meeting;
  }

  /*
   * Otra solicitud pudo haber creado
   * la reunión al mismo tiempo.
   */
  const {
    data: meetingAfterInsert,
    error: finalSearchError,
  } = await supabase
    .from("meetings")
    .select("id, meeting_date")
    .eq("meeting_date", meetingDate)
    .single();

  if (
    finalSearchError ||
    !meetingAfterInsert
  ) {
    throw new Error(
      finalSearchError?.message ||
        "Supabase no devolvió la reunión.",
    );
  }

  return meetingAfterInsert as Meeting;
}