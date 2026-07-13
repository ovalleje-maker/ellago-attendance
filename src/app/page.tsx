"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Organization =
  | "Cuórum de Élderes"
  | "Sociedad de Socorro"
  | "Hombres Jóvenes"
  | "Mujeres Jóvenes"
  | "Primaria"
  | "Otro";

type Member = {
  id: string;
  fullName: string;
  familyName: string;
  organization: Organization;
};

type AttendanceRecord = {
  [date: string]: string[];
};

type Tab = "attendance" | "summary" | "members";

const STORAGE_MEMBERS = "ward-members";
const STORAGE_ATTENDANCE = "ward-attendance";

const demoMembers: Member[] = [
  {
    id: "1",
    fullName: "Carlos García",
    familyName: "Familia García",
    organization: "Cuórum de Élderes",
  },
  {
    id: "2",
    fullName: "Ana García",
    familyName: "Familia García",
    organization: "Sociedad de Socorro",
  },
  {
    id: "3",
    fullName: "Sofía García",
    familyName: "Familia García",
    organization: "Mujeres Jóvenes",
  },
  {
    id: "4",
    fullName: "José López",
    familyName: "Familia López",
    organization: "Cuórum de Élderes",
  },
  {
    id: "5",
    fullName: "María López",
    familyName: "Familia López",
    organization: "Sociedad de Socorro",
  },
  {
    id: "6",
    fullName: "Daniel López",
    familyName: "Familia López",
    organization: "Primaria",
  },
];

function getMostRecentSunday(): string {
  const date = new Date();
  const day = date.getDay();

  date.setDate(date.getDate() - day);

  return date.toISOString().slice(0, 10);
}

function createId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("attendance");
  const [members, setMembers] = useState<Member[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord>({});
  const [meetingDate, setMeetingDate] = useState(getMostRecentSunday());
  const [attendanceSearch, setAttendanceSearch] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [loaded, setLoaded] = useState(false);

  const [fullName, setFullName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [organization, setOrganization] =
    useState<Organization>("Cuórum de Élderes");

  useEffect(() => {
    try {
      const savedMembers = localStorage.getItem(STORAGE_MEMBERS);
      const savedAttendance = localStorage.getItem(STORAGE_ATTENDANCE);

      if (savedMembers) {
        setMembers(JSON.parse(savedMembers));
      }

      if (savedAttendance) {
        setAttendance(JSON.parse(savedAttendance));
      }
    } catch (error) {
      console.error("No se pudieron cargar los datos:", error);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(STORAGE_MEMBERS, JSON.stringify(members));
  }, [members, loaded]);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(STORAGE_ATTENDANCE, JSON.stringify(attendance));
  }, [attendance, loaded]);

  const presentMemberIds = attendance[meetingDate] ?? [];

  const filteredAttendanceMembers = useMemo(() => {
    const search = attendanceSearch.trim().toLowerCase();

    return [...members]
      .filter((member) => {
        const searchableText =
          `${member.fullName} ${member.familyName} ${member.organization}`.toLowerCase();

        return searchableText.includes(search);
      })
      .sort((a, b) => a.fullName.localeCompare(b.fullName, "es"));
  }, [members, attendanceSearch]);

  const filteredDirectoryMembers = useMemo(() => {
    const search = memberSearch.trim().toLowerCase();

    return [...members]
      .filter((member) => {
        const searchableText =
          `${member.fullName} ${member.familyName} ${member.organization}`.toLowerCase();

        return searchableText.includes(search);
      })
      .sort((a, b) => a.fullName.localeCompare(b.fullName, "es"));
  }, [members, memberSearch]);

  const presentMembers = members.filter((member) =>
    presentMemberIds.includes(member.id),
  );

  const absentMembers = members.filter(
    (member) => !presentMemberIds.includes(member.id),
  );

  const attendancePercentage =
    members.length === 0
      ? 0
      : Math.round((presentMembers.length / members.length) * 100);

  const families = useMemo(() => {
    const familyMap = new Map<string, Member[]>();

    members.forEach((member) => {
      const family = member.familyName.trim() || "Sin familia";

      const currentMembers = familyMap.get(family) ?? [];
      currentMembers.push(member);

      familyMap.set(family, currentMembers);
    });

    return Array.from(familyMap.entries()).sort(([familyA], [familyB]) =>
      familyA.localeCompare(familyB, "es"),
    );
  }, [members]);

  function toggleAttendance(memberId: string) {
    setAttendance((currentAttendance) => {
      const currentDateAttendance = currentAttendance[meetingDate] ?? [];
      const isPresent = currentDateAttendance.includes(memberId);

      const newDateAttendance = isPresent
        ? currentDateAttendance.filter((id) => id !== memberId)
        : [...currentDateAttendance, memberId];

      return {
        ...currentAttendance,
        [meetingDate]: newDateAttendance,
      };
    });
  }

  function markWholeFamily(familyMembers: Member[]) {
    const familyMemberIds = familyMembers.map((member) => member.id);

    setAttendance((currentAttendance) => {
      const currentDateAttendance = currentAttendance[meetingDate] ?? [];

      const allFamilyPresent = familyMemberIds.every((memberId) =>
        currentDateAttendance.includes(memberId),
      );

      let newDateAttendance: string[];

      if (allFamilyPresent) {
        newDateAttendance = currentDateAttendance.filter(
          (memberId) => !familyMemberIds.includes(memberId),
        );
      } else {
        newDateAttendance = Array.from(
          new Set([...currentDateAttendance, ...familyMemberIds]),
        );
      }

      return {
        ...currentAttendance,
        [meetingDate]: newDateAttendance,
      };
    });
  }

  function addMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanName = fullName.trim();
    const cleanFamily = familyName.trim();

    if (!cleanName) {
      alert("Escribe el nombre del miembro.");
      return;
    }

    const newMember: Member = {
      id: createId(),
      fullName: cleanName,
      familyName: cleanFamily,
      organization,
    };

    setMembers((currentMembers) => [...currentMembers, newMember]);

    setFullName("");
    setFamilyName("");
    setOrganization("Cuórum de Élderes");
  }

  function deleteMember(member: Member) {
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar a ${member.fullName}?`,
    );

    if (!confirmed) return;

    setMembers((currentMembers) =>
      currentMembers.filter((currentMember) => currentMember.id !== member.id),
    );

    setAttendance((currentAttendance) => {
      const updatedAttendance: AttendanceRecord = {};

      Object.entries(currentAttendance).forEach(([date, memberIds]) => {
        updatedAttendance[date] = memberIds.filter(
          (memberId) => memberId !== member.id,
        );
      });

      return updatedAttendance;
    });
  }

  function loadDemoData() {
    if (members.length > 0) {
      const confirmed = window.confirm(
        "Ya existen miembros. ¿Deseas reemplazarlos con los datos de demostración?",
      );

      if (!confirmed) return;
    }

    setMembers(demoMembers);
    setAttendance({
      [meetingDate]: ["1", "2", "3", "4"],
    });
  }

  function clearMeetingAttendance() {
    const confirmed = window.confirm(
      "¿Deseas borrar toda la asistencia de la fecha seleccionada?",
    );

    if (!confirmed) return;

    setAttendance((currentAttendance) => ({
      ...currentAttendance,
      [meetingDate]: [],
    }));
  }

  if (!loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="font-semibold text-slate-600">Cargando aplicación...</p>
      </main>
    );
  }

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
            Registro local de miembros presentes y ausentes
          </p>
        </div>
      </header>

      <nav className="sticky top-0 z-20 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto grid max-w-5xl grid-cols-3">
          <NavigationButton
            active={activeTab === "attendance"}
            label="Asistencia"
            onClick={() => setActiveTab("attendance")}
          />

          <NavigationButton
            active={activeTab === "summary"}
            label="Resumen"
            onClick={() => setActiveTab("summary")}
          />

          <NavigationButton
            active={activeTab === "members"}
            label="Miembros"
            onClick={() => setActiveTab("members")}
          />
        </div>
      </nav>

      <div className="mx-auto max-w-5xl p-4 sm:p-6">
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
                onChange={(event) => setMeetingDate(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700 sm:max-w-xs"
              />
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
                    setAttendanceSearch(event.target.value)
                  }
                  placeholder="Buscar miembro, familia u organización..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
                />

                <button
                  type="button"
                  onClick={clearMeetingAttendance}
                  className="rounded-xl border border-red-300 px-4 py-3 font-bold text-red-700 hover:bg-red-50"
                >
                  Limpiar día
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {filteredAttendanceMembers.map((member) => {
                const isPresent = presentMemberIds.includes(member.id);

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
                      <h2 className="font-bold">{member.fullName}</h2>

                      <p className="mt-1 text-sm text-slate-500">
                        {member.familyName || "Sin familia"} ·{" "}
                        {member.organization}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleAttendance(member.id)}
                      className={`min-w-28 rounded-xl px-4 py-3 font-bold ${
                        isPresent
                          ? "bg-emerald-700 text-white"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {isPresent ? "✓ Presente" : "Marcar"}
                    </button>
                  </article>
                );
              })}

              {members.length === 0 && (
                <EmptyMessage message="Todavía no hay miembros registrados." />
              )}

              {members.length > 0 &&
                filteredAttendanceMembers.length === 0 && (
                  <EmptyMessage message="No se encontraron miembros." />
                )}
            </div>

            {families.length > 0 && (
              <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
                <h2 className="text-xl font-bold">Registrar por familia</h2>

                <p className="mt-1 text-sm text-slate-500">
                  Presiona el botón para marcar o desmarcar a todos los
                  integrantes.
                </p>

                <div className="mt-4 space-y-3">
                  {families.map(([family, familyMembers]) => {
                    const allPresent = familyMembers.every((member) =>
                      presentMemberIds.includes(member.id),
                    );

                    return (
                      <div
                        key={family}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4"
                      >
                        <div>
                          <h3 className="font-bold">{family}</h3>

                          <p className="text-sm text-slate-500">
                            {familyMembers.length} miembro
                            {familyMembers.length === 1 ? "" : "s"}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => markWholeFamily(familyMembers)}
                          className={`rounded-xl px-4 py-3 font-bold ${
                            allPresent
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {allPresent ? "Desmarcar" : "Marcar familia"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === "summary" && (
          <section>
            <div className="grid grid-cols-3 gap-3">
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
                  presentMembers
                    .sort((a, b) =>
                      a.fullName.localeCompare(b.fullName, "es"),
                    )
                    .map((member) => (
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
                  absentMembers
                    .sort((a, b) =>
                      a.fullName.localeCompare(b.fullName, "es"),
                    )
                    .map((member) => (
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
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold">
                Agregar miembro
              </h2>

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
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Ej. María López"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Familia
                  </span>

                  <input
                    type="text"
                    value={familyName}
                    onChange={(event) => setFamilyName(event.target.value)}
                    placeholder="Ej. Familia López"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-sm font-bold text-slate-700">
                    Organización
                  </span>

                  <select
                    value={organization}
                    onChange={(event) =>
                      setOrganization(event.target.value as Organization)
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-700"
                  >
                    <option>Cuórum de Élderes</option>
                    <option>Sociedad de Socorro</option>
                    <option>Hombres Jóvenes</option>
                    <option>Mujeres Jóvenes</option>
                    <option>Primaria</option>
                    <option>Otro</option>
                  </select>
                </label>

                <button
                  type="submit"
                  className="rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800 sm:col-span-2"
                >
                  Agregar miembro
                </button>
              </form>
            </div>

            <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    Directorio local
                  </h2>

                  <p className="text-sm text-slate-500">
                    {members.length} miembro
                    {members.length === 1 ? "" : "s"} registrado
                    {members.length === 1 ? "" : "s"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadDemoData}
                  className="rounded-xl bg-slate-200 px-4 py-3 font-bold text-slate-700"
                >
                  Cargar demostración
                </button>
              </div>

              <input
                type="search"
                value={memberSearch}
                onChange={(event) => setMemberSearch(event.target.value)}
                placeholder="Buscar miembro..."
                className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
              />

              <div className="mt-4 space-y-3">
                {filteredDirectoryMembers.map((member) => (
                  <article
                    key={member.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
                  >
                    <div>
                      <h3 className="font-bold">{member.fullName}</h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {member.familyName || "Sin familia"} ·{" "}
                        {member.organization}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteMember(member)}
                      className="rounded-xl bg-red-100 px-4 py-2 font-bold text-red-700 hover:bg-red-200"
                    >
                      Eliminar
                    </button>
                  </article>
                ))}

                {members.length === 0 && (
                  <EmptyMessage message="Todavía no hay miembros registrados." />
                )}

                {members.length > 0 &&
                  filteredDirectoryMembers.length === 0 && (
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

function NavigationButton({
  active,
  label,
  onClick,
}: NavigationButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-4 px-2 py-4 text-sm font-bold sm:text-base ${
        active
          ? "border-emerald-700 text-emerald-800"
          : "border-transparent text-slate-500 hover:text-slate-800"
      }`}
    >
      {label}
    </button>
  );
}

type MetricCardProps = {
  number: number | string;
  label: string;
};

function MetricCard({ number, label }: MetricCardProps) {
  return (
    <article className="rounded-2xl bg-white p-4 text-center shadow-sm">
      <strong className="block text-2xl font-bold text-emerald-800">
        {number}
      </strong>

      <span className="mt-1 block text-xs font-semibold text-slate-500 sm:text-sm">
        {label}
      </span>
    </article>
  );
}

type SummaryMemberProps = {
  member: Member;
  status: string;
  present?: boolean;
};

function SummaryMember({
  member,
  status,
  present = false,
}: SummaryMemberProps) {
  return (
    <article className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4">
      <div>
        <h3 className="font-bold">{member.fullName}</h3>

        <p className="text-sm text-slate-500">
          {member.familyName || "Sin familia"} · {member.organization}
        </p>
      </div>

      <span
        className={`rounded-full px-3 py-1 text-xs font-bold ${
          present
            ? "bg-emerald-100 text-emerald-800"
            : "bg-amber-100 text-amber-800"
        }`}
      >
        {status}
      </span>
    </article>
  );
}

function EmptyMessage({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
      {message}
    </div>
  );
}