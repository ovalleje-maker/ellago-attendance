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
import ErrorAlert from "@/components/ui/ErrorAlert";
import BishopDashboard from "@/components/dashboard/BishopDashboard";
import AppHeader from "@/components/layout/AppHeader";
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
import AppNavigation from "@/components/layout/AppNavigation";
import AttendanceSummaryView from "@/components/summary/AttendanceSummaryView";
import MembersView from "@/components/members/MembersView";
import AttendanceView from "@/components/attendance/AttendanceView";


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
     <AppHeader />

<AppNavigation
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>

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
  <AttendanceView
    meetingDate={meetingDate}
    attendanceSearch={
      attendanceSearch
    }
    members={members}
    filteredMembers={
      filteredAttendanceMembers
    }
    presentMembers={
      presentMembers
    }
    absentMembers={
      absentMembers
    }
    families={families}
    presentMemberIds={
      presentMemberIds
    }
    changingAttendance={
      changingAttendance
    }
    attendancePercentage={
      attendancePercentage
    }
    loadingMembers={
      loadingMembers
    }
    loadingAttendance={
      loadingAttendance
    }
    canRecordAttendance={
      canRecordAttendance
    }
    onMeetingDateChange={
      setMeetingDate
    }
    onSearchChange={
      setAttendanceSearch
    }
    onClearAttendance={
      clearMeetingAttendance
    }
    onToggleAttendance={
      toggleAttendance
    }
    onToggleFamily={
      markWholeFamily
    }
  />
)}

      {activeTab === "summary" && (
  <AttendanceSummaryView
    meetingDate={meetingDate}
    presentMembers={presentMembers}
    absentMembers={absentMembers}
    attendancePercentage={attendancePercentage}
  />
)}

{activeTab === "members" && (
  <MembersView
    members={members}
    filteredMembers={
      filteredDirectoryMembers
    }
    memberSearch={memberSearch}
    fullName={fullName}
    familyName={familyName}
    organization={organization}
    recentConvert={recentConvert}
    loadingMembers={loadingMembers}
    savingMember={savingMember}
    canManageMembers={
      canManageMembers
    }
    onSearchChange={
      setMemberSearch
    }
    onFullNameChange={
      setFullName
    }
    onFamilyNameChange={
      setFamilyName
    }
    onOrganizationChange={
      setOrganization
    }
    onRecentConvertChange={
      setRecentConvert
    }
    onAddMember={addMember}
    onDeleteMember={
      deleteMember
    }
  />
)}
      </div>
    </main>
  );
}