"use client";

import {
  useMemo,
  useState,
  type FormEvent,
} from "react";

import type {
  MeetingVisitorWithVisitor,
  RegisterVisitorAttendanceInput,
  VisitorType,
} from "@/types/visitor";

interface VisitorAttendanceSectionProps {
  meetingId: string | null;
  meetingVisitors: MeetingVisitorWithVisitor[];
  loadingMeetingVisitors: boolean;
  savingMeetingVisitor: boolean;
  visitorError: string | null;

  onRegisterVisitor: (
    input: RegisterVisitorAttendanceInput,
  ) => Promise<boolean>;

  onRemoveVisitor: (
    meetingVisitorId: string,
  ) => Promise<boolean>;
}

export default function VisitorAttendanceSection({
  meetingId,
  meetingVisitors,
  loadingMeetingVisitors,
  savingMeetingVisitor,
  visitorError,
  onRegisterVisitor,
  onRemoveVisitor,
}: VisitorAttendanceSectionProps) {
  const [fullName, setFullName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [
    visitorType,
    setVisitorType,
  ] = useState<VisitorType>("friend");

  const [invitedBy, setInvitedBy] =
    useState("");

  const [
    attendanceNotes,
    setAttendanceNotes,
  ] = useState("");

  const [
    removingVisitorId,
    setRemovingVisitorId,
  ] = useState<string | null>(null);

  const sortedVisitors = useMemo(
    () =>
      [...meetingVisitors].sort((a, b) =>
        a.visitor.full_name.localeCompare(
          b.visitor.full_name,
          "es",
          {
            sensitivity: "base",
          },
        ),
      ),
    [meetingVisitors],
  );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const normalizedFullName =
      fullName.trim().replace(/\s+/g, " ");

    if (!meetingId || !normalizedFullName) {
      return;
    }

    const success =
      await onRegisterVisitor({
        meeting_id: meetingId,
        full_name: normalizedFullName,
        phone: phone.trim() || null,
        visitor_type: visitorType,
        invited_by:
          invitedBy.trim() || null,
        visitor_notes: null,
        attendance_notes:
          attendanceNotes.trim() || null,
      });

    if (!success) {
      return;
    }

    setFullName("");
    setPhone("");
    setVisitorType("friend");
    setInvitedBy("");
    setAttendanceNotes("");
  }

  async function handleRemoveVisitor(
    meetingVisitorId: string,
  ): Promise<void> {
    const confirmed = window.confirm(
      "¿Deseas quitar a esta persona de la asistencia de esta reunión?",
    );

    if (!confirmed) {
      return;
    }

    setRemovingVisitorId(
      meetingVisitorId,
    );

    try {
      await onRemoveVisitor(
        meetingVisitorId,
      );
    } finally {
      setRemovingVisitorId(null);
    }
  }

  const formDisabled =
    !meetingId ||
    savingMeetingVisitor;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">
          Visitantes y amigos
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          Registra las personas que asistieron
          y que todavía no aparecen en el
          directorio de miembros.
        </p>
      </div>

      {!meetingId ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Primero selecciona o crea una reunión
          para registrar visitantes.
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-lg border bg-white p-4"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium">
              Nombre completo
            </span>

            <input
              type="text"
              value={fullName}
              onChange={(event) =>
                setFullName(
                  event.target.value,
                )
              }
              disabled={formDisabled}
              required
              placeholder="Ej. Juan Pérez"
              className="w-full rounded-md border px-3 py-2"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">
              Teléfono
            </span>

            <input
              type="tel"
              value={phone}
              onChange={(event) =>
                setPhone(
                  event.target.value,
                )
              }
              disabled={formDisabled}
              placeholder="Opcional"
              className="w-full rounded-md border px-3 py-2"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">
              Tipo
            </span>

            <select
              value={visitorType}
              onChange={(event) =>
                setVisitorType(
                  event.target
                    .value as VisitorType,
                )
              }
              disabled={formDisabled}
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="friend">
                Amigo de la Iglesia
              </option>

              <option value="visitor">
                Visitante
              </option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">
              Invitado por
            </span>

            <input
              type="text"
              value={invitedBy}
              onChange={(event) =>
                setInvitedBy(
                  event.target.value,
                )
              }
              disabled={formDisabled}
              placeholder="Miembro, misioneros, familia..."
              className="w-full rounded-md border px-3 py-2"
            />
          </label>
        </div>

        <label className="block space-y-1">
          <span className="text-sm font-medium">
            Notas de esta asistencia
          </span>

          <textarea
            value={attendanceNotes}
            onChange={(event) =>
              setAttendanceNotes(
                event.target.value,
              )
            }
            disabled={formDisabled}
            rows={3}
            placeholder="Opcional"
            className="w-full rounded-md border px-3 py-2"
          />
        </label>

        <button
          type="submit"
          disabled={
            formDisabled ||
            !fullName.trim()
          }
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {savingMeetingVisitor
            ? "Guardando..."
            : "Registrar visitante"}
        </button>
      </form>

      {visitorError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {visitorError}
        </div>
      ) : null}

      <div className="rounded-lg border bg-white">
        <div className="border-b px-4 py-3">
          <h3 className="font-semibold">
            Personas registradas
          </h3>

          <p className="text-sm text-gray-600">
            Total: {meetingVisitors.length}
          </p>
        </div>

        {loadingMeetingVisitors ? (
          <div className="p-4 text-sm text-gray-600">
            Cargando visitantes...
          </div>
        ) : null}

        {!loadingMeetingVisitors &&
        sortedVisitors.length === 0 ? (
          <div className="p-4 text-sm text-gray-600">
            Todavía no hay visitantes
            registrados para esta reunión.
          </div>
        ) : null}

        {!loadingMeetingVisitors &&
        sortedVisitors.length > 0 ? (
          <ul className="divide-y">
            {sortedVisitors.map(
              (meetingVisitor) => {
                const isRemoving =
                  removingVisitorId ===
                  meetingVisitor.id;

                return (
                  <li
                    key={
                      meetingVisitor.id
                    }
                    className="flex items-start justify-between gap-4 p-4"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">
                        {
                          meetingVisitor
                            .visitor
                            .full_name
                        }
                      </p>

                      <p className="text-sm text-gray-600">
                        {meetingVisitor.visitor_type ===
                        "friend"
                          ? "Amigo de la Iglesia"
                          : "Visitante"}
                      </p>

                      {meetingVisitor
                        .visitor.phone ? (
                        <p className="text-sm text-gray-600">
                          Teléfono:{" "}
                          {
                            meetingVisitor
                              .visitor.phone
                          }
                        </p>
                      ) : null}

                      {meetingVisitor.invited_by ? (
                        <p className="text-sm text-gray-600">
                          Invitado por:{" "}
                          {
                            meetingVisitor
                              .invited_by
                          }
                        </p>
                      ) : null}

                      {meetingVisitor.notes ? (
                        <p className="mt-2 text-sm text-gray-700">
                          {
                            meetingVisitor
                              .notes
                          }
                        </p>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      disabled={
                        savingMeetingVisitor ||
                        isRemoving
                      }
                      onClick={() =>
                        void handleRemoveVisitor(
                          meetingVisitor.id,
                        )
                      }
                      className="shrink-0 rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isRemoving
                        ? "Quitando..."
                        : "Quitar"}
                    </button>
                  </li>
                );
              },
            )}
          </ul>
        ) : null}
      </div>
    </section>
  );
}