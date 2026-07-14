import { supabase } from "@/lib/supabase";
import type {
  Member,
  Organization,
} from "@/types/member";

export type NewMemberInput = {
  fullName: string;
  familyName: string;
  organization: Organization;
  recentConvert: boolean;
};

const MEMBER_COLUMNS = `
  id,
  full_name,
  family_name,
  organization,
  recent_convert,
  active,
  created_at
`;

export async function getActiveMembers(): Promise<Member[]> {
  const { data, error } = await supabase
    .from("members")
    .select(MEMBER_COLUMNS)
    .eq("active", true)
    .order("full_name", {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Member[];
}

export async function createMember(
  input: NewMemberInput,
): Promise<Member> {
  const { data, error } = await supabase
    .from("members")
    .insert({
      full_name: input.fullName,
      family_name: input.familyName.trim() || null,
      organization: input.organization,
      recent_convert: input.recentConvert,
      active: true,
    })
    .select(MEMBER_COLUMNS)
    .single();

  if (error || !data) {
    throw new Error(
      error?.message ||
        "Supabase no devolvió el miembro.",
    );
  }

  return data as Member;
}

export async function removeMember(
  memberId: string,
): Promise<void> {
  const { error } = await supabase
    .from("members")
    .delete()
    .eq("id", memberId);

  if (error) {
    throw new Error(error.message);
  }
}
