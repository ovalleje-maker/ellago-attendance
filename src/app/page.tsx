"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";
import { useUserProfile } from "@/hooks/useUserProfile";
import type { Member, Organization } from "@/types/member";

import type { AppTab } from "@/types/navigation";
import {
  formatMeetingDate,
  getMostRecentSunday,
} from "@/utils/dates";
import EmptyMessage from "@/components/ui/EmptyMessage";
import ErrorAlert from "@/components/ui/ErrorAlert";
import MetricCard from "@/components/ui/MetricCard";
import NavigationButton from "@/components/ui/NavigationButton";
import SummaryMember from "@/components/attendance/SummaryMember";
import BishopDashboard from "@/components/dashboard/BishopDashboard";
import {
  createMember,
  getActiveMembers,
  removeMember,
} from "@/services/membersService";

import {
  getOrCreateMeeting,
} from "@/services/meetingsService";

import {
  addAttendance,
  addFamilyAttendance,
  clearAttendance,
  getPresentMemberIds,
  removeAttendance,
  removeFamilyAttendance,
} from "@/services/attendanceService";
import { useAttendanceHistory } from "@/hooks/useAttendanceHistory";


export default function Home() {
  const {
  profile,
  loadingProfile,
  profileError,
} = useUserProfile();

const canManageMembers =
  profile?.role === "bishop" ||
  profile?.role === "counselor";

const canRecordAttendance =
  profile?.role === "bishop" ||
  profile?.role === "counselor" ||
  profile?.role === "secretary" ||
  profile?.role === "leader";
  const [activeTab, setActiveTab] =
    useState<AppTab>("dashboard");

  const [members, setMembers] = useState<Member[]>([]);
  const [presentMemberIds, setPresentMemberIds] =
    useState<Set<string>>(new Set());

  const [meetingDate, setMeetingDate] = useState(
    getMostRecentSunday(),
  );

  const [meetingId, setMeetingId] =
    useState<string | null>(null);

  const [attendanceSearch, setAttendanceSearch] =
    useState("");

  const [memberSearch, setMemberSearch] = useState("");

  const [fullName, setFullName] = useState("");
  const [familyName, setFamilyName] = useState("");

  const [organization, setOrganization] =
    useState<Organization>("Cuórum de Élderes");

  const [recentConvert, setRecentConvert] =
    useState(false);

  const [loadingMembers, setLoadingMembers] =
    useState(true);

  const [loadingAttendance, setLoadingAttendance] =
    useState(true);

  const [savingMember, setSavingMember] =
    useState(false);

  const [changingAttendance, setChangingAttendance] =
    useState<string | null>(null);

  const [errorMessage, setErrorMessage] =
    useState("");

    const {
  historicalMeetings,
  memberHistories,
  loadingHistory,
  historyError,
  reloadHistory,
} = useAttendanceHistory({
  members,
  endDate: meetingDate,
  numberOfWeeks: 8,
});

  const loadMembers = useCallback(async () => {
  setLoadingMembers(true);
  setErrorMessage("");

  try {
    const loadedMembers =
      await getActiveMembers();

    setMembers(loadedMembers);
  } catch (error) {
    console.error(
      "Error cargando miembros:",
      error,
    );

    setErrorMessage(
      error instanceof Error
        ? `No fue posible cargar los miembros: ${error.message}`
        : "No fue posible cargar los miembros.",
    );
  } finally {
    setLoadingMembers(false);
  }
}, []);

  const loadMeetingAndAttendance =
    useCallback(async (date: string) => {
      if (!date) return;

      setLoadingAttendance(true);
      setErrorMessage("");

      try {
        const meeting = await getOrCreateMeeting(date);

        setMeetingId(meeting.id);

        const memberIds = await getPresentMemberIds(meeting.id);
        setPresentMemberIds(memberIds);
      } catch (error) {
        console.error("Error cargando reunión:", error);

        setErrorMessage(
          error instanceof Error
            ? `No fue posible cargar la reunión: ${error.message}`
            : "No fue posible cargar la reunión.",
        );
      } finally {
        setLoadingAttendance(false);
      }
    }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    loadMeetingAndAttendance(meetingDate);
  }, [meetingDate, loadMeetingAndAttendance]);

  const filteredAttendanceMembers = useMemo(() => {
    const search =
      attendanceSearch.trim().toLowerCase();

    return members.filter((member) => {
      const searchableText = [
        member.full_name,
        member.family_name ?? "",
        member.organization,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(search);
    });
  }, [members, attendanceSearch]);

  const filteredDirectoryMembers = useMemo(() => {
    const search = memberSearch.trim().toLowerCase();

    return members.filter((member) => {
      const searchableText = [
        member.full_name,
        member.family_name ?? "",
        member.organization,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(search);
    });
  }, [members, memberSearch]);

  const presentMembers = useMemo(
    () =>
      members.filter((member) =>
        presentMemberIds.has(member.id),
      ),
    [members, presentMemberIds],
  );

  const absentMembers = useMemo(
    () =>
      members.filter(
        (member) =>
          !presentMemberIds.has(member.id),
      ),
    [members, presentMemberIds],
  );

  const attendancePercentage =
    members.length === 0
      ? 0
      : Math.round(
          (presentMembers.length / members.length) *
            100,
        );

  const families = useMemo(() => {
    const familyMap = new Map<string, Member[]>();

    members.forEach((member) => {
      const family =
        member.family_name?.trim() || "Sin familia";

      const familyMembers =
        familyMap.get(family) ?? [];

      familyMembers.push(member);
      familyMap.set(family, familyMembers);
    });

    return Array.from(familyMap.entries()).sort(
      ([familyA], [familyB]) =>
        familyA.localeCompare(familyB, "es"),
    );
  }, [members]);

  async function addMember(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!canManageMembers) {
      setErrorMessage(
        "Tu cuenta no tiene permiso para agregar miembros.",
      );

      return;
    }

    const cleanName = fullName.trim();
    const cleanFamily = familyName.trim();

    if (!cleanName) {
      setErrorMessage(
        "Escribe el nombre completo del miembro.",
      );

      return;
    }

    setSavingMember(true);
    setErrorMessage("");

    try {
      const newMember = await createMember({
        fullName: cleanName,
        familyName: cleanFamily,
        organization,
        recentConvert,
      });

      setMembers((currentMembers) =>
        [...currentMembers, newMember].sort(
          (memberA, memberB) =>
            memberA.full_name.localeCompare(
              memberB.full_name,
              "es",
            ),
        ),
      );

      setFullName("");
      setFamilyName("");
      setOrganization("Cuórum de Élderes");
      setRecentConvert(false);
    } catch (error) {
      console.error(
        "Error agregando miembro:",
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? `No fue posible agregar el miembro: ${error.message}`
          : "No fue posible agregar el miembro.",
      );
    } finally {
      setSavingMember(false);
    }
  }

  async function deleteMember(member: Member) {
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar a ${member.full_name}?`,
    );

    if (!canManageMembers) {
      setErrorMessage(
        "Tu cuenta no tiene permiso para eliminar miembros.",
      );

      return;
    }

    if (!confirmed) return;

    setErrorMessage("");

    try {
      await removeMember(member.id);

      setMembers((currentMembers) =>
        currentMembers.filter(
          (currentMember) =>
            currentMember.id !== member.id,
        ),
      );

      setPresentMemberIds((currentIds) => {
        const updatedIds = new Set(currentIds);

        updatedIds.delete(member.id);

        return updatedIds;
      });
    } catch (error) {
      console.error(
        "Error eliminando miembro:",
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? `No fue posible eliminar el miembro: ${error.message}`
          : "No fue posible eliminar el miembro.",
      );
    }
  }

  async function toggleAttendance(member: Member) {
  if (!canRecordAttendance) {
    setErrorMessage(
      "Tu cuenta no tiene permiso para registrar asistencia.",
    );

    return;
  }

  if (!meetingId) {
    setErrorMessage(
      "La reunión todavía no está lista.",
    );

    return;
  }

  setChangingAttendance(member.id);
  setErrorMessage("");

  const currentlyPresent =
    presentMemberIds.has(member.id);

  try {
    if (currentlyPresent) {
      await removeAttendance(
        meetingId,
        member.id,
      );

      setPresentMemberIds((currentIds) => {
        const updatedIds = new Set(currentIds);

        updatedIds.delete(member.id);

        return updatedIds;
      });
    } else {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "No existe una sesión válida.",
        );
      }

      await addAttendance(
        meetingId,
        member.id,
        user.id,
      );

      setPresentMemberIds((currentIds) => {
        const updatedIds = new Set(currentIds);

        updatedIds.add(member.id);

        return updatedIds;
      });
    }
    await reloadHistory();
  } catch (error) {
    console.error(
      "Error cambiando asistencia:",
      error,
    );

    setErrorMessage(
      error instanceof Error
        ? `No fue posible cambiar la asistencia: ${error.message}`
        : "No fue posible cambiar la asistencia.",
    );
  } finally {
    setChangingAttendance(null);
  }
}

async function markWholeFamily(
  familyMembers: Member[],
) {
  if (!canRecordAttendance) {
    setErrorMessage(
      "Tu cuenta no tiene permiso para registrar asistencia.",
    );

    return;
  }

  if (!meetingId) {
    setErrorMessage(
      "La reunión todavía no está lista.",
    );

    return;
  }

  setErrorMessage("");

  const familyMemberIds = familyMembers.map(
    (member) => member.id,
  );

  const allPresent = familyMemberIds.every(
    (memberId) =>
      presentMemberIds.has(memberId),
  );

  try {
    if (allPresent) {
      await removeFamilyAttendance(
        meetingId,
        familyMemberIds,
      );

      setPresentMemberIds(
        (currentIds) => {
          const updatedIds =
            new Set(currentIds);

          familyMemberIds.forEach(
            (memberId) =>
              updatedIds.delete(memberId),
          );

          return updatedIds;
        },
      );

      await reloadHistory();

      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error(
        "No existe una sesión válida.",
      );
    }

    const missingMemberIds =
      familyMemberIds.filter(
        (memberId) =>
          !presentMemberIds.has(memberId),
      );

    await addFamilyAttendance(
      meetingId,
      missingMemberIds,
      user.id,
    );

    setPresentMemberIds(
      (currentIds) => {
        const updatedIds =
          new Set(currentIds);

        missingMemberIds.forEach(
          (memberId) =>
            updatedIds.add(memberId),
        );

        return updatedIds;
      },
    );

await reloadHistory();

  } catch (error) {
    console.error(
      "Error cambiando familia:",
      error,
    );

    setErrorMessage(
      error instanceof Error
        ? `No fue posible cambiar la familia: ${error.message}`
        : "No fue posible cambiar la familia.",
    );
  }
}

async function clearMeetingAttendance() {
  if (!canRecordAttendance) {
    setErrorMessage(
      "Tu cuenta no tiene permiso para limpiar la asistencia.",
    );

    return;
  }

  if (!meetingId) {
    setErrorMessage(
      "La reunión todavía no está lista.",
    );

    return;
  }

  const confirmed = window.confirm(
    `¿Deseas borrar toda la asistencia del ${formatMeetingDate(
      meetingDate,
    )}?`,
  );

  if (!confirmed) return;

  setErrorMessage("");

  try {
    await clearAttendance(meetingId);

    setPresentMemberIds(new Set());

await reloadHistory();

  } catch (error) {
    console.error(
      "Error limpiando asistencia:",
      error,
    );

    setErrorMessage(
      error instanceof Error
        ? `No fue posible limpiar la asistencia: ${error.message}`
        : "No fue posible limpiar la asistencia.",
    );
  }
}

 const loading =
  loadingMembers ||
  loadingAttendance ||
  loadingProfile ||
  loadingHistory;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-emerald-800 px-4 py-6 text-white shadow">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">
            Reunión sacramental
          </p>

          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            Asistencia del Barrio
          </h1>

          <p className="mt-2 text-sm text-emerald-100">
            Información sincronizada con Supabase
          </p>
        </div>
      </header>

      <nav className="sticky top-0 z-20 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto grid max-w-5xl grid-cols-4">

          <NavigationButton
            active={activeTab === "dashboard"}
            label="Dashboard"
            onClick={() =>
              setActiveTab("dashboard")
  }
/>

          <NavigationButton
            active={activeTab === "attendance"}
            label="Asistencia"
            onClick={() =>
              setActiveTab("attendance")
            }
          />

          <NavigationButton
            active={activeTab === "summary"}
            label="Resumen"
            onClick={() =>
              setActiveTab("summary")
            }
          />

          <NavigationButton
            active={activeTab === "members"}
            label="Miembros"
            onClick={() =>
              setActiveTab("members")
            }
          />
        </div>
      </nav>

      <div className="mx-auto max-w-5xl p-4 sm:p-6">
       <ErrorAlert message={profileError} />

        <ErrorAlert message={errorMessage} />
        <ErrorAlert message={historyError} />

        {loading && (
          <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-800">
            Cargando información desde Supabase...
          </div>
        )}

        {activeTab === "dashboard" && (
     <BishopDashboard
  members={members}
  presentMemberIds={presentMemberIds}
  meetingDate={meetingDate}
  historicalMeetings={historicalMeetings}
  memberHistories={memberHistories}
/>
)}

        {activeTab === "attendance" && (
          <section>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <label
                htmlFor="meetingDate"
                className="block text-sm font-bold text-slate-700"
              >
                Fecha de la reunión
              </label>

              <input
                id="meetingDate"
                type="date"
                value={meetingDate}
                disabled={loadingAttendance}
                onChange={(event) =>
                  setMeetingDate(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700 disabled:bg-slate-100 sm:max-w-xs"
              />

              <p className="mt-2 text-sm capitalize text-slate-500">
                {formatMeetingDate(meetingDate)}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <MetricCard
                number={presentMembers.length}
                label="Presentes"
              />

              <MetricCard
                number={absentMembers.length}
                label="Ausentes"
              />

              <MetricCard
                number={`${attendancePercentage}%`}
                label="Asistencia"
              />
            </div>
          
            <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="search"
                  value={attendanceSearch}
                  onChange={(event) =>
                    setAttendanceSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Buscar miembro, familia u organización..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
                />

                <button
                  type="button"
                  onClick={clearMeetingAttendance}
                  disabled={
                    !canRecordAttendance ||
                    loadingAttendance ||
                    presentMemberIds.size === 0
                  }
                  className="rounded-xl border border-red-300 px-4 py-3 font-bold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Limpiar día
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {filteredAttendanceMembers.map(
                (member) => {
                  const isPresent =
                    presentMemberIds.has(member.id);

                  const isChanging =
                    changingAttendance === member.id;

                  return (
                    <article
                      key={member.id}
                      className={`flex items-center justify-between gap-4 rounded-2xl border p-4 shadow-sm ${
                        isPresent
                          ? "border-emerald-300 bg-emerald-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div>
                        <h2 className="font-bold">
                          {member.full_name}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          {member.family_name ||
                            "Sin familia"}{" "}
                          · {member.organization}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={
                          !canRecordAttendance ||
                          isChanging ||
                          loadingAttendance
                        }
                        onClick={() =>
                          toggleAttendance(member)
                        }
                        className={`min-w-28 rounded-xl px-4 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-60 ${
                          isPresent
                            ? "bg-emerald-700 text-white"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {isChanging
                          ? "Guardando..."
                          : isPresent
                            ? "✓ Presente"
                            : "Marcar"}
                      </button>
                    </article>
                  );
                },
              )}

              {!loadingMembers &&
                members.length === 0 && (
                  <EmptyMessage message="Todavía no hay miembros registrados en Supabase." />
                )}

              {members.length > 0 &&
                filteredAttendanceMembers.length ===
                  0 && (
                  <EmptyMessage message="No se encontraron miembros." />
                )}
            </div>

            {families.length > 0 && (
              <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
                <h2 className="text-xl font-bold">
                  Registrar por familia
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  El registro se guardará inmediatamente
                  en Supabase.
                </p>

                <div className="mt-4 space-y-3">
                  {families.map(
                    ([family, familyMembers]) => {
                      const allPresent =
                        familyMembers.every(
                          (member) =>
                            presentMemberIds.has(
                              member.id,
                            ),
                        );

                      return (
                        <div
                          key={family}
                          className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4"
                        >
                          <div>
                            <h3 className="font-bold">
                              {family}
                            </h3>

                            <p className="text-sm text-slate-500">
                              {familyMembers.length}{" "}
                              miembro
                              {familyMembers.length === 1
                                ? ""
                                : "s"}
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={
                              !canRecordAttendance ||
                              loadingAttendance
                            }
                            onClick={() =>
                              markWholeFamily(
                                familyMembers,
                              )
                            }
                            className={`rounded-xl px-4 py-3 font-bold disabled:opacity-50 ${
                              allPresent
                                ? "bg-red-100 text-red-700"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {allPresent
                              ? "Desmarcar"
                              : "Marcar familia"}
                          </button>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === "summary" && (
          <section>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
                Resumen
              </p>

              <h2 className="mt-2 text-xl font-bold capitalize">
                {formatMeetingDate(meetingDate)}
              </h2>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <MetricCard
                number={presentMembers.length}
                label="Presentes"
              />

              <MetricCard
                number={absentMembers.length}
                label="Ausentes"
              />

              <MetricCard
                number={`${attendancePercentage}%`}
                label="Asistencia"
              />
            </div>

            <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold">
                Miembros presentes
              </h2>

              <div className="mt-4 space-y-2">
                {presentMembers.length > 0 ? (
                  presentMembers.map((member) => (
                    <SummaryMember
                      key={member.id}
                      member={member}
                      status="Presente"
                      present
                    />
                  ))
                ) : (
                  <EmptyMessage message="No hay miembros marcados como presentes." />
                )}
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold">
                Miembros ausentes
              </h2>

              <div className="mt-4 space-y-2">
                {absentMembers.length > 0 ? (
                  absentMembers.map((member) => (
                    <SummaryMember
                      key={member.id}
                      member={member}
                      status="Ausente"
                    />
                  ))
                ) : (
                  <EmptyMessage message="No hay miembros ausentes." />
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === "members" && (
          <section>
            {canManageMembers && (
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold">
                Agregar miembro
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                El miembro se guardará en Supabase.
              </p>

              <form
                onSubmit={addMember}
                className="mt-4 grid gap-4 sm:grid-cols-2"
              >
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Nombre completo
                  </span>

                  <input
                    type="text"
                    value={fullName}
                    disabled={savingMember}
                    onChange={(event) =>
                      setFullName(event.target.value)
                    }
                    placeholder="Ej. María López"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700 disabled:bg-slate-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Familia
                  </span>

                  <input
                    type="text"
                    value={familyName}
                    disabled={savingMember}
                    onChange={(event) =>
                      setFamilyName(
                        event.target.value,
                      )
                    }
                    placeholder="Ej. Familia López"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700 disabled:bg-slate-100"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-sm font-bold text-slate-700">
                    Organización
                  </span>

                  <select
                    value={organization}
                    disabled={savingMember}
                    onChange={(event) =>
                      setOrganization(
                        event.target
                          .value as Organization,
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-700 disabled:bg-slate-100"
                  >
                    <option>
                      Cuórum de Élderes
                    </option>
                    <option>
                      Sociedad de Socorro
                    </option>
                    <option>
                      Hombres Jóvenes
                    </option>
                    <option>
                      Mujeres Jóvenes
                    </option>
                    <option>Primaria</option>
                    <option>Otro</option>
                  </select>
                </label>

                <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={recentConvert}
                    disabled={savingMember}
                    onChange={(event) =>
                      setRecentConvert(
                        event.target.checked,
                      )
                    }
                    className="h-5 w-5"
                  />

                  <span className="font-semibold text-slate-700">
                    Converso reciente
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={savingMember}
                  className="rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-400 sm:col-span-2"
                >
                  {savingMember
                    ? "Guardando..."
                    : "Agregar miembro"}
                </button>
              </form>
            </div>
          )}

            <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
              <div>
                <h2 className="text-xl font-bold">
                  Directorio
                </h2>

                <p className="text-sm text-slate-500">
                  {members.length} miembro
                  {members.length === 1 ? "" : "s"}{" "}
                  almacenado
                  {members.length === 1 ? "" : "s"}{" "}
                  en Supabase
                </p>
              </div>

              <input
                type="search"
                value={memberSearch}
                onChange={(event) =>
                  setMemberSearch(event.target.value)
                }
                placeholder="Buscar miembro..."
                className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
              />

              <div className="mt-4 space-y-3">
                {filteredDirectoryMembers.map(
                  (member) => (
                    <article
                      key={member.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
                    >
                      <div>
                        <h3 className="font-bold">
                          {member.full_name}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {member.family_name ||
                            "Sin familia"}{" "}
                          · {member.organization}
                        </p>

                        {member.recent_convert && (
                          <span className="mt-2 inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-800">
                            Converso reciente
                          </span>
                        )}
                      </div>

                    {canManageMembers && (
                      <button
                        type="button"
                        onClick={() =>
                          deleteMember(member)
                        }
                        className="rounded-xl bg-red-100 px-4 py-2 font-bold text-red-700 hover:bg-red-200"
                      >
                        Eliminar
                      </button>
                    )} 
                    </article>
                  ),
                )}

                {!loadingMembers &&
                  members.length === 0 && (
                    <EmptyMessage message="Todavía no hay miembros almacenados en Supabase." />
                  )}

                {members.length > 0 &&
                  filteredDirectoryMembers.length ===
                    0 && (
                    <EmptyMessage message="No se encontraron miembros." />
                  )}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

type NavigationButtonProps = {
  active: boolean;
  label: string;
  onClick: () => void;
};

type MetricCardProps = {
  number: number | string;
  label: string;
};

