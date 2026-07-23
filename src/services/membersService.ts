import { supabase } from "@/lib/supabase";

import type {
  Member,
  Organization,
} from "@/types/member";

export type ImportMemberInput = {
  firstName: string;
  lastName: string;
  marriedLastName: string;
  familyName: string;
  organization: Organization;
  recentConvert: boolean;
  active: boolean;
};

function buildImportedMemberFullName(
  member: ImportMemberInput,
): string {
  const baseName = [
    member.firstName,
    member.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (!member.marriedLastName) {
    return baseName;
  }

  return `${baseName} de ${member.marriedLastName}`;
}

export type NewMemberInput = {
  fullName: string;

  first_name?: string | null;
  last_name?: string | null;
  married_last_name?: string | null;

  familyName: string;
  organization: Organization;
  recentConvert: boolean;
};

export type UpdateMemberInput = {
  fullName: string;

  first_name?: string | null;
  last_name?: string | null;
  married_last_name?: string | null;

  familyName: string;
  organization: Organization;
  recentConvert: boolean;
};

const MEMBER_COLUMNS = `
  id,
  full_name,
  first_name,
  last_name,
  married_last_name,
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
  const cleanFirstName =
  input.first_name?.trim() || null;

  const cleanLastName =
  input.last_name?.trim() || null;

  const cleanMarriedLastName =
  input.married_last_name?.trim() || null;

  if (!cleanName) {
    throw new Error(
      "El nombre completo es obligatorio.",
    );
  }

  const { data, error } = await supabase
    .from("members")
    .insert({
      full_name: cleanName,
      first_name: cleanFirstName,
last_name: cleanLastName,
married_last_name:
  cleanMarriedLastName,
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
      first_name: input.first_name ?? null,
      last_name: input.last_name ?? null,
      married_last_name: input.married_last_name ?? null,
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

export async function reactivateImportedMember(
  memberId: string,
  input: ImportMemberInput,
): Promise<Member> {
  const { data, error } =
    await supabase
      .from("members")
      .update({
        full_name:
          buildImportedMemberFullName(
            input,
          ),

        first_name:
          input.firstName.trim(),

        last_name:
          input.lastName.trim(),

        married_last_name:
          input.marriedLastName.trim() ||
          null,

        family_name:
          input.familyName.trim() ||
          null,

        organization:
          input.organization,

        recent_convert:
          input.recentConvert,

        active: true,
      })
      .eq("id", memberId)
      .select(MEMBER_COLUMNS)
      .single();

  if (error || !data) {
    throw new Error(
      error?.message ??
        "No fue posible reactivar el miembro importado.",
    );
  }

  return data as Member;
}

export async function importMembers(
  members: ImportMemberInput[],
): Promise<Member[]> {
  if (members.length === 0) {
    return [];
  }

  const memberRecords = members.map(
    (member) => ({
      full_name:
        buildImportedMemberFullName(
          member,
        ),

      first_name:
        member.firstName.trim(),

      last_name:
        member.lastName.trim(),

      married_last_name:
        member.marriedLastName.trim() ||
        null,

      family_name:
        member.familyName.trim() ||
        null,

      organization:
        member.organization,

      recent_convert:
        member.recentConvert,

      active:
        member.active,
    }),
  );

  const {
    data,
    error,
  } = await supabase
    .from("members")
    .insert(memberRecords)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Member[];
}

export type ProcessImportMemberInput = {
  member: ImportMemberInput;

  existingInactiveMemberId?: string;
};

export async function processMemberImport(
  rows: ProcessImportMemberInput[],
): Promise<Member[]> {
  const processedMembers: Member[] = [];

  for (const row of rows) {
    if (
      row.existingInactiveMemberId
    ) {
      const reactivatedMember =
        await reactivateImportedMember(
          row.existingInactiveMemberId,
          row.member,
        );

      processedMembers.push(
        reactivatedMember,
      );

      continue;
    }

    const importedMembers =
      await importMembers([
        row.member,
      ]);

    const importedMember =
      importedMembers[0];

    if (!importedMember) {
      throw new Error(
        "No fue posible obtener el miembro importado.",
      );
    }

    processedMembers.push(
      importedMember,
    );
  }

  return processedMembers;
}