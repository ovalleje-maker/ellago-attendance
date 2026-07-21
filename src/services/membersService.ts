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

export type UpdateMemberInput = {
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

export async function getActiveMembers(
  organization?: string | null,
): Promise<Member[]> {
  let query = supabase
    .from("members")
    .select(MEMBER_COLUMNS)
    .eq("active", true);

  if (organization) {
    query = query.eq(
      "organization",
      organization,
    );
  }

  const { data, error } = await query.order(
    "full_name",
    {
      ascending: true,
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Member[];
}

export async function getInactiveMembers(
  organization?: string | null,
): Promise<Member[]> {
  let query = supabase
    .from("members")
    .select(MEMBER_COLUMNS)
    .eq("active", false);

  if (organization) {
    query = query.eq(
      "organization",
      organization,
    );
  }

  const { data, error } = await query.order(
    "full_name",
    {
      ascending: true,
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Member[];
}

export async function createMember(
  input: NewMemberInput,
): Promise<Member> {
  const cleanName = input.fullName.trim();
  const cleanFamily = input.familyName.trim();

  if (!cleanName) {
    throw new Error(
      "El nombre completo es obligatorio.",
    );
  }

  const { data, error } = await supabase
    .from("members")
    .insert({
      full_name: cleanName,
      family_name: cleanFamily || null,
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

export async function updateMember(
  memberId: string,
  input: UpdateMemberInput,
): Promise<Member> {
  const cleanName = input.fullName.trim();
  const cleanFamily = input.familyName.trim();

  if (!cleanName) {
    throw new Error(
      "El nombre completo es obligatorio.",
    );
  }

  const { data, error } = await supabase
    .from("members")
    .update({
      full_name: cleanName,
      family_name: cleanFamily || null,
      organization: input.organization,
      recent_convert: input.recentConvert,
    })
    .eq("id", memberId)
    .select(MEMBER_COLUMNS)
    .single();

  if (error || !data) {
    throw new Error(
      error?.message ||
        "Supabase no devolvió el miembro actualizado.",
    );
  }

  return data as Member;
}

export async function deactivateMember(
  memberId: string,
): Promise<void> {
  const { error } = await supabase
    .from("members")
    .update({
      active: false,
    })
    .eq("id", memberId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function reactivateMember(
  memberId: string,
): Promise<void> {
  const { error } = await supabase
    .from("members")
    .update({
      active: true,
    })
    .eq("id", memberId);

  if (error) {
    throw new Error(error.message);
  }
}