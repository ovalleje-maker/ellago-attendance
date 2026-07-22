import type { Member } from "@/types/member";

type MemberNameFields = Pick<
  Member,
  | "full_name"
  | "first_name"
  | "last_name"
  | "married_last_name"
>;

function normalizeNamePart(
  value: string | null | undefined,
): string {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

/**
 * Indica si el miembro ya tiene información
 * en la nueva estructura de nombres.
 */
export function hasStructuredName(
  member: MemberNameFields,
): boolean {
  return Boolean(
    normalizeNamePart(member.first_name) ||
      normalizeNamePart(member.last_name) ||
      normalizeNamePart(
        member.married_last_name,
      ),
  );
}

/**
 * Construye el nombre visible.
 *
 * Ejemplos:
 * Julio Enrique Ovalle Sierra
 * María Elena Ramírez Ramírez de Ovalle
 */
export function buildDisplayName(
  fields: MemberNameFields,
): string {
  const firstName = normalizeNamePart(
    fields.first_name,
  );

  const lastName = normalizeNamePart(
    fields.last_name,
  );

  const marriedLastName = normalizeNamePart(
    fields.married_last_name,
  );

  if (
    !firstName &&
    !lastName &&
    !marriedLastName
  ) {
    return normalizeNamePart(
      fields.full_name,
    );
  }

  const nameParts: string[] = [];

  if (firstName) {
    nameParts.push(firstName);
  }

  if (lastName) {
    nameParts.push(lastName);
  }

  if (marriedLastName) {
    nameParts.push(
      `de ${marriedLastName}`,
    );
  }

  return nameParts.join(" ");
}

/**
 * Devuelve el apellido que debe utilizarse
 * como principal para ordenar.
 *
 * Tiene prioridad el apellido de casada.
 */
export function getPrimaryLastName(
  fields: MemberNameFields,
): string {
  const marriedLastName = normalizeNamePart(
    fields.married_last_name,
  );

  if (marriedLastName) {
    return marriedLastName;
  }

  const lastName = normalizeNamePart(
    fields.last_name,
  );

  if (lastName) {
    return lastName;
  }

  return normalizeNamePart(
    fields.full_name,
  );
}

/**
 * Genera un texto pensado para ordenamiento.
 *
 * Ejemplos:
 * Ovalle, María Elena Ramírez Ramírez
 * Ovalle Sierra, Julio Enrique
 */
export function buildSortName(
  fields: MemberNameFields,
): string {
  const firstName = normalizeNamePart(
    fields.first_name,
  );

  const lastName = normalizeNamePart(
    fields.last_name,
  );

  const marriedLastName = normalizeNamePart(
    fields.married_last_name,
  );

  if (
    !firstName &&
    !lastName &&
    !marriedLastName
  ) {
    return normalizeNamePart(
      fields.full_name,
    );
  }

  const primaryLastName =
    marriedLastName || lastName;

  const remainingLastName =
    marriedLastName && lastName
      ? lastName
      : "";

  const secondaryParts = [
    firstName,
    remainingLastName,
  ].filter(Boolean);

  if (!primaryLastName) {
    return secondaryParts.join(" ");
  }

  if (secondaryParts.length === 0) {
    return primaryLastName;
  }

  return `${primaryLastName}, ${secondaryParts.join(
    " ",
  )}`;
}

/**
 * Compara dos miembros por su apellido principal.
 * Si el apellido coincide, usa el nombre visible.
 */
export function compareMembersByLastName(
  memberA: MemberNameFields,
  memberB: MemberNameFields,
): number {
  const primaryComparison =
    getPrimaryLastName(
      memberA,
    ).localeCompare(
      getPrimaryLastName(memberB),
      "es",
      {
        sensitivity: "base",
        numeric: true,
      },
    );

  if (primaryComparison !== 0) {
    return primaryComparison;
  }

  return buildDisplayName(
    memberA,
  ).localeCompare(
    buildDisplayName(memberB),
    "es",
    {
      sensitivity: "base",
      numeric: true,
    },
  );
}

/**
 * Compara dos miembros por nombre.
 */
export function compareMembersByFirstName(
  memberA: MemberNameFields,
  memberB: MemberNameFields,
): number {
  const firstNameA =
    normalizeNamePart(
      memberA.first_name,
    ) ||
    buildDisplayName(memberA);

  const firstNameB =
    normalizeNamePart(
      memberB.first_name,
    ) ||
    buildDisplayName(memberB);

  const firstNameComparison =
    firstNameA.localeCompare(
      firstNameB,
      "es",
      {
        sensitivity: "base",
        numeric: true,
      },
    );

  if (firstNameComparison !== 0) {
    return firstNameComparison;
  }

  return compareMembersByLastName(
    memberA,
    memberB,
  );
}