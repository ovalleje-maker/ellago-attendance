"use client";

import {
  type ChangeEvent,
  useMemo,
  useState,
} from "react";

import Papa, {
  type ParseError,
} from "papaparse";

import {
  ORGANIZATIONS,
  type Member,
  type Organization,
} from "@/types/member";

import {
  processMemberImport,
} from "@/services/membersService";

type CsvMemberRow = {
  first_name?: string;
  last_name?: string;
  married_last_name?: string;
  family_name?: string;
  organization?: string;
  recent_convert?: string;
  active?: string;
};

type ImportMembersCsvProps = {
  members: Member[];

  onMembersImported?: (
    importedMembers: Member[],
  ) => void;
};

type ValidatedCsvMemberRow = {
  rowNumber: number;
  firstName: string;
  lastName: string;
  marriedLastName: string;
  familyName: string;
  organization: string;
  recentConvert: string;
  active: string;

  errors: string[];
  warnings: string[];

  isValid: boolean;

  isPossibleDatabaseDuplicate: boolean;
  matchingMember: Member | null;

  isInactiveDatabaseMatch: boolean;
  inactiveMatchingMember: Member | null;
};

const REQUIRED_HEADERS = [
  "first_name",
  "last_name",
  "married_last_name",
  "family_name",
  "organization",
  "recent_convert",
  "active",
] as const;

function normalizeText(
  value: string,
) {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .trim()
    .toLowerCase();
}

function findOrganization(
  value: string,
): Organization | null {
  const normalizedValue =
    normalizeText(value);

  const organization =
    ORGANIZATIONS.find(
      (item) =>
        normalizeText(item) ===
        normalizedValue,
    );

  return organization ?? null;
}

function isValidBoolean(
  value: string,
) {
  return (
    value === "true" ||
    value === "false"
  );
}

function buildDuplicateKey(
  row: CsvMemberRow,
): string {
  return [
    normalizeText(
      row.first_name ?? "",
    ),
    normalizeText(
      row.last_name ?? "",
    ),
    normalizeText(
      row.married_last_name ?? "",
    ),
    normalizeText(
      row.family_name ?? "",
    ),
  ].join("|");
}

function normalizeIdentityPart(
  value: string | null | undefined,
): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function buildIdentityKey(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  marriedLastName:
    | string
    | null
    | undefined,
): string {
  return [
    normalizeIdentityPart(firstName),
    normalizeIdentityPart(lastName),
    normalizeIdentityPart(
      marriedLastName,
    ),
  ].join("|");
}

function getMemberDisplayName(
  member: Member,
): string {
  return [
    member.first_name,
    member.last_name,
    member.married_last_name,
  ]
    .filter(
      (name): name is string =>
        typeof name === "string" &&
        name.trim().length > 0,
    )
    .join(" ")
    .trim();
}


async function readCsvFile(
  file: File,
): Promise<string> {
  const buffer =
    await file.arrayBuffer();

  const utf8Decoder =
    new TextDecoder("utf-8", {
      fatal: false,
    });

  const utf8Text =
    utf8Decoder.decode(buffer);

  /*
   * El carácter � aparece cuando el
   * archivo no pudo interpretarse
   * correctamente como UTF-8.
   */
  if (!utf8Text.includes("�")) {
    return utf8Text;
  }

  /*
   * Muchos CSV creados por Excel en
   * Windows utilizan Windows-1252.
   */
  const windowsDecoder =
    new TextDecoder(
      "windows-1252",
    );

  return windowsDecoder.decode(
    buffer,
  );
}

function validateRows(
  csvRows: CsvMemberRow[],
): ValidatedCsvMemberRow[] {
  const seenMemberKeys =
  new Set<string>();

  return csvRows.map(
    (row, index) => {
      const firstName =
        row.first_name?.trim() ??
        "";

      const lastName =
        row.last_name?.trim() ??
        "";

      const marriedLastName =
        row.married_last_name?.trim() ??
        "";

      const familyName =
        row.family_name?.trim() ??
        "";

      const organization =
        row.organization?.trim() ??
        "";

      const validOrganization =
        organization
          ? findOrganization(
        organization,
      )
    : null;

      const recentConvert =
        row.recent_convert
          ?.trim()
          .toLowerCase() ?? "";

      const active =
        row.active
          ?.trim()
          .toLowerCase() ?? "";

      const errors: string[] =
  [];

  const memberKey = [
        firstName,
        lastName,
        marriedLastName,
    ]
  .map((value) =>
    value
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        "",
      )
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim(),
  )
  .join("|");

  const canCheckCsvDuplicate =
  Boolean(firstName && lastName);

const isDuplicateInCsv =
  canCheckCsvDuplicate &&
  seenMemberKeys.has(memberKey);

if (isDuplicateInCsv) {
  errors.push(
    "El miembro está duplicado dentro del archivo.",
  );
}

if (
  canCheckCsvDuplicate &&
  !isDuplicateInCsv
) {
  seenMemberKeys.add(memberKey);
}

      if (!firstName) {
        errors.push(
          "Falta el nombre.",
        );
      }

      if (!lastName) {
        errors.push(
          "Falta el apellido.",
        );
      }

      if (!organization) {
  errors.push(
    "Falta la organización.",
  );
} else if (
  !validOrganization
) {
  errors.push(
    `La organización "${organization}" no es válida.`,
  );
}

      if (!recentConvert) {
        errors.push(
          "Falta indicar si es converso reciente.",
        );
      } else if (
        !isValidBoolean(
          recentConvert,
        )
      ) {
        errors.push(
          'Converso reciente debe ser "true" o "false".',
        );
      }

      if (!active) {
        errors.push(
          "Falta indicar si está activo.",
        );
      } else if (
        !isValidBoolean(active)
      ) {
        errors.push(
          'Activo debe ser "true" o "false".',
        );
      }

      return {
        rowNumber: index + 2,
        firstName,
        lastName,
        marriedLastName,
        familyName,
        organization:
            validOrganization ??
            organization,
        recentConvert,
        active,
        errors,
        warnings: [],
        isValid:
          errors.length === 0,
          isPossibleDatabaseDuplicate:
            false,
        matchingMember: null,
        isInactiveDatabaseMatch: false,
        inactiveMatchingMember: null,
      };
    },
  );
}

function findDatabaseDuplicates(
  validatedRows: ValidatedCsvMemberRow[],
  existingMembers: Member[],
): ValidatedCsvMemberRow[] {
const existingMembersMap = new Map<
  string,
  Member[]
>();

existingMembers.forEach((member) => {
  const identityKey = buildIdentityKey(
    member.first_name,
    member.last_name,
    member.married_last_name,
  );

  const currentMatches =
    existingMembersMap.get(identityKey) ??
    [];

  existingMembersMap.set(
    identityKey,
    [
      ...currentMatches,
      member,
    ],
  );
});

  return validatedRows.map((row) => {
    /*
     * No comprobamos duplicados en la base
     * de datos cuando la fila ya contiene
     * errores de validación.
     */
    if (!row.isValid) {
      return row;
    }

    const identityKey = buildIdentityKey(
      row.firstName,
      row.lastName,
      row.marriedLastName,
    );

const databaseMatches =
  existingMembersMap.get(identityKey) ??
  [];

const matchingMember =
  databaseMatches[0] ?? null;

if (!matchingMember) {
  return {
    ...row,
    warnings: [],
    isPossibleDatabaseDuplicate: false,
    matchingMember: null,
    isInactiveDatabaseMatch: false,
    inactiveMatchingMember: null,
  };
}

const isInactiveMatch =
  matchingMember.active === false;

const isActiveMatch =
  !isInactiveMatch;

return {
  ...row,

  warnings: isInactiveMatch
    ? [
        `Este miembro ya existe, pero está inactivo: "${getMemberDisplayName(
          matchingMember,
        )}".`,
      ]
    : [
        `Posible duplicado: ya existe "${getMemberDisplayName(
          matchingMember,
        )}" en la base de datos.`,
      ],

  isPossibleDatabaseDuplicate:
    isActiveMatch,

  matchingMember:
    isActiveMatch
      ? matchingMember
      : null,

  isInactiveDatabaseMatch:
    isInactiveMatch,

  inactiveMatchingMember:
    isInactiveMatch
      ? matchingMember
      : null,
};
  });
}

export default function ImportMembersCsv({
  members,
  onMembersImported,
}: ImportMembersCsvProps) {
  const [fileName, setFileName] =
    useState("");

    const [
  approvedDuplicateRows,
  setApprovedDuplicateRows,
] = useState<Set<number>>(
  () => new Set(),
);

  const [
    rowsToReactivate,
    setRowsToReactivate,
  ] = useState<Set<number>>(
    new Set(),
  );

  const [rawRows, setRawRows] =
    useState<CsvMemberRow[]>([]);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    parseErrors,
    setParseErrors,
  ] = useState<ParseError[]>(
    [],
  );

  const [
  importingMembers,
  setImportingMembers,
] = useState(false);

const [
  importError,
  setImportError,
] = useState("");

const [
  importSuccess,
  setImportSuccess,
] = useState("");

  const locallyValidatedRows =
  useMemo(
    () =>
      validateRows(rawRows),
    [rawRows],
  );

const validatedRows =
  useMemo(
    () =>
      findDatabaseDuplicates(
        locallyValidatedRows,
        members,
      ),
    [
      locallyValidatedRows,
      members,
    ],
  );

  const validRows =
    useMemo(
      () =>
        validatedRows.filter(
          (row) => row.isValid,
        ),
      [validatedRows],
    );

  const invalidRows =
    useMemo(
      () =>
        validatedRows.filter(
          (row) => !row.isValid,
        ),
      [validatedRows],
    );

const possibleDuplicateRows =
  useMemo(
    () =>
      validatedRows.filter(
        (row) =>
          row.isValid &&
          row.isPossibleDatabaseDuplicate,
      ),
    [validatedRows],
  );

  const inactiveMatchRows =
  useMemo(
    () =>
      validatedRows.filter(
        (row) =>
          row.isInactiveDatabaseMatch,
      ),
    [validatedRows],
  );

const rowsReadyToImport =
  useMemo(
    () =>
      validatedRows.filter(
        (row) =>
          row.isValid &&
          (
            !row.isPossibleDatabaseDuplicate ||
            approvedDuplicateRows.has(
              row.rowNumber,
            )
          ),
      ),
    [
      validatedRows,
      approvedDuplicateRows,
    ],
  );

function resetImport() {
  setFileName("");
  setRawRows([]);
  setErrorMessage("");
  setParseErrors([]);

  setImportError("");
  setImportSuccess("");

  setApprovedDuplicateRows(
    new Set(),
  );

  setRowsToReactivate(
    new Set(),
  );
}

function toggleDuplicateApproval(
  rowNumber: number,
) {
  setApprovedDuplicateRows(
    (currentRows) => {
      const updatedRows =
        new Set(currentRows);

      if (
        updatedRows.has(
          rowNumber,
        )
      ) {
        updatedRows.delete(
          rowNumber,
        );
      } else {
        updatedRows.add(
          rowNumber,
        );
      }

      return updatedRows;
    },
  );
}

function toggleReactivation(
  rowNumber: number,
) {
  setRowsToReactivate(
    (currentRows) => {
      const updatedRows =
        new Set(currentRows);

      if (
        updatedRows.has(
          rowNumber,
        )
      ) {
        updatedRows.delete(
          rowNumber,
        );
      } else {
        updatedRows.add(
          rowNumber,
        );
      }

      return updatedRows;
    },
  );
}

  async function handleFileChange(
  event: ChangeEvent<HTMLInputElement>,
) {
    const file =
      event.target.files?.[0];

    resetImport();

    if (!file) {
      return;
    }

    const isCsvFile =
      file.name
        .toLowerCase()
        .endsWith(".csv");

    if (!isCsvFile) {
      setErrorMessage(
        "Selecciona un archivo con extensión .csv.",
      );

      event.target.value = "";
      return;
    }

    setFileName(file.name);

let csvText = "";

try {
  csvText =
    await readCsvFile(file);
} catch {
  setFileName("");

  setErrorMessage(
    "No fue posible leer el archivo CSV.",
  );

  event.target.value = "";
  return;
}

Papa.parse<CsvMemberRow>(
  csvText,
  {
        header: true,

        skipEmptyLines:
          "greedy",

        transformHeader: (
          header,
        ) =>
          header
            .replace(
              /^\uFEFF/,
              "",
            )
            .trim()
            .toLowerCase(),

        transform: (value) =>
          value.trim(),

        complete: (
          results,
        ) => {
          const headers =
            results.meta
              .fields ?? [];

          const missingHeaders =
            REQUIRED_HEADERS.filter(
              (
                requiredHeader,
              ) =>
                !headers.includes(
                  requiredHeader,
                ),
            );

          if (
            missingHeaders.length >
            0
          ) {
            setRawRows([]);

            setErrorMessage(
              `El archivo no contiene las siguientes columnas: ${missingHeaders.join(
                ", ",
              )}.`,
            );

            return;
          }

          setRawRows(
            results.data,
          );

          setParseErrors(
            results.errors,
          );
        },

        error: (error: Error) => {
          setRawRows([]);

          setErrorMessage(
            `No fue posible leer el archivo: ${error.message}`,
          );
        },
      },
    );
  }

async function handleImportMembers() {
  if (importingMembers) {
    return;
  }

  setImportError("");
  setImportSuccess("");

  if (invalidRows.length > 0) {
    setImportError(
      "Corrige las filas con errores antes de importar.",
    );

    return;
  }

  /*
   * Miembros nuevos y duplicados activos
   * aprobados manualmente.
   *
   * Excluimos aquí las coincidencias inactivas,
   * porque se procesarán como reactivaciones.
   */
  const rowsToCreate =
    rowsReadyToImport.filter(
      (row) =>
        !row.isInactiveDatabaseMatch,
    );

  /*
   * Miembros inactivos que el usuario
   * seleccionó para reactivar.
   */
  const inactiveRowsToReactivate =
    inactiveMatchRows.filter(
      (row) =>
        rowsToReactivate.has(
          row.rowNumber,
        ) &&
        row.inactiveMatchingMember !==
          null,
    );

  const totalRowsToProcess =
    rowsToCreate.length +
    inactiveRowsToReactivate.length;

  if (totalRowsToProcess === 0) {
    setImportError(
      "No hay miembros listos para importar o reactivar.",
    );

    return;
  }

  const confirmed = window.confirm(
    [
      `Se procesarán ${totalRowsToProcess} miembro(s).`,
      "",
      `Nuevos por importar: ${rowsToCreate.length}`,
      `Miembros por reactivar: ${inactiveRowsToReactivate.length}`,
      "",
      "¿Deseas continuar?",
    ].join("\n"),
  );

  if (!confirmed) {
    return;
  }

  setImportingMembers(true);

  try {
    const processedMembers =
      await processMemberImport([
        /*
         * Miembros que deben crearse
         * como nuevos registros.
         */
        ...rowsToCreate.map(
          (row) => ({
            member: {
              firstName:
                row.firstName,

              lastName:
                row.lastName,

              marriedLastName:
                row.marriedLastName,

              familyName:
                row.familyName,

              organization:
                row.organization as Organization,

              recentConvert:
                row.recentConvert ===
                "true",

              active:
                row.active ===
                "true",
            },
          }),
        ),

        /*
         * Miembros existentes que deben
         * actualizarse y reactivarse.
         */
        ...inactiveRowsToReactivate.map(
          (row) => ({
            member: {
              firstName:
                row.firstName,

              lastName:
                row.lastName,

              marriedLastName:
                row.marriedLastName,

              familyName:
                row.familyName,

              organization:
                row.organization as Organization,

              recentConvert:
                row.recentConvert ===
                "true",

              active: true,
            },

            existingInactiveMemberId:
              row
                .inactiveMatchingMember!
                .id,
          }),
        ),
      ]);

    onMembersImported?.(
      processedMembers,
    );

    setImportSuccess(
      [
        `Se procesaron correctamente ${processedMembers.length} miembro(s).`,
        `${rowsToCreate.length} importado(s) y ${inactiveRowsToReactivate.length} reactivado(s).`,
      ].join(" "),
    );

    setRawRows([]);

    setApprovedDuplicateRows(
      new Set(),
    );

    setRowsToReactivate(
  new Set(),
);
    
  } catch (error) {
    console.error(
      "Error importando miembros:",
      error,
    );

    setImportError(
      error instanceof Error
        ? `No fue posible procesar los miembros: ${error.message}`
        : "No fue posible procesar los miembros.",
    );
  } finally {
    setImportingMembers(false);
  }
}

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">
          Importar miembros
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          Selecciona un archivo
          CSV para validar los
          registros antes de
          importarlos.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 p-4">
        <label
          htmlFor="members-csv"
          className="mb-2 block text-sm font-medium"
        >
          Archivo CSV
        </label>

        <input
          id="members-csv"
          type="file"
          accept=".csv,text/csv"
          onChange={
            handleFileChange
          }
          className="block w-full text-sm"
        />

        {fileName && (
          <p className="mt-3 text-sm text-gray-600">
            Archivo
            seleccionado:{" "}
            <span className="font-medium">
              {fileName}
            </span>
          </p>
        )}
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {importError && (
  <div
    role="alert"
    className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700"
  >
    {importError}
  </div>
)}

{importSuccess && (
  <div
    role="status"
    className="rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-700"
  >
    {importSuccess}
  </div>
)}

      {parseErrors.length >
        0 && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4">
          <p className="font-medium text-yellow-800">
            Se encontraron{" "}
            {
              parseErrors.length
            }{" "}
            advertencia(s) al leer
            el archivo.
          </p>

          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-yellow-700">
            {parseErrors
              .slice(0, 5)
              .map(
                (
                  error,
                  index,
                ) => (
                  <li
                    key={`${error.code}-${index}`}
                  >
                    Fila{" "}
                    {typeof error.row ===
                    "number"
                      ? error.row +
                        2
                      : "desconocida"}
                    :{" "}
                    {
                      error.message
                    }
                  </li>
                ),
              )}
          </ul>
        </div>
      )}

      {validatedRows.length >
        0 && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">
                Total de filas
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {
                  validatedRows.length
                }
              </p>
            </div>

            <div className="rounded-lg border border-green-300 bg-green-50 p-4">
              <p className="text-sm text-green-700">
                Listas para importar
              </p>

              <p className="mt-1 text-2xl font-semibold text-green-800">
                {rowsReadyToImport.length}
              </p>
            </div>

            <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
                <p className="text-sm text-amber-700">
                    Posibles duplicados
                </p>

                <p className="mt-1 text-2xl font-semibold text-amber-800">
                    {possibleDuplicateRows.length}
                </p>
            </div>

            <div className="rounded-lg border border-blue-300 bg-blue-50 p-4">
              <p className="text-sm text-blue-700">
                Miembros inactivos
              </p>

              <p className="mt-1 text-2xl font-semibold text-blue-800">
                {inactiveMatchRows.length}
              </p>
            </div>

            <div className="rounded-lg border border-red-300 bg-red-50 p-4">
              <p className="text-sm text-red-700">
                Filas con errores
              </p>

              <p className="mt-1 text-2xl font-semibold text-red-800">
                {
                  invalidRows.length
                }
              </p>
            </div>
          </div>
          
          {invalidRows.length >
            0 && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-4">
              <p className="font-medium text-red-800">
                El archivo contiene
                errores.
              </p>

              <p className="mt-1 text-sm text-red-700">
                Corrige las filas
                marcadas antes de
                realizar la
                importación.
              </p>
            </div>
          )}

          {invalidRows.length === 0 &&
          possibleDuplicateRows.length === 0 && (
            <div className="rounded-lg border border-green-300 bg-green-50 p-4">
                <p className="font-medium text-green-800">
                    El archivo está listo para importar.
                </p>

    <p className="mt-1 text-sm text-green-700">
      No se encontraron errores ni posibles
      duplicados en la base de datos.
    </p>
  </div>
)}

{invalidRows.length === 0 &&
possibleDuplicateRows.length > 0 && (
  <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
    <p className="font-medium text-amber-800">
      Se encontraron posibles duplicados.
    </p>

    <p className="mt-1 text-sm text-amber-700">
      Los posibles duplicados no serán incluidos
      automáticamente en la importación.
    </p>
  </div>
)}

<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
  <p className="text-sm text-gray-600">
    Se importarán{" "}
    <span className="font-semibold text-gray-900">
      {rowsReadyToImport.length}
    </span>{" "}
    miembro(s).
  </p>

  <button
    type="button"
    onClick={
      handleImportMembers
    }
    disabled={
      importingMembers ||
      invalidRows.length > 0 ||
      rowsReadyToImport.length === 0
    }
    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
  >
    {importingMembers
      ? "Importando..."
      : `Importar ${rowsReadyToImport.length} miembro(s)`}
  </button>
</div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">
                    Fila
                  </th>

                  <th className="px-3 py-2 text-left">
                    Estado
                  </th>

                  <th className="px-3 py-2 text-left">
                    Nombres
                  </th>

                  <th className="px-3 py-2 text-left">
                    Apellidos
                  </th>

                  <th className="px-3 py-2 text-left">
                    Apellido de
                    casada
                  </th>

                  <th className="px-3 py-2 text-left">
                    Familia
                  </th>

                  <th className="px-3 py-2 text-left">
                    Organización
                  </th>

                  <th className="px-3 py-2 text-left">
                    Converso
                    reciente
                  </th>

                  <th className="px-3 py-2 text-left">
                    Activo
                  </th>

                  <th className="px-3 py-2 text-left">
                    Errores
                  </th>
                <th className="px-3 py-2 text-left">
                    Acción
                </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {validatedRows.map(
                  (row) => (
                    <tr
                      key={
                        row.rowNumber
                      }
                      className={
                        !row.isValid
                          ? "bg-red-50"
                          : row.isInactiveDatabaseMatch
                            ? "bg-blue-50"
                            : row.isPossibleDatabaseDuplicate
                              ? "bg-amber-50"
                              : ""
                      }
                    >
                      <td className="whitespace-nowrap px-3 py-2">
                        {
                          row.rowNumber
                        }
                      </td>

                     <td className="whitespace-nowrap px-3 py-2">
                        {!row.isValid ? (
                          <span className="font-medium text-red-700">
                            Error
                          </span>
                        ) : row.isInactiveDatabaseMatch &&
                          rowsToReactivate.has(
                            row.rowNumber,
                          ) ? (
                          <span className="font-medium text-blue-700">
                            Reactivar al importar
                          </span>
                        ) : row.isInactiveDatabaseMatch ? (
                          <span className="font-medium text-blue-700">
                            Miembro inactivo
                          </span>
                        ) : row.isPossibleDatabaseDuplicate &&
                          approvedDuplicateRows.has(
                            row.rowNumber,
                          ) ? (
                          <span className="font-medium text-blue-700">
                            Autorizado
                          </span>
                        ) : row.isPossibleDatabaseDuplicate ? (
                          <span className="font-medium text-amber-700">
                            Posible duplicado
                          </span>
                        ) : (
                          <span className="font-medium text-green-700">
                            Válida
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-2">
                        {row.firstName ||
                          "—"}
                      </td>

                      <td className="px-3 py-2">
                        {row.lastName ||
                          "—"}
                      </td>

                      <td className="px-3 py-2">
                        {row.marriedLastName ||
                          "—"}
                      </td>

                      <td className="px-3 py-2">
                        {row.familyName ||
                          "—"}
                      </td>

                      <td className="px-3 py-2">
                        {row.organization ||
                          "—"}
                      </td>

                      <td className="px-3 py-2">
                        {row.recentConvert ||
                          "—"}
                      </td>

                      <td className="px-3 py-2">
                        {row.active ||
                          "—"}
                      </td>

                      <td className="min-w-72 px-3 py-2">
                        {row.errors.length === 0 &&
                        row.warnings.length === 0 ? (
                          <span className="text-gray-500">
                            Sin errores
                          </span>
                        ) : (
                          <div className="space-y-2">
                            {row.errors.length > 0 && (
                              <ul className="list-disc space-y-1 pl-4 text-red-700">
                                {row.errors.map((error) => (
                                  <li key={error}>
                                    {error}
                                  </li>
                                ))}
                              </ul>
                            )}

                            {row.warnings.length > 0 && (
                              <ul className="list-disc space-y-1 pl-4 text-amber-700">
                                {row.warnings.map(
                                  (warning) => (
                                    <li key={warning}>
                                      {warning}
                                    </li>
                                  ),
                                )}
                              </ul>
                            )}
                          </div>
                        )}
                      </td>
                        <td className="whitespace-nowrap px-3 py-2">
                          {row.isInactiveDatabaseMatch ? (
                            <button
                              type="button"
                              onClick={() =>
                                toggleReactivation(
                                  row.rowNumber,
                                )
                              }
                              className={
                                rowsToReactivate.has(
                                  row.rowNumber,
                                )
                                  ? "rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                  : "rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                              }
                            >
                              {rowsToReactivate.has(
                                row.rowNumber,
                              )
                                ? "Cancelar reactivación"
                                : "Reactivar miembro"}
                            </button>
                          ) : row.isPossibleDatabaseDuplicate ? (
                            <button
                              type="button"
                              onClick={() =>
                                toggleDuplicateApproval(
                                  row.rowNumber,
                                )
                              }
                              className={
                                approvedDuplicateRows.has(
                                  row.rowNumber,
                                )
                                  ? "rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                  : "rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700"
                              }
                            >
                              {approvedDuplicateRows.has(
                                row.rowNumber,
                              )
                                ? "Volver a omitir"
                                : "Importar de todas formas"}
                            </button>
                          ) : (
                            <span className="text-gray-400">
                              —
                            </span>
                          )}
                        </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}